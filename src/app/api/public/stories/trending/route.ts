import { NextResponse } from 'next/server';
import { db } from '@/db';
import { stories, storyCompletions } from '@/db/schema';
import { eq, desc, and, count, sql } from 'drizzle-orm';

// GET /api/public/stories/trending - Trending stories (based on completions)
export async function GET() {
  try {
    // Get stories with most completions in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendingStories = await db
      .select({
        id: stories.id,
        title: stories.title,
        slug: stories.slug,
        summary: stories.summary,
        coverImageUrl: stories.coverImageUrl,
        estimatedReadingTime: stories.estimatedReadingTime,
        difficultyLevel: stories.difficultyLevel,
        publishedAt: stories.publishedAt,
        createdAt: stories.createdAt,
        completionCount: count(storyCompletions.id),
      })
      .from(stories)
      .leftJoin(
        storyCompletions,
        and(
          eq(stories.id, storyCompletions.storyId),
          sql`${storyCompletions.completedAt} >= ${thirtyDaysAgo}`
        )
      )
      .where(eq(stories.status, 'published'))
      .groupBy(stories.id)
      .orderBy(desc(count(storyCompletions.id)))
      .limit(10);

    return NextResponse.json(trendingStories);
  } catch (error) {
    console.error('Error fetching trending stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending stories' },
      { status: 500 }
    );
  }
}
