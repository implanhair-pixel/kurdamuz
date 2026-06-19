'use client';

import React from 'react';

interface ReviewSummaryProps {
  totalReviews: number;
  avgAccuracy: number;
  studyTime: number; // in seconds
  masteryDistribution: Array<{ level: string; count: number; percentage: number }>;
  onReturn: () => void;
}

export function ReviewSummary({
  totalReviews,
  avgAccuracy,
  studyTime,
  masteryDistribution,
  onReturn,
}: ReviewSummaryProps) {
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const masteryColors: Record<string, string> = {
    learning: 'bg-blue-500',
    reinforcement: 'bg-yellow-500',
    retention: 'bg-green-500',
    mastery: 'bg-purple-500',
    archived: 'bg-gray-500',
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Session Complete!</h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{totalReviews}</p>
            <p className="text-sm text-gray-600">Reviews</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{avgAccuracy.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Accuracy</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{formatTime(studyTime)}</p>
            <p className="text-sm text-gray-600">Study Time</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Mastery Distribution</h3>
          <div className="space-y-2">
            {masteryDistribution.map((item) => (
              <div key={item.level} className="flex items-center">
                <div className="w-24 text-sm text-gray-600 capitalize">{item.level}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 mx-2">
                  <div
                    className={`${masteryColors[item.level] || 'bg-gray-500'} h-4 rounded-full`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="w-20 text-sm text-gray-600 text-right">
                  {item.count} ({item.percentage.toFixed(0)}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onReturn}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
