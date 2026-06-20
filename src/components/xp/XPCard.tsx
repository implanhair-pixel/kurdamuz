import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp } from 'lucide-react';
import type { UserLevel, LevelProgress } from '@/types/xp';

interface XPCardProps {
  userLevel: UserLevel;
  levelProgress: LevelProgress;
}

export function XPCard({ userLevel, levelProgress }: XPCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Experience Points</CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            Level {userLevel.currentLevel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total XP */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total XP</span>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-2xl font-bold">{userLevel.totalXP.toLocaleString()}</span>
          </div>
        </div>

        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress to Level {userLevel.currentLevel + 1}</span>
            <span className="font-medium">
              {userLevel.currentXP.toLocaleString()} / {userLevel.xpToNextLevel.toLocaleString()} XP
            </span>
          </div>
          <Progress value={levelProgress.progressPercentage} className="h-2" />
          <div className="text-xs text-muted-foreground text-right">
            {levelProgress.progressPercentage.toFixed(1)}% complete
          </div>
        </div>

        {/* XP to Next Level */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">XP to next level</span>
          <span className="font-medium">
            {Math.max(0, userLevel.xpToNextLevel - userLevel.currentXP).toLocaleString()} XP
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
