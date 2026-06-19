'use client';

import React from 'react';

interface RecallAssessmentProps {
  onQualitySelect: (quality: number) => void;
  disabled?: boolean;
}

export function RecallAssessment({ onQualitySelect, disabled = false }: RecallAssessmentProps) {
  const qualityLabels = [
    { value: 0, label: 'Blackout', description: 'Complete failure', color: 'bg-red-600' },
    { value: 1, label: 'Incorrect', description: 'Wrong but remembered', color: 'bg-red-500' },
    { value: 2, label: 'Hard', description: 'Difficult recall', color: 'bg-orange-500' },
    { value: 3, label: 'Good', description: 'Correct with effort', color: 'bg-yellow-500' },
    { value: 4, label: 'Easy', description: 'Correct with hesitation', color: 'bg-green-500' },
    { value: 5, label: 'Perfect', description: 'Instant recall', color: 'bg-green-600' },
  ];

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">How well did you remember?</h3>
      <div className="grid grid-cols-3 gap-3">
        {qualityLabels.map((quality) => (
          <button
            key={quality.value}
            onClick={() => !disabled && onQualitySelect(quality.value)}
            disabled={disabled}
            className={`${quality.color} text-white rounded-lg p-4 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="text-2xl font-bold">{quality.value}</div>
            <div className="text-sm font-medium">{quality.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
