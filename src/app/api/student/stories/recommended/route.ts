import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { stories, storyRecommendations, storyCompletions, storyProgress } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

// GET /api/student/stories/recommended - Personalized recommendations
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
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get user's recommendations
    const recommendations = await db
      .select({
        id: stories.id,
        title: stories.title,
        slug: stories.slug,
        summary: stories.summary,
        coverImageUrl: stories.coverImageUrl,
        estimatedReadingTime: stories.estimatedReadingTime,
        difficultyLevel: stories.difficultyLevel,
        recommendationScore: storyRecommendations.recommendationScore,
        recommendationType: storyRecommendations.recommendationType,
      })
      .from(storyRecommendations)
      .innerJoin(stories, eq(storyRecommendations.storyId, stories.id))
      .where(
        and(
          eq(storyRecommendations.userId, user.id),
          eq(stories.status, 'published')
        )
      )
      .orderBy(desc(storyRecommendations.recommendationScore))
      .limit(limit);

    // If no recommendations exist, generate simple ones based on difficulty
    if (!recommendations.length) {
      const userCompletions = await db
        .select()
        .from(storyCompletions)
        .where(eq(storyCompletions.userId, user.id));

      // Get user's average difficulty level
      const avgDifficulty = userCompletions.length > 0
        ? 'intermediate' // Simplified logic
        : 'beginner';

      const fallbackStories = await db
        .select({
          id: stories.id,
          title: stories.title,
          slug: stories.slug,
          summary: stories.summary,
          coverImageUrl: stories.coverImageUrl,
          estimatedReadingTime: stories.estimatedReadingTime,
          difficultyLevel: stories.difficultyLevel,
          recommendationScore: sql<number>`0.5`,
          recommendationType: sql<string>`'difficulty_match'`,
        })
        .from(stories)
        .where(
          and(
            eq(stories.status, 'published'),
            eq(stories.difficultyLevel, avgDifficulty)
          )
        )
        .orderBy(desc(stories.publishedAt))
        .limit(limit);

      return NextResponse.json(fallbackStories);
    }

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
