import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Trophy, Flame, BookOpen, Target } from 'lucide-react';

interface MissionCardProps {
  name: string;
  description?: string;
  missionType: 'daily_login' | 'lesson_completion' | 'quiz_completion' | 'vocabulary' | 'streak';
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  coinReward: number;
  progress: number;
  target: number;
  completionStatus: 'not_started' | 'in_progress' | 'completed' | 'expired';
}

const missionIcons: Record<string, any> = {
  daily_login: Flame,
  lesson_completion: BookOpen,
  quiz_completion: Trophy,
  vocabulary: Target,
  streak: Flame,
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};

export function MissionCard({
  name,
  description,
  missionType,
  difficulty,
  xpReward,
  coinReward,
  progress,
  target,
  completionStatus,
}: MissionCardProps) {
  const MissionIcon = missionIcons[missionType] || Target;
  const progressPercentage = Math.min((progress / target) * 100, 100);
  const isCompleted = completionStatus === 'completed';

  return (
    <Card className={isCompleted ? 'border-green-500' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100' : 'bg-purple-100'}`}>
              <MissionIcon className={`h-5 w-5 ${isCompleted ? 'text-green-600' : 'text-purple-600'}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {isCompleted && <CheckCircle className="h-6 w-6 text-green-600" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className={difficultyColors[difficulty]}>{difficulty}</Badge>
            <Badge variant="secondary">{missionType.replace(/_/g, ' ')}</Badge>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{progress} / {target}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-blue-600" />
                <span>{xpReward} XP</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-purple-600" />
                <span>{coinReward} coins</span>
              </div>
            </div>
            {isCompleted && (
              <Badge className="bg-green-600">Completed</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
