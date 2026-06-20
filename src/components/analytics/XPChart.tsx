import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar } from 'lucide-react';
import type { XPAnalytics } from '@/types/xp';

interface XPChartProps {
  analytics: XPAnalytics;
}

export function XPChart({ analytics }: XPChartProps) {
  const maxXP = Math.max(...analytics.xpHistory.map((h) => h.xp), 1);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          XP Growth
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* XP Growth Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Daily</p>
            <p className="text-2xl font-bold text-green-600">
              +{analytics.xpGrowth.daily.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Weekly</p>
            <p className="text-2xl font-bold text-blue-600">
              +{analytics.xpGrowth.weekly.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Monthly</p>
            <p className="text-2xl font-bold text-purple-600">
              +{analytics.xpGrowth.monthly.toLocaleString()}
            </p>
          </div>
        </div>

        {/* XP History Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              XP History
            </span>
          </div>
          <div className="h-40 flex items-end gap-1 border-b border-l border-muted">
            {analytics.xpHistory.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                No XP history available
              </div>
            ) : (
              analytics.xpHistory.map((entry, index) => (
                <div
                  key={index}
                  className="flex-1 bg-primary/60 hover:bg-primary transition-colors rounded-t"
                  style={{
                    height: `${(entry.xp / maxXP) * 100}%`,
                    minHeight: '4px',
                  }}
                  title={`${entry.date}: ${entry.xp} XP`}
                />
              ))
            )}
          </div>
        </div>

        {/* Top Sources */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">Top XP Sources</p>
          <div className="space-y-2">
            {analytics.topSources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No source data available</p>
            ) : (
              analytics.topSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {source.sourceType.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{source.totalXP.toLocaleString()} XP</span>
                    <span className="text-xs text-muted-foreground">({source.count}x)</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
