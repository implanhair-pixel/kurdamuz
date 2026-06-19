import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data: dialects, error } = await supabaseAdmin
      .from('dialects')
      .select('*')
      .order('name');

    if (error) {
      console.error('Dialects fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch dialects' },
        { status: 500 }
      );
    }

    return NextResponse.json({ dialects });
  } catch (error) {
    console.error('Dialects API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
