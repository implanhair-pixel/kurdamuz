import { NextRequest, NextResponse } from 'next/server';
import { ScoringEngine } from '@/lib/placement/scoring';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await ScoringEngine.getPlacementResult(id);

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }

    // Check if user owns this result
    if (result.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error getting result:', error);
    return NextResponse.json(
      { error: 'Failed to get result' },
      { status: 500 }
    );
  }
}
