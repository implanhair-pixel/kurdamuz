import type { StreakHistoryEntry } from '@/types/streak';

interface StreakHistoryTableProps {
  history: StreakHistoryEntry[];
}

export function StreakHistoryTable({ history }: StreakHistoryTableProps) {
  const activityTypeLabels: Record<string, string> = {
    lesson: 'Lesson',
    quiz: 'Quiz',
    vocabulary: 'Vocabulary',
    story: 'Story',
    practice: 'Practice',
  };

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold">Streak History</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Streak Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {history.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No streak history yet
                </td>
              </tr>
            ) : (
              history.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(entry.activityDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {activityTypeLabels[entry.activityType] || entry.activityType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-green-600">
                      {entry.streakValue} days
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
