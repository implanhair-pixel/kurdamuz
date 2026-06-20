import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { stories, storyFavorites } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/student/stories/favorites - User's favorite stories
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const favorites = await db
      .select({
        id: stories.id,
        title: stories.title,
        slug: stories.slug,
        summary: stories.summary,
        coverImageUrl: stories.coverImageUrl,
        difficultyLevel: stories.difficultyLevel,
        createdAt: storyFavorites.createdAt,
      })
      .from(storyFavorites)
      .innerJoin(stories, eq(storyFavorites.storyId, stories.id))
      .where(eq(storyFavorites.userId, user.id))
      .orderBy(desc(storyFavorites.createdAt))
      .limit(limit);

    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}
