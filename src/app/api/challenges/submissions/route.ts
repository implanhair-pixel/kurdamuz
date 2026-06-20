// src/app/api/challenges/submissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { challengeSubmissions, challengeSchedules } from '@/db/schema';
import { submitChallengeSchema } from '@/lib/validations/challenges';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// GET /api/challenges/submissions - List user submissions
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scheduleId = searchParams.get('scheduleId');
    const status = searchParams.get('status');

    const conditions = [eq(challengeSubmissions.userId, user.id)];
    
    if (scheduleId) {
      conditions.push(eq(challengeSubmissions.scheduleId, scheduleId));
    }

    if (status) {
      conditions.push(eq(challengeSubmissions.status, status));
    }

    const submissions = await db
      .select()
      .from(challengeSubmissions)
      .where(and(...conditions))
      .orderBy(desc(challengeSubmissions.submittedAt))
      .limit(50);

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching challenge submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/challenges/submissions - Submit challenge
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = submitChallengeSchema.parse(body);

    // Check if schedule exists and is active
    const schedule = await db.query.challengeSchedules.findFirst({
      where: eq(challengeSchedules.id, validatedData.scheduleId),
    });

    if (!schedule || schedule.status !== 'active') {
      return NextResponse.json(
        { error: 'Challenge not available' },
        { status: 400 }
      );
    }

    // Check if challenge has ended
    if (schedule.endDate && new Date() > new Date(schedule.endDate)) {
      return NextResponse.json(
        { error: 'Challenge has ended' },
        { status: 400 }
      );
    }

    // Create submission
    const [submission] = await db.insert(challengeSubmissions).values({
      scheduleId: validatedData.scheduleId,
      userId: user.id,
      submissionData: validatedData.submissionData,
      timeTaken: validatedData.timeTaken,
      status: 'pending',
    }).returning();

    return NextResponse.json({ submissionId: submission.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: (error as any).errors },
        { status: 400 }
      );
    }
    console.error('Error submitting challenge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
