import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BalanceHistoryPoint {
  date: string;
  balance: number;
}

interface WalletHistoryProps {
  history: BalanceHistoryPoint[];
}

export function WalletHistory({ history }: WalletHistoryProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balance History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No history available</p>
        </CardContent>
      </Card>
    );
  }

  const maxBalance = Math.max(...history.map(h => h.balance));
  const minBalance = Math.min(...history.map(h => h.balance));
  const range = maxBalance - minBalance || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-48 flex items-end gap-1">
            {history.map((point, index) => {
              const height = ((point.balance - minBalance) / range) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 transition-colors rounded-t"
                  style={{ height: `${Math.max(height, 5)}%` }}
                  title={`${point.date}: ${point.balance.toLocaleString()} coins`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{history[0].date}</span>
            <span>{history[history.length - 1].date}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Highest</p>
              <p className="text-lg font-semibold text-green-600">{maxBalance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lowest</p>
              <p className="text-lg font-semibold text-red-600">{minBalance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current</p>
              <p className="text-lg font-semibold">{history[history.length - 1].balance.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
