import { NextRequest, NextResponse } from 'next/server';
import { AssessmentManager } from '@/lib/placement/assessments';
import { QuestionBank } from '@/lib/placement/question-bank';
import { createClient } from '@supabase/supabase-js';

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

    const body = await request.json();
    const { testId } = body;

    if (!testId) {
      return NextResponse.json({ error: 'testId is required' }, { status: 400 });
    }

    // Start the attempt
    const attempt = await AssessmentManager.startAttempt({
      userId: user.id,
      testId,
    });

    // Get questions for the test
    const skillDomains = ['reading', 'writing', 'listening', 'speaking', 'grammar', 'vocabulary'] as import('@/lib/placement/question-bank/types').SkillDomain[];
    const questions = await QuestionBank.getRandomQuestions(skillDomains, 10);

    return NextResponse.json({
      attempt,
      questions,
    });
  } catch (error) {
    console.error('Error starting attempt:', error);
    return NextResponse.json(
      { error: 'Failed to start attempt' },
      { status: 500 }
    );
  }
}
