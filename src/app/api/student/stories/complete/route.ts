import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { storyCompletions, storyProgress } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { awardXP } from '@/lib/progression';

const completionSchema = z.object({
  storyId: z.string().uuid(),
  completionTime: z.number().int().min(0).optional(),
});

// POST /api/student/stories/complete - Mark story as complete
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { storyId, completionTime } = completionSchema.parse(body);

    // Check if already completed
    const existingCompletion = await db
      .select()
      .from(storyCompletions)
      .where(
        and(
          eq(storyCompletions.userId, user.id),
          eq(storyCompletions.storyId, storyId)
        )
      )
      .limit(1);

    if (existingCompletion.length) {
      return NextResponse.json(
        { error: 'Story already completed' },
        { status: 400 }
      );
    }

    // Calculate XP award (simplified: 10 XP per story)
    const xpAwarded = 10;

    // Create completion record
    const newCompletion = await db
      .insert(storyCompletions)
      .values({
        userId: user.id,
        storyId,
        completionTime: completionTime || 0,
        xpAwarded,
        completedAt: new Date(),
      })
      .returning();

    // Award XP to user
    await awardXP(user.id, xpAwarded);

    // Update progress to 100%
    await db
      .update(storyProgress)
      .set({
        completionPercentage: 100,
        completedAt: new Date(),
      })
      .where(
        and(
          eq(storyProgress.userId, user.id),
          eq(storyProgress.storyId, storyId)
        )
      );

    return NextResponse.json(newCompletion[0]);
  } catch (error) {
    console.error('Error completing story:', error);
    return NextResponse.json(
      { error: 'Failed to complete story' },
      { status: 500 }
    );
  }
}
