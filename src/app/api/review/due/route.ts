import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getDueForReviewSchema } from '@/types/review';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const dialectId = searchParams.get('dialectId');
    const difficultyLevel = searchParams.get('difficultyLevel');

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');

    // Build query for vocabulary due for review
    let query = supabaseAdmin
      .from('vocabulary_progress')
      .select(`
        *,
        vocabulary:vocabulary(*)
      `)
      .eq('user_id', userId)
      .lte('next_review_at', new Date().toISOString())
      .order('next_review_at', { ascending: true })
      .limit(limit);

    // Apply filters
    if (dialectId) {
      // Would need to join with vocabulary_dialects
      // For now, skip this filter
    }

    if (difficultyLevel) {
      query = query.eq('vocabulary.difficulty_level', difficultyLevel);
    }

    const { data: progress, error } = await query;

    if (error) {
      console.error('Due for review fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch due vocabulary' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      vocabulary: progress?.map((p: any) => p.vocabulary) || [],
      count: progress?.length || 0 
    });
  } catch (error) {
    console.error('Due for review API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
