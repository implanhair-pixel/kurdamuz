'use client';

import React from 'react';

interface ReviewProgressBarProps {
  current: number;
  total: number;
  estimatedRemainingTime?: number; // in seconds
}

export function ReviewProgressBar({ current, total, estimatedRemainingTime }: ReviewProgressBarProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {current} / {total} items
        </span>
        {estimatedRemainingTime && (
          <span className="text-sm text-gray-500">
            ~{formatTime(estimatedRemainingTime)} remaining
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-gray-500 text-right">
        {Math.round(progress)}% complete
      </div>
    </div>
  );
}
