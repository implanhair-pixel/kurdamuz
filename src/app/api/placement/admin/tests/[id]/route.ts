import { NextRequest, NextResponse } from 'next/server';
import { AssessmentManager } from '@/lib/placement/assessments';
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

    // TODO: Check if user has admin role
    // For now, skip RBAC check

    const assessment = await AssessmentManager.getById(id);

    if (!assessment) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    const sections = await AssessmentManager.getSections(id);

    return NextResponse.json({ assessment, sections });
  } catch (error) {
    console.error('Error getting test:', error);
    return NextResponse.json(
      { error: 'Failed to get test' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Check if user has admin role
    // For now, skip RBAC check

    const body = await request.json();
    // Update assessment (would need update method in AssessmentManager)
    // For now, return not implemented
    return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
  } catch (error) {
    console.error('Error updating test:', error);
    return NextResponse.json(
      { error: 'Failed to update test' },
      { status: 500 }
    );
  }
}
