import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, ArrowUp } from 'lucide-react';
import type { LevelProgress } from '@/types/xp';

interface LevelProgressProps {
  levelProgress: LevelProgress;
  showLevelUp?: boolean;
}

export function LevelProgress({ levelProgress, showLevelUp = false }: LevelProgressProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="font-semibold">Level {levelProgress.currentLevel}</span>
        </div>
        {showLevelUp && levelProgress.canLevelUp && (
          <Badge variant="default" className="flex items-center gap-1">
            <ArrowUp className="h-3 w-3" />
            Level Up Available!
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">
            {levelProgress.currentXP.toLocaleString()} / {levelProgress.xpToNextLevel.toLocaleString()} XP
          </span>
        </div>
        <Progress value={levelProgress.progressPercentage} className="h-3" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{levelProgress.progressPercentage.toFixed(1)}% complete</span>
          <span>{Math.max(0, levelProgress.xpToNextLevel - levelProgress.currentXP).toLocaleString()} XP remaining</span>
        </div>
      </div>
    </div>
  );
}
