'use client';

import { useState, useEffect } from 'react';

export default function PlacementAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // This would call the analytics API
      // For now, set mock data
      setAnalytics({
        totalAttempts: 150,
        completionRate: 85,
        averageScore: 65,
        scoreDistribution: {
          beginner: 45,
          intermediate: 75,
          advanced: 30,
        },
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Placement Test Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">{analytics.totalAttempts}</div>
            <div className="text-gray-600">Total Attempts</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">{analytics.completionRate}%</div>
            <div className="text-gray-600">Completion Rate</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600">{analytics.averageScore}%</div>
            <div className="text-gray-600">Average Score</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Score Distribution</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Beginner</span>
                <span>{analytics.scoreDistribution.beginner}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Intermediate</span>
                <span>{analytics.scoreDistribution.intermediate}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '50%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Advanced</span>
                <span>{analytics.scoreDistribution.advanced}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
