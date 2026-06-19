import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { storyFavorites } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const favoriteSchema = z.object({
  storyId: z.string().uuid(),
});

// POST /api/student/stories/favorite - Add to favorites
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
    const { storyId } = favoriteSchema.parse(body);

    // Check if already favorited
    const existingFavorite = await db
      .select()
      .from(storyFavorites)
      .where(
        and(
          eq(storyFavorites.userId, user.id),
          eq(storyFavorites.storyId, storyId)
        )
      )
      .limit(1);

    if (existingFavorite.length) {
      return NextResponse.json(
        { error: 'Story already favorited' },
        { status: 400 }
      );
    }

    const newFavorite = await db
      .insert(storyFavorites)
      .values({
        userId: user.id,
        storyId,
      })
      .returning();

    return NextResponse.json(newFavorite[0]);
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

// DELETE /api/student/stories/favorite - Remove from favorites
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
    const { storyId } = favoriteSchema.parse(body);

    await db
      .delete(storyFavorites)
      .where(
        and(
          eq(storyFavorites.userId, user.id),
          eq(storyFavorites.storyId, storyId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}
