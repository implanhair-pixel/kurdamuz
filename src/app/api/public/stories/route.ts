import { NextResponse } from 'next/server';
import { db } from '@/db';
import { stories, storyCategories, storyCategoryAssignments, storyTags, storyTagAssignments } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { z } from 'zod';

// Query schema for validation
const storiesQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  category: z.string().optional(),
  difficulty: z.string().optional(),
  search: z.string().optional(),
  featured: z.string().optional(),
});

// GET /api/public/stories - Story discovery with pagination, filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = storiesQuerySchema.parse(Object.fromEntries(searchParams));

    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [
      eq(stories.status, 'published'),
    ];

    if (query.category) {
      conditions.push(
        sql`${storyCategories.slug} = ${query.category}`
      );
    }

    if (query.difficulty) {
      conditions.push(eq(stories.difficultyLevel, query.difficulty));
    }

    if (query.search) {
      conditions.push(
        sql`${stories.title} ILIKE ${`%${query.search}%`} OR ${stories.summary} ILIKE ${`%${query.search}%`}`
      );
    }

    if (query.featured === 'true') {
      conditions.push(eq(stories.isFeatured, true));
    }

    // Fetch stories with categories and tags
    const storiesData = await db
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
      .leftJoin(
        storyCategoryAssignments,
        eq(stories.id, storyCategoryAssignments.storyId)
      )
      .leftJoin(
        storyCategories,
        eq(storyCategoryAssignments.categoryId, storyCategories.id)
      )
      .where(and(...conditions))
      .orderBy(desc(stories.publishedAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(stories)
      .where(and(...conditions.slice(0, 1))); // Only use status filter for count

    return NextResponse.json({
      stories: storiesData,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}
