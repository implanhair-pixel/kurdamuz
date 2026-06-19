import { Trophy, Lock, CheckCircle } from 'lucide-react';
import type { StreakMilestone } from '@/types/streak';

interface MilestoneTrackerProps {
  milestones: StreakMilestone[];
  currentStreak: number;
}

export function MilestoneTracker({ milestones, currentStreak }: MilestoneTrackerProps) {
  const sortedMilestones = [...milestones].sort((a, b) => a.streakValue - b.streakValue);

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Streak Milestones</h3>
      
      <div className="space-y-4">
        {sortedMilestones.map((milestone, index) => {
          const isAchieved = currentStreak >= milestone.streakValue;
          const isNext = !isAchieved && 
            (index === 0 || currentStreak >= sortedMilestones[index - 1].streakValue);
          
          return (
            <div
              key={milestone.streakValue}
              className={`
                flex items-center gap-4 p-4 rounded-lg border-2 transition-all
                ${isAchieved 
                  ? 'bg-green-50 border-green-200' 
                  : isNext 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                }
              `}
            >
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${isAchieved 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-400'
                }
              `}>
                {isAchieved ? (
                  <CheckCircle className="w-6 h-6" />
                ) : isNext ? (
                  <Trophy className="w-6 h-6" />
                ) : (
                  <Lock className="w-6 h-6" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{milestone.title}</h4>
                  <span className="text-sm font-medium text-gray-600">
                    {milestone.streakValue} days
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {milestone.description}
                </p>
                {isAchieved && milestone.achievedAt && (
                  <p className="text-xs text-green-600 mt-1">
                    Achieved on {new Date(milestone.achievedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              {isAchieved && (
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-600">
                    +{milestone.rewardXp} XP
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {sortedMilestones.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No milestones configured yet
          </div>
        )}
      </div>
    </div>
  );
}
