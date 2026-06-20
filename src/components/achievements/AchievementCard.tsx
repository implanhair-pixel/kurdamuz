import { Trophy, Lock, CheckCircle, Star } from 'lucide-react';
import type { UserAchievement, AchievementDefinition } from '@/types/achievement';

interface AchievementCardProps {
  userAchievement: UserAchievement;
  achievement: AchievementDefinition;
  onClaim?: () => void;
  isClaiming?: boolean;
}

export function AchievementCard({ 
  userAchievement, 
  achievement, 
  onClaim, 
  isClaiming 
}: AchievementCardProps) {
  const isEarned = userAchievement.status === 'completed' || userAchievement.status === 'claimed';
  const isClaimed = userAchievement.status === 'claimed';
  const progressPercentage = (userAchievement.progressValue / 100) * 100;

  return (
    <div className={`
      bg-white rounded-lg border-2 p-6 transition-all hover:shadow-lg
      ${isEarned ? 'border-green-200 bg-green-50' : 'border-gray-200'}
    `}>
      <div className="flex items-start gap-4">
        <div className={`
          w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0
          ${isEarned ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}
        `}>
          {isEarned ? (
            <Trophy className="w-8 h-8" />
          ) : (
            <Lock className="w-8 h-8" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-lg">{achievement.name}</h3>
              {achievement.description && (
                <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
              )}
            </div>
            {isEarned && !isClaimed && onClaim && (
              <button
                onClick={onClaim}
                disabled={isClaiming}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1 flex-shrink-0"
              >
                <Star className="w-4 h-4" />
                Claim Reward
              </button>
            )}
            {isClaimed && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                <CheckCircle className="w-3 h-3 mr-1" />
                Claimed
              </span>
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{userAchievement.progressValue}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  isEarned ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {isEarned && userAchievement.earnedAt && (
            <p className="text-xs text-green-600 mt-2">
              Earned on {new Date(userAchievement.earnedAt).toLocaleDateString()}
            </p>
          )}

          {achievement.xpBonus > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold text-yellow-700">
                +{achievement.xpBonus} XP
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
