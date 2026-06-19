'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ReviewQueue } from '@/components/srs/ReviewQueue';

export default function DailyPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const router = useRouter();
  const [queueData, setQueueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDailyQueue();
  }, []);

  const fetchDailyQueue = async () => {
    try {
      setError(null);
      const response = await fetch('/api/student/srs/daily');
      const data = await response.json();
      setQueueData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching daily queue:', err);
      setError('Failed to load daily queue. Please try again.');
      setLoading(false);
    }
  };

  const handleStartReview = () => {
    router.push(`/${locale}/srs/reviews`);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Daily Review</h1>
      {queueData ? (
        <ReviewQueue
          queueId={queueData.queueId}
          totalItems={queueData.totalItems}
          pendingItems={queueData.items.filter((item: any) => item.status === 'pending').length}
          onStartReview={handleStartReview}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No queue available for today.</p>
        </div>
      )}
    </div>
  );
}
