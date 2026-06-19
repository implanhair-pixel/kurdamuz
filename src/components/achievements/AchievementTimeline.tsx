import { Trophy, Calendar } from 'lucide-react';
import type { UserAchievement, AchievementDefinition } from '@/types/achievement';

interface AchievementTimelineProps {
  achievements: Array<{ userAchievement: UserAchievement; achievement: AchievementDefinition }>;
}

export function AchievementTimeline({ achievements }: AchievementTimelineProps) {
  const earnedAchievements = achievements
    .filter(({ userAchievement }) => userAchievement.earnedAt)
    .sort((a, b) => {
      const dateA = new Date(a.userAchievement.earnedAt!).getTime();
      const dateB = new Date(b.userAchievement.earnedAt!).getTime();
      return dateB - dateA;
    });

  if (earnedAchievements.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Achievement Timeline</h3>
        <p className="text-gray-500 text-center py-8">No achievements earned yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Achievement Timeline</h3>
      
      <div className="space-y-4">
        {earnedAchievements.map(({ userAchievement, achievement }, index) => (
          <div key={achievement.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              {index < earnedAchievements.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 mt-2" />
              )}
            </div>

            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{achievement.name}</h4>
                  {achievement.description && (
                    <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                  )}
                </div>
                {achievement.xpBonus > 0 && (
                  <span className="text-sm font-semibold text-green-600">
                    +{achievement.xpBonus} XP
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(userAchievement.earnedAt!).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
