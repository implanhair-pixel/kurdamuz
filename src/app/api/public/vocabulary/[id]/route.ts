import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {

    const { data: vocabulary, error } = await supabaseAdmin
      .from('vocabulary')
      .select(`
        *,
        dialects:vocabulary_dialects(
          dialect:dialects(*)
        ),
        tags:vocabulary_tag_assignments(
          tag:vocabulary_tags(*)
        ),
        examples:vocabulary_examples(*),
        relations:vocabulary_relations(
          target_word:vocabulary(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Vocabulary fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vocabulary' },
        { status: 500 }
      );
    }

    if (!vocabulary) {
      return NextResponse.json(
        { error: 'Vocabulary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ vocabulary });
  } catch (error) {
    console.error('Vocabulary API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
