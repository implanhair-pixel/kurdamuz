import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { startReviewSessionSchema } from '@/types/review';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = startReviewSessionSchema.parse(body);

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');

    // Create review session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('review_sessions')
      .insert({
        user_id: userId,
        total_words: validatedData.vocabularyIds.length,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Create review session error:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create review session' },
        { status: 500 }
      );
    }

    // Fetch vocabulary for review
    const { data: vocabulary, error: vocabError } = await supabaseAdmin
      .from('vocabulary')
      .select(`
        *,
        dialects:vocabulary_dialects(
          dialect:dialects(*)
        ),
        examples:vocabulary_examples(*)
      `)
      .in('id', validatedData.vocabularyIds);

    if (vocabError) {
      console.error('Fetch vocabulary for review error:', vocabError);
      return NextResponse.json(
        { error: 'Failed to fetch vocabulary for review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      session, 
      vocabulary: vocabulary || [] 
    }, { status: 201 });
  } catch (error) {
    console.error('Start review session API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
