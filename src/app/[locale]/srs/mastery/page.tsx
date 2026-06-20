'use client';

import React, { useState, useEffect } from 'react';

export default function MasteryPage() {
  const [masteryData, setMasteryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMasteryData();
  }, []);

  const fetchMasteryData = async () => {
    try {
      const response = await fetch('/api/student/srs/mastery');
      const data = await response.json();
      setMasteryData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching mastery data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Mastery Overview</h1>
      <div className="max-w-4xl mx-auto">
        {masteryData && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mastery Distribution</h2>
              <div className="space-y-2">
                {masteryData.masteryDistribution.map((item: any) => (
                  <div key={item.level} className="flex items-center">
                    <div className="w-32 text-sm text-gray-600 capitalize">{item.level}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 mx-2">
                      <div
                        className="bg-blue-600 h-4 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="w-16 text-sm text-gray-600 text-right">
                      {item.count} ({item.percentage.toFixed(0)}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Vocabulary Mastery Details</h2>
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kurdish
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Persian
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Repetitions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {masteryData.vocabularyMastery.map((item: any) => (
                      <tr key={item.vocabularyId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.kurdishWord}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.persianTranslation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                              item.status === 'mastery'
                                ? 'bg-purple-100 text-purple-800'
                                : item.status === 'retention'
                                ? 'bg-green-100 text-green-800'
                                : item.status === 'reinforcement'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.repetitions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
