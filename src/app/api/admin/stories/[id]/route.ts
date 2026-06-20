import { NextResponse } from 'next/server';
import { getCurrentUser, requireMinRole } from '@/lib/auth';
import { db } from '@/db';
import { stories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const storyUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  summary: z.string().optional(),
  content: z.string().min(1).optional(),
  coverImageUrl: z.string().url().optional(),
  estimatedReadingTime: z.number().int().min(0).optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  isFeatured: z.boolean().optional(),
  publishedAt: z.string().datetime().optional(),
});

// PUT /api/admin/stories/[id] - Update story
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isAdmin = await requireMinRole('admin_super');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = storyUpdateSchema.parse(body);

    const updatedStory = await db
      .update(stories)
      .set({
        ...validatedData,
        publishedAt: validatedData.publishedAt ? new Date(validatedData.publishedAt) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(stories.id, id))
      .returning();

    if (!updatedStory.length) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedStory[0]);
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json(
      { error: 'Failed to update story' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/stories/[id] - Delete story
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isAdmin = await requireMinRole('admin_super');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const deletedStory = await db
      .delete(stories)
      .where(eq(stories.id, id))
      .returning();

    if (!deletedStory.length) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { error: 'Failed to delete story' },
      { status: 500 }
    );
  }
}
