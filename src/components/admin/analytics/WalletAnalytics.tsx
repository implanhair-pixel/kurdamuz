import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Coins, Activity } from 'lucide-react';

export function WalletAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Coins in Circulation */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Coins in Circulation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">1,234,567</div>
              <Coins className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        {/* Active Wallets */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Wallets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">8,432</div>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+5.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        {/* Total Transactions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transactions (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">1,234</div>
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+8.1%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        {/* Average Balance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">2,456</div>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+3.4%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Volume (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart placeholder - Transaction volume visualization
          </div>
        </CardContent>
      </Card>

      {/* Coin Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coin Distribution by Event Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart placeholder - Coin distribution pie chart
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Earners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>User #1234</span>
                <span className="font-semibold">45,678 coins</span>
              </div>
              <div className="flex items-center justify-between">
                <span>User #5678</span>
                <span className="font-semibold">38,921 coins</span>
              </div>
              <div className="flex items-center justify-between">
                <span>User #9012</span>
                <span className="font-semibold">32,145 coins</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
