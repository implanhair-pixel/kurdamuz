import { NextRequest, NextResponse } from 'next/server';
import { QuestionBank } from '@/lib/placement/question-bank';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const skillDomain = searchParams.get('skillDomain');
    const difficultyLevel = searchParams.get('difficultyLevel');
    const questionType = searchParams.get('questionType');

    const filter: any = {};
    if (skillDomain) filter.skillDomain = skillDomain;
    if (difficultyLevel) filter.difficultyLevel = difficultyLevel;
    if (questionType) filter.questionType = questionType;

    const questions = await QuestionBank.getByFilter(filter);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error getting questions:', error);
    return NextResponse.json(
      { error: 'Failed to get questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const question = await QuestionBank.create(body);

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}
