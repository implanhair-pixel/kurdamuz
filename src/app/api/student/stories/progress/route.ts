import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { storyProgress } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const progressSchema = z.object({
  storyId: z.string().uuid(),
  completionPercentage: z.number().int().min(0).max(100),
  lastPosition: z.number().int().min(0).optional(),
});

// POST /api/student/stories/progress - Update reading progress
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
    const { storyId, completionPercentage, lastPosition } = progressSchema.parse(body);

    // Check if progress exists
    const existingProgress = await db
      .select()
      .from(storyProgress)
      .where(
        and(
          eq(storyProgress.userId, user.id),
          eq(storyProgress.storyId, storyId)
        )
      )
      .limit(1);

    if (existingProgress.length) {
      // Update existing progress
      const updatedProgress = await db
        .update(storyProgress)
        .set({
          completionPercentage,
          lastPosition: lastPosition || existingProgress[0].lastPosition,
          lastReadAt: new Date(),
          completedAt: completionPercentage >= 100 ? new Date() : null,
        })
        .where(eq(storyProgress.id, existingProgress[0].id))
        .returning();

      return NextResponse.json(updatedProgress[0]);
    } else {
      // Create new progress
      const newProgress = await db
        .insert(storyProgress)
        .values({
          userId: user.id,
          storyId,
          completionPercentage,
          lastPosition,
          startedAt: new Date(),
          lastReadAt: new Date(),
          completedAt: completionPercentage >= 100 ? new Date() : null,
        })
        .returning();

      return NextResponse.json(newProgress[0]);
    }
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
