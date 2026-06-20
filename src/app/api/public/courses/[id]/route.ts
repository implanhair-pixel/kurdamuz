import { NextRequest, NextResponse } from 'next/server';
import { getCourseWithModules } from '@/lib/courses/getCourseWithModules';

// GET /api/public/courses/:id — single published course, sourced from Neon/Drizzle.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const course = await getCourseWithModules(id);

    if (!course || !course.isPublished) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error('Course fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
