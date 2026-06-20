'use client';

import React from 'react';

interface ReviewCardProps {
  kurdishWord: string;
  persianTranslation: string;
  englishTranslation?: string;
  pronunciation?: string;
  audioUrl?: string;
  onReveal: () => void;
  isRevealed: boolean;
}

export function ReviewCard({
  kurdishWord,
  persianTranslation,
  englishTranslation,
  pronunciation,
  audioUrl,
  onReveal,
  isRevealed,
}: ReviewCardProps) {
  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch((err) => {
        console.warn('Audio playback failed:', err);
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 min-h-[300px] flex flex-col justify-center items-center">
      {!isRevealed ? (
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{kurdishWord}</h2>
          {pronunciation && (
            <p className="text-gray-500 mb-6 text-lg">[{pronunciation}]</p>
          )}
          {audioUrl && (
            <button
              onClick={playAudio}
              className="mb-6 p-3 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
              aria-label="Play pronunciation"
            >
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            </button>
          )}
          <button
            onClick={onReveal}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Show Answer
          </button>
        </div>
      ) : (
        <div className="text-center w-full">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">{kurdishWord}</h2>
          <div className="border-t pt-6">
            <p className="text-2xl text-gray-700 mb-2">{persianTranslation}</p>
            {englishTranslation && (
              <p className="text-xl text-gray-500">{englishTranslation}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
