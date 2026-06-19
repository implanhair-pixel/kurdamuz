import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MissionProgressProps {
  currentProgress: number;
  target: number;
  missionType: string;
}

export function MissionProgress({ currentProgress, target, missionType }: MissionProgressProps) {
  const progressPercentage = Math.min((currentProgress / target) * 100, 100);
  const isCompleted = currentProgress >= target;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Mission Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">{missionType.replace(/_/g, ' ')}</span>
              <span className="font-medium">
                {currentProgress} / {target}
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-3"
            />
          </div>
          
          {isCompleted && (
            <div className="text-center py-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-green-600 font-medium">Mission Completed!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
