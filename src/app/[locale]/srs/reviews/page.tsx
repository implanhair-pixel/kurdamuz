'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ReviewSession } from '@/components/srs/ReviewSession';
import { ReviewSummary } from '@/components/srs/ReviewSummary';

export default function ReviewsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const router = useRouter();
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);

  useEffect(() => {
    fetchDailyQueue();
  }, []);

  const fetchDailyQueue = async () => {
    try {
      setError(null);
      const response = await fetch('/api/student/srs/daily');
      const data = await response.json();
      setQueueItems(data.items || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching daily queue:', err);
      setError('Failed to load review queue. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmitReview = async (srsItemId: string, quality: number, responseTime: number) => {
    try {
      await fetch('/api/student/srs/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ srsItemId, reviewQuality: quality, responseTime }),
      });
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleComplete = async () => {
    try {
      const response = await fetch('/api/student/srs/statistics');
      const data = await response.json();
      setSummaryData(data.aggregate);
      setSessionComplete(true);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setSessionComplete(true);
    }
  };

  const handleReturn = () => {
    router.push(`/${locale}/srs/daily`);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchDailyQueue}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <ReviewSummary
        totalReviews={summaryData?.totalReviews || 0}
        avgAccuracy={summaryData?.avgAccuracy || 0}
        studyTime={summaryData?.totalStudyTime || 0}
        masteryDistribution={summaryData?.masteryDistribution || []}
        onReturn={handleReturn}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Spaced Repetition Review</h1>
      {queueItems.length > 0 ? (
        <ReviewSession
          queueItems={queueItems}
          onSubmitReview={handleSubmitReview}
          onComplete={handleComplete}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No reviews due at this time!</p>
        </div>
      )}
    </div>
  );
}
