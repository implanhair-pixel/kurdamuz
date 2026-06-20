'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { PlacementWizard } from '@/components/placement/PlacementWizard';
import { AssessmentPlayer } from '@/components/placement/AssessmentPlayer';
import { ResultSummary } from '@/components/placement/ResultSummary';
import { RecommendationCard } from '@/components/placement/RecommendationCard';
import type { Question } from '@/lib/placement/question-bank/types';

type TestState = 'wizard' | 'assessment' | 'results';

export default function PlacementTestPage() {
  const t = useTranslations('placement');
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const router = useRouter();
  const [testState, setTestState] = useState<TestState>('wizard');
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<any>(null);

  const handleStartTest = async () => {
    try {
      const response = await fetch('/api/placement/attempts/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId: 'default-placement-test' }),
      });

      if (!response.ok) throw new Error('Failed to start test');

      const data = await response.json();
      setAttemptId(data.attempt.id);
      setQuestions(data.questions);
      setTestState('assessment');
    } catch (error) {
      console.error('Error starting test:', error);
    }
  };

  const handleCompleteAssessment = async (responses: Record<string, any>) => {
    try {
      // Submit all responses
      for (const [questionId, responseData] of Object.entries(responses)) {
        await fetch(`/api/placement/attempts/${attemptId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId, responseData }),
        });
      }

      // Complete the attempt and get results
      const response = await fetch(`/api/placement/attempts/${attemptId}/complete`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to complete test');

      const data = await response.json();
      setResults(data);
      setTestState('results');
    } catch (error) {
      console.error('Error completing test:', error);
    }
  };

  const handleContinueLearning = () => {
    // Navigate to recommended courses with locale prefix
    router.push(`/${locale}/courses`);
  };

  const handleRetakeTest = () => {
    setTestState('wizard');
    setAttemptId(null);
    setQuestions([]);
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-8 px-4">
      {testState === 'wizard' && (
        <PlacementWizard onStart={handleStartTest} />
      )}

      {testState === 'assessment' && (
        <AssessmentPlayer
          questions={questions}
          onComplete={handleCompleteAssessment}
          timeLimit={1800} // 30 minutes
        />
      )}

      {testState === 'results' && results && (
        <div className="w-full max-w-3xl mx-auto space-y-4 sm:space-y-6">
          <ResultSummary
            overallScore={results.overallScore.percentage}
            recommendedLevel={results.placementResult.recommendedLevel}
            domainScores={results.overallScore.domainScores}
          />
          <RecommendationCard
            recommendedLevel={results.placementResult.recommendedLevel}
            onContinue={handleContinueLearning}
            onRetake={handleRetakeTest}
          />
          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={handleRetakeTest}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Retake Test
            </button>
            <button
              onClick={handleContinueLearning}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Continue Learning
            </button>
          </div>
        </div>
      )}
    </div>
  );
}