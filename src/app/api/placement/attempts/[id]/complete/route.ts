import { NextRequest, NextResponse } from 'next/server';
import { AssessmentManager } from '@/lib/placement/assessments';
import { ScoringEngine } from '@/lib/placement/scoring';
import { ProficiencyClassifier } from '@/lib/placement/proficiency';
import { createClient } from '@supabase/supabase-js';

export async function POST(
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

    // Score the attempt
    const overallScore = await ScoringEngine.scoreAttempt(id);

    // Classify proficiency
    const placementResult = ProficiencyClassifier.generatePlacementResult(
      overallScore.percentage,
      {
        reading: overallScore.domainScores.find(ds => ds.domain === 'reading')?.percentage || 0,
        writing: overallScore.domainScores.find(ds => ds.domain === 'writing')?.percentage || 0,
        listening: overallScore.domainScores.find(ds => ds.domain === 'listening')?.percentage || 0,
        speaking: overallScore.domainScores.find(ds => ds.domain === 'speaking')?.percentage || 0,
        grammar: overallScore.domainScores.find(ds => ds.domain === 'grammar')?.percentage || 0,
        vocabulary: overallScore.domainScores.find(ds => ds.domain === 'vocabulary')?.percentage || 0,
      }
    );

    // Complete the attempt
    const attempt = await AssessmentManager.completeAttempt(
      id,
      overallScore.percentage,
      placementResult.recommendedLevel
    );

    // Create placement result
    await ScoringEngine.createPlacementResult(
      id,
      user.id,
      overallScore,
      placementResult.recommendedLevel
    );

    return NextResponse.json({
      attempt,
      overallScore,
      placementResult,
    });
  } catch (error) {
    console.error('Error completing attempt:', error);
    return NextResponse.json(
      { error: 'Failed to complete attempt' },
      { status: 500 }
    );
  }
}
