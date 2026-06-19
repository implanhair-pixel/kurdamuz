import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { storyBookmarks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const bookmarkSchema = z.object({
  storyId: z.string().uuid(),
  bookmarkPosition: z.number().int().min(0),
});

// POST /api/student/stories/bookmark - Create/update bookmark
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
    const { storyId, bookmarkPosition } = bookmarkSchema.parse(body);

    // Check if bookmark exists
    const existingBookmark = await db
      .select()
      .from(storyBookmarks)
      .where(
        and(
          eq(storyBookmarks.userId, user.id),
          eq(storyBookmarks.storyId, storyId)
        )
      )
      .limit(1);

    if (existingBookmark.length) {
      // Update existing bookmark
      const updatedBookmark = await db
        .update(storyBookmarks)
        .set({
          bookmarkPosition,
          updatedAt: new Date(),
        })
        .where(eq(storyBookmarks.id, existingBookmark[0].id))
        .returning();

      return NextResponse.json(updatedBookmark[0]);
    } else {
      // Create new bookmark
      const newBookmark = await db
        .insert(storyBookmarks)
        .values({
          userId: user.id,
          storyId,
          bookmarkPosition,
        })
        .returning();

      return NextResponse.json(newBookmark[0]);
    }
  } catch (error) {
    console.error('Error saving bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to save bookmark' },
      { status: 500 }
    );
  }
}
