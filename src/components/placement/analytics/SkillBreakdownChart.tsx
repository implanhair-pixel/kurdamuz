'use client';

import { useTranslations } from 'next-intl';

interface SkillBreakdownChartProps {
  data: {
    domain: string;
    score: number;
    average: number;
  }[];
}

export function SkillBreakdownChart({ data }: SkillBreakdownChartProps) {
  const t = useTranslations('placement');

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Skill Domain Breakdown</h3>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.domain} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium capitalize">{t('skillDomains.' + item.domain as any)}</span>
              <span className="font-bold">{item.score.toFixed(1)}%</span>
            </div>
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full ${getScoreColor(item.score)} transition-all duration-300`}
                style={{ width: `${item.score}%` }}
              />
              <div
                className="absolute top-0 left-0 h-full bg-gray-400 opacity-30 transition-all duration-300"
                style={{ width: `${item.average}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Your score</span>
              <span>Average: {item.average.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
