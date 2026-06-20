// src/app/api/challenges/schedules/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { challengeSchedules, challengeDefinitions } from '@/db/schema';
import { createChallengeScheduleSchema } from '@/lib/validations/challenges';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// GET /api/challenges/schedules - List schedules (filtered by date/status)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const conditions = [];
    
    if (status) {
      conditions.push(eq(challengeSchedules.status, status));
    }

    if (startDate) {
      conditions.push(gte(challengeSchedules.scheduledDate, startDate as any));
    }

    if (endDate) {
      conditions.push(lte(challengeSchedules.scheduledDate, endDate as any));
    }

    const schedules = await db
      .select({
        schedule: challengeSchedules,
        definition: challengeDefinitions,
      })
      .from(challengeSchedules)
      .leftJoin(
        challengeDefinitions,
        eq(challengeSchedules.challengeDefinitionId, challengeDefinitions.id)
      )
      .$dynamic().where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(challengeSchedules.scheduledDate))
      .limit(50);

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Error fetching challenge schedules:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/challenges/schedules - Create schedule (admin/teacher)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createChallengeScheduleSchema.parse(body);

    const [schedule] = await (db.insert(challengeSchedules) as any).values({
      ...validatedData,
    }).returning();

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: (error as any).errors },
        { status: 400 }
      );
    }
    console.error('Error creating challenge schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
