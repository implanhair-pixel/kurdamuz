'use client';

import React, { useState, useEffect } from 'react';
import { ReviewCard } from './ReviewCard';
import { ReviewProgressBar } from './ReviewProgressBar';

interface ReviewSessionProps {
  queueItems: Array<{
    id: string;
    srsItemId: string;
    content: {
      kurdishWord: string;
      persianTranslation: string;
      englishTranslation?: string;
      pronunciation?: string;
      audioUrl?: string;
    };
  }>;
  onSubmitReview: (srsItemId: string, quality: number, responseTime: number) => Promise<void>;
  onComplete: () => void;
}

export function ReviewSession({ queueItems, onSubmitReview, onComplete }: ReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [completedItems, setCompletedItems] = useState(0);

  const currentItem = queueItems[currentIndex];
  const totalItems = queueItems.length;

  useEffect(() => {
    setStartTime(Date.now());
    setIsRevealed(false);
  }, [currentIndex]);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleQualityRating = async (quality: number) => {
    const responseTime = Date.now() - startTime;
    try {
      await onSubmitReview(currentItem.srsItemId, quality, responseTime);
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
    setCompletedItems((prev) => prev + 1);

    if (currentIndex < totalItems - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  if (totalItems === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No reviews due at this time!</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ReviewProgressBar
        current={completedItems}
        total={totalItems}
        estimatedRemainingTime={(totalItems - completedItems) * 10}
      />

      <div className="mt-8">
        {currentItem && (
          <>
            <ReviewCard
              kurdishWord={currentItem.content.kurdishWord}
              persianTranslation={currentItem.content.persianTranslation}
              englishTranslation={currentItem.content.englishTranslation}
              pronunciation={currentItem.content.pronunciation}
              audioUrl={currentItem.content.audioUrl}
              onReveal={handleReveal}
              isRevealed={isRevealed}
            />

            {isRevealed && (
              <div className="mt-6 grid grid-cols-6 gap-2" role="group" aria-label="Rate your recall">
                {[0, 1, 2, 3, 4, 5].map((quality) => {
                  const labels = ['Blackout', 'Incorrect', 'Hard', 'Good', 'Easy', 'Perfect'];
                  return (
                    <button
                      key={quality}
                      onClick={() => handleQualityRating(quality)}
                      aria-label={`Rate recall: ${labels[quality]}`}
                      className="px-4 py-3 rounded-lg font-medium transition-colors hover:scale-105 transform"
                      style={{
                        backgroundColor: quality < 3 ? '#ef4444' : quality < 4 ? '#f59e0b' : '#22c55e',
                        color: 'white',
                      }}
                    >
                      {quality}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-4 text-center text-sm text-gray-500">
              <p>0: Blackout | 1: Incorrect | 2: Hard | 3: Good | 4: Easy | 5: Perfect</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
