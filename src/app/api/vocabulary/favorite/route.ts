import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { toggleFavoriteSchema } from '@/types/vocabulary';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = toggleFavoriteSchema.parse(body);

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');

    // Check if vocabulary is saved
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
        .update({ is_favorite: validatedData.isFavorite })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Update favorite error:', error);
        return NextResponse.json(
          { error: 'Failed to update favorite' },
          { status: 500 }
        );
      }

      return NextResponse.json({ userVocabulary: updated });
    }

    // Create new entry with favorite status
    const { data: userVocabulary, error } = await supabaseAdmin
      .from('user_vocabulary')
      .insert({
        user_id: userId,
        vocabulary_id: validatedData.vocabularyId,
        is_favorite: validatedData.isFavorite,
      })
      .select()
      .single();

    if (error) {
      console.error('Add favorite error:', error);
      return NextResponse.json(
        { error: 'Failed to add favorite' },
        { status: 500 }
      );
    }

    return NextResponse.json({ userVocabulary }, { status: 201 });
  } catch (error) {
    console.error('Favorite API error:', error);
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
      .update({ is_favorite: false })
      .eq('user_id', userId)
      .eq('vocabulary_id', vocabularyId);

    if (error) {
      console.error('Remove favorite error:', error);
      return NextResponse.json(
        { error: 'Failed to remove favorite' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove favorite API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
