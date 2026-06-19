'use client';

import { useTranslations } from 'next-intl';

interface ProgressTrackerProps {
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining?: number;
}

export function ProgressTracker({ currentQuestion, totalQuestions, timeRemaining }: ProgressTrackerProps) {
  const t = useTranslations('placement');
  const progress = (currentQuestion / totalQuestions) * 100;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4" role="progressbar" aria-valuenow={currentQuestion} aria-valuemin={1} aria-valuemax={totalQuestions} aria-label={`Question ${currentQuestion} of ${totalQuestions}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-700">
          {t('messages.question')} {currentQuestion} {t('messages.of')} {totalQuestions}
        </div>
        {timeRemaining !== undefined && (
          <div className="text-sm font-medium text-gray-700" aria-live="polite">
            {t('messages.timeRemaining')}: {formatTime(timeRemaining)}
          </div>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2" aria-hidden="true">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
