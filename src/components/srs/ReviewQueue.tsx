'use client';

import React from 'react';
import { ReviewProgressBar } from './ReviewProgressBar';

interface ReviewQueueProps {
  queueId: string;
  totalItems: number;
  pendingItems: number;
  onStartReview: () => void;
}

export function ReviewQueue({ queueId, totalItems, pendingItems, onStartReview }: ReviewQueueProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Today's Review Queue</h2>
        
        <ReviewProgressBar
          current={totalItems - pendingItems}
          total={totalItems}
        />

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-3xl font-bold text-blue-600">{totalItems}</p>
            <p className="text-sm text-gray-600">Total Items</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-3xl font-bold text-green-600">{totalItems - pendingItems}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-3xl font-bold text-orange-600">{pendingItems}</p>
            <p className="text-sm text-gray-600">Remaining</p>
          </div>
        </div>

        {pendingItems > 0 ? (
          <button
            onClick={onStartReview}
            className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start Review Session
          </button>
        ) : (
          <div className="mt-6 text-center text-green-600 font-medium">
            ✓ All reviews completed for today!
          </div>
        )}
      </div>
    </div>
  );
}
