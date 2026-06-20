import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Target } from 'lucide-react';
import type { XPAnalytics } from '@/types/xp';

interface ProgressChartProps {
  analytics: XPAnalytics;
}

export function ProgressChart({ analytics }: ProgressChartProps) {
  const totalXP = analytics.totalXP;
  const currentLevel = analytics.currentLevel;
  const xpToNextLevel = analytics.xpHistory.length > 0 
    ? analytics.xpHistory[analytics.xpHistory.length - 1].xp 
    : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Progress Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Level */}
        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Current Level</p>
            <p className="text-3xl font-bold">{currentLevel}</p>
          </div>
          <Target className="h-8 w-8 text-primary" />
        </div>

        {/* Total XP */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total XP Earned</span>
            <span className="font-semibold">{totalXP.toLocaleString()} XP</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* XP Growth Breakdown */}
        <div className="space-y-3">
          <p className="text-sm font-semibold">XP Growth Breakdown</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Daily Average</span>
              <span className="font-medium text-green-600">
                +{Math.round(analytics.xpGrowth.daily).toLocaleString()} XP
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Weekly Average</span>
              <span className="font-medium text-blue-600">
                +{Math.round(analytics.xpGrowth.weekly / 7).toLocaleString()} XP/day
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Monthly Average</span>
              <span className="font-medium text-purple-600">
                +{Math.round(analytics.xpGrowth.monthly / 30).toLocaleString()} XP/day
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">Recent Activity</p>
          {analytics.xpHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          ) : (
            <div className="space-y-1">
              {analytics.xpHistory.slice(-5).reverse().map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{entry.date}</span>
                  <span className="font-medium text-green-600">+{entry.xp} XP</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
