import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Star, Trophy } from 'lucide-react';

interface RewardSummaryProps {
  totalCoinsEarned: number;
  totalXPEarned: number;
  missionsCompleted: number;
  streakMilestones: number;
}

export function RewardSummary({
  totalCoinsEarned,
  totalXPEarned,
  missionsCompleted,
  streakMilestones,
}: RewardSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Rewards</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Coins className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Coins Earned</p>
                <p className="text-xs text-muted-foreground">This week</p>
              </div>
            </div>
            <p className="text-xl font-bold text-purple-600">{totalCoinsEarned.toLocaleString()}</p>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">XP Earned</p>
                <p className="text-xs text-muted-foreground">This week</p>
              </div>
            </div>
            <p className="text-xl font-bold text-blue-600">{totalXPEarned.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs font-medium">Missions</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
              <p className="text-lg font-bold text-green-600">{missionsCompleted}</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs font-medium">Streaks</p>
                  <p className="text-xs text-muted-foreground">Milestones</p>
                </div>
              </div>
              <p className="text-lg font-bold text-orange-600">{streakMilestones}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
