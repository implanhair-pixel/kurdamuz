'use client';

import { useTranslations } from 'next-intl';

interface ReliabilityMetricsProps {
  data: {
    cronbachAlpha: number;
    splitHalfReliability: number;
    standardError: number;
    itemDifficulty: number;
  };
}

export function ReliabilityMetrics({ data }: ReliabilityMetricsProps) {
  const t = useTranslations('placement');

  const getReliabilityRating = (value: number) => {
    if (value >= 0.9) return { label: 'Excellent', color: 'text-green-600' };
    if (value >= 0.8) return { label: 'Good', color: 'text-blue-600' };
    if (value >= 0.7) return { label: 'Acceptable', color: 'text-yellow-600' };
    return { label: 'Needs Improvement', color: 'text-red-600' };
  };

  const alphaRating = getReliabilityRating(data.cronbachAlpha);
  const splitHalfRating = getReliabilityRating(data.splitHalfReliability);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Reliability Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Cronbach's Alpha</div>
          <div className="text-2xl font-bold mb-1">{data.cronbachAlpha.toFixed(3)}</div>
          <div className={`text-sm font-medium ${alphaRating.color}`}>
            {alphaRating.label}
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Split-Half Reliability</div>
          <div className="text-2xl font-bold mb-1">{data.splitHalfReliability.toFixed(3)}</div>
          <div className={`text-sm font-medium ${splitHalfRating.color}`}>
            {splitHalfRating.label}
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Standard Error of Measurement</div>
          <div className="text-2xl font-bold">{data.standardError.toFixed(3)}</div>
          <div className="text-sm text-gray-500">Lower is better</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Average Item Difficulty</div>
          <div className="text-2xl font-bold">{data.itemDifficulty.toFixed(3)}</div>
          <div className="text-sm text-gray-500">Optimal: 0.5-0.7</div>
        </div>
      </div>
    </div>
  );
}
