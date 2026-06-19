import type { UserAchievement, AchievementDefinition } from '@/types/achievement';
import { AchievementCard } from './AchievementCard';

interface AchievementGridProps {
  userAchievements: Array<{ userAchievement: UserAchievement; achievement: AchievementDefinition }>;
  onClaim?: (achievementId: string) => void;
  isClaiming?: boolean;
  filter?: 'all' | 'earned' | 'in_progress';
}

export function AchievementGrid({ 
  userAchievements, 
  onClaim, 
  isClaiming,
  filter = 'all'
}: AchievementGridProps) {
  const filteredAchievements = userAchievements.filter(({ userAchievement }) => {
    if (filter === 'all') return true;
    if (filter === 'earned') return userAchievement.status === 'completed' || userAchievement.status === 'claimed';
    if (filter === 'in_progress') return userAchievement.status === 'in_progress';
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => {}}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => {}}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'earned' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Earned
        </button>
        <button
          onClick={() => {}}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'in_progress' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          In Progress
        </button>
      </div>

      {filteredAchievements.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">No achievements found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredAchievements.map(({ userAchievement, achievement }) => (
            <AchievementCard
              key={achievement.id}
              userAchievement={userAchievement}
              achievement={achievement}
              onClaim={onClaim ? () => onClaim(achievement.id) : undefined}
              isClaiming={isClaiming}
            />
          ))}
        </div>
      )}
    </div>
  );
}
