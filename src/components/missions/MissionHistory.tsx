import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, XCircle, Clock } from 'lucide-react';

interface MissionHistoryItem {
  missionName: string;
  completionResult: 'success' | 'failed' | 'expired';
  xpAwarded: number;
  coinAwarded: number;
  completedAt: Date;
}

interface MissionHistoryProps {
  history: MissionHistoryItem[];
}

export function MissionHistory({ history }: MissionHistoryProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mission History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No mission history yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mission History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((item, index) => {
            const isSuccess = item.completionResult === 'success';
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {isSuccess ? (
                    <Trophy className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">{item.missionName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={isSuccess ? 'success' : 'danger'}>
                    {item.completionResult}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {item.xpAwarded} XP · {item.coinAwarded} coins
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
