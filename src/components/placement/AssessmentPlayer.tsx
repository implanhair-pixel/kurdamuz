'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { QuestionRenderer } from './QuestionRenderer';
import { ProgressTracker } from './ProgressTracker';
import type { Question } from '@/lib/placement/question-bank/types';

interface AssessmentPlayerProps {
  questions: Question[];
  onComplete: (responses: Record<string, any>) => void;
  timeLimit?: number;
}

export function AssessmentPlayer({ questions, onComplete, timeLimit }: AssessmentPlayerProps) {
  const t = useTranslations('placement');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);

  const currentQuestion = questions[currentQuestionIndex];

  const handleResponse = (response: any) => {
    setResponses({
      ...responses,
      [currentQuestion.id]: response,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete(responses);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinish = () => {
    onComplete(responses);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <ProgressTracker
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        timeRemaining={timeRemaining}
      />

      <QuestionRenderer
        question={currentQuestion}
        onResponse={handleResponse}
        currentResponse={responses[currentQuestion.id]}
      />

      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition text-center"
        >
          {t('messages.previous')}
        </button>

        {currentQuestionIndex === questions.length - 1 ? (
          <button
            onClick={handleFinish}
            className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-center"
          >
            {t('messages.finish')}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-center"
          >
            {t('messages.next')}
          </button>
        )}
      </div>
    </div>
  );
}
