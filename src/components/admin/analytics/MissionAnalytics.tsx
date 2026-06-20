import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, Users, CheckCircle } from 'lucide-react';

export function MissionAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Missions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Missions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">12</div>
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently running missions
            </p>
          </CardContent>
        </Card>

        {/* Total Completions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Completions (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">3,456</div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+15.2%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        {/* Active Participants */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">5,678</div>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Users with active missions
            </p>
          </CardContent>
        </Card>

        {/* Rewards Distributed */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rewards Distributed (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">89,012</div>
              <Trophy className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Coins + XP awarded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mission Completion Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Mission Completion Rate (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart placeholder - Mission completion rate visualization
          </div>
        </CardContent>
      </Card>

      {/* Mission Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mission Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart placeholder - Mission type distribution pie chart
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Missions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Daily Login Streak</span>
                <span className="font-semibold">98.5% completion</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Complete 5 Lessons</span>
                <span className="font-semibold">87.2% completion</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Quiz Master</span>
                <span className="font-semibold">76.8% completion</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
