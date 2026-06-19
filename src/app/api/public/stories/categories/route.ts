import { NextResponse } from 'next/server';
import { db } from '@/db';
import { storyCategories, storyCategoryAssignments } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

// GET /api/public/stories/categories - Category listing
export async function GET() {
  try {
    const categories = await db
      .select({
        id: storyCategories.id,
        name: storyCategories.name,
        slug: storyCategories.slug,
        description: storyCategories.description,
        createdAt: storyCategories.createdAt,
      })
      .from(storyCategories)
      .orderBy(desc(storyCategories.createdAt));

    // Get story count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(storyCategoryAssignments)
          .where(eq(storyCategoryAssignments.categoryId, category.id));

        return {
          ...category,
          storyCount: countResult[0]?.count || 0,
        };
      })
    );

    return NextResponse.json(categoriesWithCount);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
