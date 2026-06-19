import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createUserVocabularySchema } from '@/types/vocabulary';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createUserVocabularySchema.parse(body);

    // Get user from session (you'll need to implement auth check)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract user ID from token (simplified - implement proper JWT validation)
    const userId = authHeader.replace('Bearer ', '');

    // Check if vocabulary already saved
    const { data: existing } = await supabaseAdmin
      .from('user_vocabulary')
      .select('*')
      .eq('user_id', userId)
      .eq('vocabulary_id', validatedData.vocabularyId)
      .single();

    if (existing) {
      // Update existing entry
      const { data: updated, error } = await supabaseAdmin
        .from('user_vocabulary')
        .update({
          is_favorite: validatedData.isFavorite ?? existing.is_favorite,
          notes: validatedData.notes ?? existing.notes,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Update user vocabulary error:', error);
        return NextResponse.json(
          { error: 'Failed to update saved vocabulary' },
          { status: 500 }
        );
      }

      return NextResponse.json({ userVocabulary: updated });
    }

    // Create new entry
    const { data: userVocabulary, error } = await supabaseAdmin
      .from('user_vocabulary')
      .insert({
        user_id: userId,
        vocabulary_id: validatedData.vocabularyId,
        is_favorite: validatedData.isFavorite || false,
        notes: validatedData.notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Save vocabulary error:', error);
      return NextResponse.json(
        { error: 'Failed to save vocabulary' },
        { status: 500 }
      );
    }

    return NextResponse.json({ userVocabulary }, { status: 201 });
  } catch (error) {
    console.error('Save vocabulary API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vocabularyId = searchParams.get('vocabularyId');

    if (!vocabularyId) {
      return NextResponse.json(
        { error: 'vocabularyId is required' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');

    const { error } = await supabaseAdmin
      .from('user_vocabulary')
      .delete()
      .eq('user_id', userId)
      .eq('vocabulary_id', vocabularyId);

    if (error) {
      console.error('Delete saved vocabulary error:', error);
      return NextResponse.json(
        { error: 'Failed to remove saved vocabulary' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete saved vocabulary API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
