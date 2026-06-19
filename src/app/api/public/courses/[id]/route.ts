import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .select(`
        *,
        category:categories(*),
        modules:course_modules(
          *,
          lessons:lessons(
            *,
            assets:lesson_assets(*),
            vocabulary:lesson_vocabulary(
              *,
              vocabulary:vocabulary(*)
            ),
            grammar:lesson_grammar(
              *,
              grammar_topic:grammar_topics(*)
            )
          )
        )
      `)
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (error || !course) {
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
