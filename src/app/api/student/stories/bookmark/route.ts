import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { storyBookmarks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const bookmarkSchema = z.object({
  storyId: z.string().uuid(),
  bookmarkPosition: z.number().int().min(0).optional().default(0),
});

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get('storyId');

    if (!storyId) {
      return NextResponse.json({ error: 'storyId is required' }, { status: 400 });
    }

    const rows = await db
      .select()
      .from(storyBookmarks)
      .where(
        and(
          eq(storyBookmarks.userId, user.id),
          eq(storyBookmarks.storyId, storyId)
        )
      )
      .limit(1);

    return NextResponse.json(rows[0] || null);
  } catch (error) {
    console.error('Error fetching bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmark' },
      { status: 500 }
    );
  }
}

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
      const updatedBookmark = await db
        .update(storyBookmarks)
        .set({
          bookmarkPosition,
          updatedAt: new Date(),
        })
        .where(eq(storyBookmarks.id, existingBookmark[0].id))
        .returning();

      return NextResponse.json(updatedBookmark[0]);
    }

    const newBookmark = await db
      .insert(storyBookmarks)
      .values({
        userId: user.id,
        storyId,
        bookmarkPosition,
      })
      .returning();

    return NextResponse.json(newBookmark[0]);
  } catch (error) {
    console.error('Error saving bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to save bookmark' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { storyId } = bookmarkSchema.pick({ storyId: true }).parse(body);

    await db
      .delete(storyBookmarks)
      .where(
        and(
          eq(storyBookmarks.userId, user.id),
          eq(storyBookmarks.storyId, storyId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to remove bookmark' },
      { status: 500 }
    );
  }
}
