import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCurrentUser, requireXPPermission } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Settings, Users, TrendingUp, Award, Shield } from 'lucide-react';
import { localePath } from '@/lib/locale';

export default async function AdminXPPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loginPath = localePath(locale, '/login');
  const dashboardPath = localePath(locale, '/dashboard');
  const user = await getCurrentUser();
  
  if (!user) {
    redirect(loginPath);
  }

  try {
    await requireXPPermission('admin:xp');
  } catch (error) {
    redirect(dashboardPath);
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">XP Administration</h1>
          <p className="text-muted-foreground">Manage XP system, rewards, and achievements</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              XP Adjustments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manually adjust user XP for corrections or special cases
            </p>
            <Button className="w-full">Manage XP</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Levels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View and manage user levels and progression
            </p>
            <Button className="w-full">View Levels</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create and manage reward definitions
            </p>
            <Button className="w-full">Manage Rewards</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View platform-wide XP analytics and insights
            </p>
            <Button className="w-full">View Analytics</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quick XP Adjustment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="user-id">User ID</Label>
              <Input id="user-id" placeholder="Enter user ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="xp-amount">XP Amount</Label>
              <Input id="xp-amount" type="number" placeholder="Enter XP amount" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input id="reason" placeholder="Enter reason for adjustment" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <select id="action" className="w-full p-2 border rounded">
                <option value="award">Award XP</option>
                <option value="remove">Remove XP</option>
                <option value="correct">Correct XP</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button>Submit Adjustment</Button>
            <Button variant="secondary">Cancel</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Recent XP-related administrative actions will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
