import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Flame } from 'lucide-react';
import type { XPAnalytics } from '@/types/xp';

interface ActivityHeatmapProps {
  analytics: XPAnalytics;
  days?: number;
}

export function ActivityHeatmap({ analytics, days = 30 }: ActivityHeatmapProps) {
  // Generate activity data from XP history
  const activityMap = new Map<string, number>();
  
  // Initialize all days with 0
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    activityMap.set(dateStr, 0);
  }

  // Fill in actual XP from history
  analytics.xpHistory.forEach((entry) => {
    const dateStr = entry.date;
    if (activityMap.has(dateStr)) {
      activityMap.set(dateStr, entry.xp);
    }
  });

  // Get activity levels for coloring
  const getIntensity = (xp: number) => {
    if (xp === 0) return 'bg-muted';
    if (xp < 50) return 'bg-green-200';
    if (xp < 100) return 'bg-green-400';
    if (xp < 200) return 'bg-green-600';
    return 'bg-green-800';
  };

  // Calculate total active days
  const activeDays = Array.from(activityMap.values()).filter((xp) => xp > 0).length;
  const streak = calculateStreak(activityMap);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Activity Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">Current Streak</span>
          </div>
          <span className="font-semibold">{streak} days</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Active Days</span>
          <span className="font-semibold">{activeDays} / {days}</span>
        </div>

        {/* Heatmap Grid */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">Last {days} Days</p>
          <div className="grid grid-cols-7 gap-1">
            {Array.from(activityMap.entries()).map(([date, xp]) => (
              <div
                key={date}
                className={`
                  aspect-square rounded-sm ${getIntensity(xp)}
                  hover:ring-2 hover:ring-primary cursor-pointer
                  transition-all
                `}
                title={`${date}: ${xp} XP`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-muted rounded-sm" />
              <div className="w-3 h-3 bg-green-200 rounded-sm" />
              <div className="w-3 h-3 bg-green-400 rounded-sm" />
              <div className="w-3 h-3 bg-green-600 rounded-sm" />
              <div className="w-3 h-3 bg-green-800 rounded-sm" />
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateStreak(activityMap: Map<string, number>): number {
  const dates = Array.from(activityMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0])); // Sort descending

  let streak = 0;
  let currentDate = new Date();

  for (const [dateStr, xp] of dates) {
    const date = new Date(dateStr);
    const diffDays = Math.floor((currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === streak && xp > 0) {
      streak++;
    } else if (diffDays > streak) {
      break;
    }
  }

  return streak;
}
