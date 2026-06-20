'use client';

import { useTranslations } from 'next-intl';

interface PlacementDistributionChartProps {
  data: {
    level: string;
    count: number;
    percentage: number;
  }[];
}

export function PlacementDistributionChart({ data }: PlacementDistributionChartProps) {
  const t = useTranslations('placement');

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'advanced':
        return 'bg-green-500';
      case 'intermediate':
        return 'bg-yellow-500';
      case 'beginner':
      default:
        return 'bg-blue-500';
    }
  };

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Placement Distribution</h3>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.level} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium capitalize">{t('proficiency.' + item.level as any)}</span>
              <span className="font-bold">
                {item.count} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full ${getLevelColor(item.level)} transition-all duration-300`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t text-sm text-gray-600">
        Total placements: {total}
      </div>
    </div>
  );
}
