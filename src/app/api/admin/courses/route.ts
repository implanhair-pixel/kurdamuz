import { NextRequest, NextResponse } from 'next/server';
import { requireMinRole } from '@/lib/auth';
import { db } from '@/db';
import { courses } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { listCoursesWithModules } from '@/lib/courses/getCourseWithModules';

export async function GET(request: NextRequest) {
  try {
    await requireMinRole('admin_super');

    const allCourses = await listCoursesWithModules(false);
    const sorted = allCourses.sort(
      (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );

    return NextResponse.json({ courses: sorted });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Admin courses fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireMinRole('admin_super');
    const body = await request.json();
    const { title, slug, description, categoryId, difficultyLevel, thumbnailUrl, isPublished, price } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug' },
        { status: 400 }
      );
    }

    const [course] = await db
      .insert(courses)
      .values({
        title,
        slug,
        description,
        categoryId,
        difficultyLevel,
        thumbnailUrl,
        isPublished: isPublished || false,
        price: typeof price === 'number' ? price : 0,
      })
      .returning();

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Course creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
