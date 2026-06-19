// src/app/api/challenges/definitions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { challengeDefinitions } from '@/db/schema';
import { updateChallengeDefinitionSchema } from '@/lib/validations/challenges';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// GET /api/challenges/definitions/:id - Get single definition
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const definition = await db.query.challengeDefinitions.findFirst({
      where: eq(challengeDefinitions.id, id),
    });

    if (!definition) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ definition });
  } catch (error) {
    console.error('Error fetching challenge definition:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/challenges/definitions/:id - Update definition (admin/teacher)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateChallengeDefinitionSchema.parse({
      ...body,
      id: id,
    });

    const [definition] = await db
      .update(challengeDefinitions)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(challengeDefinitions.id, id))
      .returning();

    if (!definition) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ definition });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: (error as any).errors },
        { status: 400 }
      );
    }
    console.error('Error updating challenge definition:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/challenges/definitions/:id - Delete definition (admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [definition] = await db
      .delete(challengeDefinitions)
      .where(eq(challengeDefinitions.id, id))
      .returning();

    if (!definition) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting challenge definition:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
