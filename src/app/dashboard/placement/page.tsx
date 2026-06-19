'use client';

import { useState, useEffect } from 'react';
import { ResultSummary } from '@/components/placement/ResultSummary';

export default function PlacementDashboardPage() {
  const [placementHistory, setPlacementHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlacementHistory();
  }, []);

  const fetchPlacementHistory = async () => {
    try {
      setPlacementHistory([
        {
          id: '1',
          overallScore: 75,
          recommendedLevel: 'intermediate',
          domainScores: [
            { domain: 'reading', score: 80 },
            { domain: 'writing', score: 70 },
            { domain: 'listening', score: 75 },
            { domain: 'speaking', score: 65 },
            { domain: 'grammar', score: 80 },
            { domain: 'vocabulary', score: 75 },
          ],
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error fetching placement history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Placement Test History</h1>

        {placementHistory.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <p className="text-gray-600 mb-6">You haven&apos;t taken any placement tests yet.</p>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Take Placement Test
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {placementHistory.map((result) => (
              <ResultSummary
                key={result.id}
                overallScore={result.overallScore}
                recommendedLevel={result.recommendedLevel}
                domainScores={result.domainScores}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
