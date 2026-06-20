// src/app/api/challenges/definitions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { challengeDefinitions } from '@/db/schema';
import { createChallengeDefinitionSchema } from '@/lib/validations/challenges';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// GET /api/challenges/definitions - List all definitions (admin/teacher)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const challengeType = searchParams.get('challengeType');

    const conditions = [];
    
    if (status) {
      conditions.push(eq(challengeDefinitions.status, status));
    }

    if (challengeType) {
      conditions.push(eq(challengeDefinitions.challengeType, challengeType));
    }

    const definitions = await db
      .select()
      .from(challengeDefinitions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(challengeDefinitions.createdAt))
      .limit(50);

    return NextResponse.json({ definitions });
  } catch (error) {
    console.error('Error fetching challenge definitions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/challenges/definitions - Create definition (admin/teacher)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createChallengeDefinitionSchema.parse(body);

    const [definition] = await db.insert(challengeDefinitions).values({
      ...validatedData,
      createdBy: user.id,
    }).returning();

    return NextResponse.json({ definition }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: (error as any).errors },
        { status: 400 }
      );
    }
    console.error('Error creating challenge definition:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
