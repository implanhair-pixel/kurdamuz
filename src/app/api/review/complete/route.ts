import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { completeReviewSessionSchema } from '@/types/review';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = completeReviewSessionSchema.parse(body);

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');

    // Get session details
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('review_sessions')
      .select('*')
      .eq('id', validatedData.sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !session) {
      console.error('Fetch session error:', sessionError);
      return NextResponse.json(
        { error: 'Review session not found' },
        { status: 404 }
      );
    }

    // Update session with completion time
    const { data: updatedSession, error: updateError } = await supabaseAdmin
      .from('review_sessions')
      .update({
        completed_at: new Date().toISOString(),
      })
      .eq('id', validatedData.sessionId)
      .select()
      .single();

    if (updateError) {
      console.error('Complete session error:', updateError);
      return NextResponse.json(
        { error: 'Failed to complete review session' },
        { status: 500 }
      );
    }

    // Get session statistics
    const { data: attempts, error: attemptsError } = await supabaseAdmin
      .from('review_attempts')
      .select('*')
      .eq('session_id', validatedData.sessionId);

    if (attemptsError) {
      console.error('Fetch attempts error:', attemptsError);
      return NextResponse.json(
        { error: 'Failed to fetch session statistics' },
        { status: 500 }
      );
    }

    const correctAnswers = attempts?.filter((a: any) => a.response_quality >= 3).length || 0;
    const accuracy = attempts?.length > 0 ? (correctAnswers / attempts.length) * 100 : 0;

    return NextResponse.json({ 
      session: updatedSession,
      statistics: {
        totalAttempts: attempts?.length || 0,
        correctAnswers,
        accuracy: Math.round(accuracy),
      }
    });
  } catch (error) {
    console.error('Complete review session API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
