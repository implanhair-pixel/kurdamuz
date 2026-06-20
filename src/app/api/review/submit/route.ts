import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { db } from '@/db';
import { reviewSessions } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { submitReviewAttemptSchema, calculateNextReview } from '@/types/review';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = submitReviewAttemptSchema.parse(body);

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');

    // Get current progress for this vocabulary
    const { data: currentProgress, error: progressError } = await supabaseAdmin
      .from('vocabulary_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('vocabulary_id', validatedData.vocabularyId)
      .single();

    if (progressError && progressError.code !== 'PGRST116') {
      console.error('Fetch progress error:', progressError);
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      );
    }

    // Calculate next review date and mastery score
    const progressData = currentProgress || {
      id: '',
      userId,
      vocabularyId: validatedData.vocabularyId,
      masteryScore: 0,
      reviewCount: 0,
      correctCount: 0,
      incorrectCount: 0,
    };

    const { nextReviewAt, masteryScore } = calculateNextReview(
      progressData,
      validatedData.responseQuality as any
    );

    // Update or create progress
    const progressUpdate = {
      mastery_score: masteryScore,
      review_count: (currentProgress?.review_count || 0) + 1,
      correct_count: (currentProgress?.correct_count || 0) + (validatedData.responseQuality >= 3 ? 1 : 0),
      incorrect_count: (currentProgress?.incorrect_count || 0) + (validatedData.responseQuality < 3 ? 1 : 0),
      last_reviewed_at: new Date().toISOString(),
      next_review_at: nextReviewAt.toISOString(),
    };

    let updatedProgress;
    if (currentProgress) {
      const { data, error } = await supabaseAdmin
        .from('vocabulary_progress')
        .update(progressUpdate)
        .eq('id', currentProgress.id)
        .select()
        .single();
      
      if (error) {
        console.error('Update progress error:', error);
        return NextResponse.json(
          { error: 'Failed to update progress' },
          { status: 500 }
        );
      }
      updatedProgress = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('vocabulary_progress')
        .insert({
          user_id: userId,
          vocabulary_id: validatedData.vocabularyId,
          ...progressUpdate,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Create progress error:', error);
        return NextResponse.json(
          { error: 'Failed to create progress' },
          { status: 500 }
        );
      }
      updatedProgress = data;
    }

    // Create review attempt
    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from('review_attempts')
      .insert({
        session_id: validatedData.sessionId,
        vocabulary_id: validatedData.vocabularyId,
        response_quality: validatedData.responseQuality,
      })
      .select()
      .single();

    if (attemptError) {
      console.error('Create review attempt error:', attemptError);
      return NextResponse.json(
        { error: 'Failed to record review attempt' },
        { status: 500 }
      );
    }

    // Update session correct answers count in Neon/Drizzle instead of relying on a Supabase RPC.
    if (validatedData.responseQuality >= 3) {
      await db
        .update(reviewSessions)
        .set({
          correctAnswers: sql`${reviewSessions.correctAnswers} + 1`,
        })
        .where(eq(reviewSessions.id, validatedData.sessionId));
    }

    return NextResponse.json({ 
      attempt, 
      progress: updatedProgress 
    });
  } catch (error) {
    console.error('Submit review API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
