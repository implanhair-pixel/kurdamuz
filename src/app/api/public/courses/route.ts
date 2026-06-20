import { NextRequest, NextResponse } from 'next/server';
import { listCoursesWithModules } from '@/lib/courses/getCourseWithModules';

// GET /api/public/courses — published course catalog, sourced from Neon/Drizzle.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    const category = searchParams.get('category');

    let courses = await listCoursesWithModules(true);

    if (difficulty) {
      courses = courses.filter((c) => c.difficultyLevel === difficulty);
    }
    if (category) {
      courses = courses.filter((c) => c.categoryId === category);
    }

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Courses fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
