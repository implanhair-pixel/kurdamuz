import { Flame, Calendar, TrendingUp } from 'lucide-react';
import type { UserStreak } from '@/types/streak';

interface StreakCardProps {
  streak: UserStreak;
  atRisk?: boolean;
  healthStatus?: {
    status: 'healthy' | 'at_risk' | 'broken' | 'frozen';
    message: string;
    hoursUntilBreak: number | null;
  };
}

export function StreakCard({ streak, atRisk, healthStatus }: StreakCardProps) {
  const statusColor = streak.streakStatus === 'active' ? 'text-green-600' : 
                     streak.streakStatus === 'frozen' ? 'text-blue-600' : 'text-red-600';
  
  const bgColor = streak.streakStatus === 'active' ? 'bg-green-50 border-green-200' : 
                  streak.streakStatus === 'frozen' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200';

  return (
    <div className={`rounded-lg border p-6 ${bgColor}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className={`w-6 h-6 ${statusColor}`} />
          <h3 className="text-lg font-semibold">Current Streak</h3>
        </div>
        {streak.streakStatus === 'frozen' && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Frozen
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Current Streak</span>
          <span className={`text-3xl font-bold ${statusColor}`}>
            {streak.currentStreak} days
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Longest Streak</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="font-semibold">{streak.longestStreak} days</span>
          </div>
        </div>

        {streak.lastActivityDate && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Last Activity</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                {new Date(streak.lastActivityDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {healthStatus && healthStatus.hoursUntilBreak !== null && healthStatus.status !== 'broken' && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Time until streak breaks</span>
              <span className={`font-semibold ${
                healthStatus.hoursUntilBreak < 6 ? 'text-red-600' : 
                healthStatus.hoursUntilBreak < 12 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {Math.floor(healthStatus.hoursUntilBreak)}h {Math.round((healthStatus.hoursUntilBreak % 1) * 60)}m
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  healthStatus.hoursUntilBreak < 6 ? 'bg-red-500' : 
                  healthStatus.hoursUntilBreak < 12 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${(healthStatus.hoursUntilBreak / 24) * 100}%` }}
              />
            </div>
          </div>
        )}

        {healthStatus && healthStatus.message && (
          <p className="text-sm text-gray-600 mt-2">
            {healthStatus.message}
          </p>
        )}
      </div>
    </div>
  );
}
