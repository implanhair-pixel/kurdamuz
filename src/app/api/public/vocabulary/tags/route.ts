import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data: tags, error } = await supabaseAdmin
      .from('vocabulary_tags')
      .select('*')
      .order('name');

    if (error) {
      console.error('Tags fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tags' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Tags API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
