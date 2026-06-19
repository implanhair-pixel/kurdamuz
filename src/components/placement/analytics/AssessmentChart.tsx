'use client';

import { useTranslations } from 'next-intl';

interface AssessmentChartProps {
  data: {
    date: string;
    completed: number;
    started: number;
  }[];
}

export function AssessmentChart({ data }: AssessmentChartProps) {
  const t = useTranslations('placement');
  
  const maxValue = Math.max(...data.map(d => Math.max(d.completed, d.started)));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Assessment Activity</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{item.date}</span>
              <span className="font-medium">
                {item.completed} / {item.started}
              </span>
            </div>
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(item.completed / maxValue) * 100}%` }}
              />
              <div
                className="absolute top-0 left-0 h-full bg-blue-200 transition-all duration-300"
                style={{ width: `${(item.started / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-200 rounded" />
          <span>Started</span>
        </div>
      </div>
    </div>
  );
}
