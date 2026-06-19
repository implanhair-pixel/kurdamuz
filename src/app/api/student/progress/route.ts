import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { data: progress, error } = await supabaseAdmin
      .from('user_progress')
      .select(`
        *,
        lesson:lessons(
          *,
          module:course_modules(
            *,
            course:courses(*)
          )
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      );
    }

    return NextResponse.json({ progress });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Progress fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { lessonId, status, completionPercentage, score } = body;

    if (!lessonId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: lessonId, status' },
        { status: 400 }
      );
    }

    const { data: progress, error } = await supabaseAdmin
      .from('user_progress')
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        status,
        completion_percentage: completionPercentage || 0,
        score,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      );
    }

    // If lesson completed, award XP
    if (status === 'completed') {
      const { data: lesson } = await supabaseAdmin
        .from('lessons')
        .select('xp_reward')
        .eq('id', lessonId)
        .single();

      if (lesson?.xp_reward) {
        // Update user XP (you would need a user_xp table or user metadata)
        // For now, this is a placeholder for XP logic
      }
    }

    return NextResponse.json({ progress });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Progress update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
