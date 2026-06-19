import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const dialect = searchParams.get('dialect');
    const difficulty = searchParams.get('difficulty');

    let query = supabaseAdmin
      .from('courses')
      .select(`
        *,
        category:categories(*),
        modules:course_modules(
          *,
          lessons:lessons(*)
        )
      `)
      .eq('is_published', true);

    if (category) {
      query = query.eq('category_id', category);
    }

    if (difficulty) {
      query = query.eq('difficulty_level', difficulty);
    }

    const { data: courses, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: 500 }
      );
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
