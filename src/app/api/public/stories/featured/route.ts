import { NextResponse } from 'next/server';
import { db } from '@/db';
import { stories } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET /api/public/stories/featured - Featured stories
export async function GET() {
  try {
    const featuredStories = await db
      .select({
        id: stories.id,
        title: stories.title,
        slug: stories.slug,
        summary: stories.summary,
        coverImageUrl: stories.coverImageUrl,
        estimatedReadingTime: stories.estimatedReadingTime,
        difficultyLevel: stories.difficultyLevel,
        isFeatured: stories.isFeatured,
        publishedAt: stories.publishedAt,
        createdAt: stories.createdAt,
      })
      .from(stories)
      .where(and(eq(stories.status, 'published'), eq(stories.isFeatured, true)))
      .orderBy(desc(stories.publishedAt))
      .limit(10);

    return NextResponse.json(featuredStories);
  } catch (error) {
    console.error('Error fetching featured stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured stories' },
      { status: 500 }
    );
  }
}
