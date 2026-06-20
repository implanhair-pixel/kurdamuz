import { NextResponse } from 'next/server';
import { db } from '@/db';
import { stories, storyCategories, storyCategoryAssignments, storyTags, storyTagAssignments, storyDialects, dialects } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/public/stories/[slug] - Single story retrieval
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {

    // Fetch story with categories, tags, and dialects
    const storyData = await db
      .select({
        id: stories.id,
        title: stories.title,
        slug: stories.slug,
        summary: stories.summary,
        content: stories.content,
        coverImageUrl: stories.coverImageUrl,
        estimatedReadingTime: stories.estimatedReadingTime,
        difficultyLevel: stories.difficultyLevel,
        status: stories.status,
        isFeatured: stories.isFeatured,
        publishedAt: stories.publishedAt,
        createdAt: stories.createdAt,
        updatedAt: stories.updatedAt,
      })
      .from(stories)
      .where(eq(stories.slug, slug))
      .limit(1);

    if (!storyData.length) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    const story = storyData[0];

    // Only return published stories
    if (story.status !== 'published') {
      return NextResponse.json(
        { error: 'Story not available' },
        { status: 403 }
      );
    }

    // Fetch categories
    const categories = await db
      .select({
        id: storyCategories.id,
        name: storyCategories.name,
        slug: storyCategories.slug,
      })
      .from(storyCategories)
      .innerJoin(
        storyCategoryAssignments,
        eq(storyCategories.id, storyCategoryAssignments.categoryId)
      )
      .where(eq(storyCategoryAssignments.storyId, story.id));

    // Fetch tags
    const tags = await db
      .select({
        id: storyTags.id,
        name: storyTags.name,
        slug: storyTags.slug,
      })
      .from(storyTags)
      .innerJoin(
        storyTagAssignments,
        eq(storyTags.id, storyTagAssignments.tagId)
      )
      .where(eq(storyTagAssignments.storyId, story.id));

    // Fetch dialects
    const dialectsData = await db
      .select({
        id: dialects.id,
        name: dialects.name,
        code: dialects.code,
      })
      .from(dialects)
      .innerJoin(
        storyDialects,
        eq(dialects.id, storyDialects.dialectId)
      )
      .where(eq(storyDialects.storyId, story.id));

    return NextResponse.json({
      ...story,
      categories,
      tags,
      dialects: dialectsData,
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 }
    );
  }
}
