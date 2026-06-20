'use client';

import { useState, useEffect } from 'react';
import { ReviewCard } from './review-card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface ReviewSessionProps {
  vocabulary: Array<{
    id: string;
    kurdishWord: string;
    persianTranslation: string;
    englishTranslation?: string;
    pronunciation?: string;
    examples?: Array<{
      kurdishSentence: string;
      persianTranslation: string;
      englishTranslation: string;
    }>;
  }>;
  onComplete?: (results: ReviewResults) => void;
  onCancel?: () => void;
}

interface ReviewResults {
  total: number;
  correct: number;
  incorrect: number;
  averageQuality: number;
}

export function ReviewSession({
  vocabulary,
  onComplete,
  onCancel,
}: ReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isComplete, setIsComplete] = useState(false);

  const currentVocab = vocabulary[currentIndex];
  const progress = ((currentIndex + 1) / vocabulary.length) * 100;

  const handleReveal = () => {
    setShowAnswer(true);
  };

  const handleRate = (quality: number) => {
    setResponses((prev) => ({
      ...prev,
      [currentVocab.id]: quality,
    }));

    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowAnswer(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
    }
  };

  const handleComplete = () => {
    const correctCount = Object.values(responses).filter((q) => q >= 3).length;
    const incorrectCount = Object.values(responses).filter((q) => q < 3).length;
    const averageQuality =
      Object.values(responses).reduce((sum, q) => sum + q, 0) / Object.values(responses).length;

    const results: ReviewResults = {
      total: vocabulary.length,
      correct: correctCount,
      incorrect: incorrectCount,
      averageQuality: Math.round(averageQuality * 10) / 10,
    };

    setIsComplete(true);
    onComplete?.(results);
  };

  if (isComplete) {
    const correctCount = Object.values(responses).filter((q) => q >= 3).length;
    const incorrectCount = Object.values(responses).filter((q) => q < 3).length;
    const averageQuality =
      Object.values(responses).reduce((sum, q) => sum + q, 0) / Object.values(responses).length;

    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="mb-8">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Review Complete!</h2>
          <p className="text-gray-600">Great job on completing your review session</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{vocabulary.length}</p>
            <p className="text-sm text-gray-600">Total Words</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{correctCount}</p>
            <p className="text-sm text-gray-600">Correct</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{incorrectCount}</p>
            <p className="text-sm text-gray-600">Need Review</p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg mb-8">
          <p className="text-2xl font-bold">
            Average Score: {Math.round(averageQuality * 10) / 10} / 5
          </p>
        </div>

        <Button onClick={onCancel} size="lg">
          Continue Learning
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {currentIndex + 1} of {vocabulary.length}
          </span>
          <span className="text-gray-600">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Review Card */}
      <ReviewCard
        vocabulary={currentVocab}
        showAnswer={showAnswer}
        onReveal={handleReveal}
        onRate={handleRate}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === vocabulary.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
