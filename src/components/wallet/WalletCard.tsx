import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, TrendingUp, TrendingDown } from 'lucide-react';

interface WalletCardProps {
  currentBalance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

export function WalletCard({ currentBalance, lifetimeEarned, lifetimeSpent }: WalletCardProps) {
  return (
    <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Coins className="h-5 w-5" />
          My Wallet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-purple-100 text-sm mb-1">Current Balance</p>
            <p className="text-4xl font-bold">{currentBalance.toLocaleString()}</p>
            <p className="text-purple-200 text-sm">coins</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-400/30">
            <div>
              <p className="text-purple-100 text-xs mb-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Lifetime Earned
              </p>
              <p className="text-xl font-semibold">{lifetimeEarned.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-purple-100 text-xs mb-1 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Lifetime Spent
              </p>
              <p className="text-xl font-semibold">{lifetimeSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
