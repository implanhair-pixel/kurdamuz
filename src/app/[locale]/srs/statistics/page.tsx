'use client';

import React, { useState, useEffect } from 'react';

export default function StatisticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/student/srs/statistics');
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">SRS Statistics</h1>
      <div className="max-w-4xl mx-auto">
        {stats && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Retention Score</h2>
              <div className="text-4xl font-bold text-blue-600">{stats.retentionScore.toFixed(1)}%</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Aggregate Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.aggregate.totalReviews}</p>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.aggregate.avgAccuracy.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Avg Accuracy</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">{Math.floor(stats.aggregate.totalStudyTime / 60)}m</p>
                  <p className="text-sm text-gray-600">Study Time</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">{stats.aggregate.totalItems}</p>
                  <p className="text-sm text-gray-600">Total Items</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mastery Breakdown</h2>
              <div className="space-y-2">
                {Object.entries(stats.aggregate.masteryByStatus || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center">
                    <div className="w-32 text-sm text-gray-600 capitalize">{status}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 mx-2">
                      <div
                        className="bg-blue-600 h-4 rounded-full"
                        style={{ width: `${((count as number) / stats.aggregate.totalItems) * 100}%` }}
                      />
                    </div>
                    <div className="w-16 text-sm text-gray-600 text-right">{count as number}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
