import { NextResponse } from 'next/server';
import { getCurrentUser, requireMinRole } from '@/lib/auth';
import { db } from '@/db';
import { stories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const storySchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  summary: z.string().optional(),
  content: z.string().min(1),
  coverImageUrl: z.string().url().optional(),
  estimatedReadingTime: z.number().int().min(0).optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  status: z.enum(['draft', 'published', 'archived']),
  isFeatured: z.boolean().optional(),
  publishedAt: z.string().datetime().optional(),
});

// POST /api/admin/stories - Create story
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isAdmin = await requireMinRole('admin');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = storySchema.parse(body);

    const newStory = await db
      .insert(stories)
      .values({
        ...validatedData,
        publishedAt: validatedData.publishedAt ? new Date(validatedData.publishedAt) : null,
      })
      .returning();

    return NextResponse.json(newStory[0], { status: 201 });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    );
  }
}

// GET /api/admin/stories - List all stories (including drafts)
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isAdmin = await requireMinRole('admin');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const conditions = [];
    if (status) {
      conditions.push(eq(stories.status, status));
    }

    const storiesData = await db
      .select()
      .from(stories)
      .where(conditions.length ? conditions[0] : undefined)
      .orderBy(stories.createdAt)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      stories: storiesData,
      pagination: {
        page,
        limit,
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
