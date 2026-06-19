interface ProgressChartProps {
  data: {
    label: string;
    value: number;
  }[];
  height?: number;
}

export function ProgressChart({ data, height = 200 }: ProgressChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Progress Overview</h3>
      <div style={{ height: `${height}px` }} className="flex items-end space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-blue-600 rounded-t"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                minHeight: '4px',
              }}
            />
            <div className="mt-2 text-xs text-gray-600 text-center truncate w-full">
              {item.label}
            </div>
            <div className="text-xs font-medium text-gray-700">
              {item.value}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
