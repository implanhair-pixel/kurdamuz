import { TransactionTable } from '@/components/wallet/TransactionTable';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { localePath } from '@/lib/locale';
import type { WalletTransaction } from '@/types/wallet';
import { transactionService } from '@/lib/wallet/transaction-service';
import { walletManager } from '@/lib/wallet/wallet-manager';

export default async function TransactionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(localePath(locale, '/login'));
  }

  const [transactions, currentBalance] = await Promise.all([
    transactionService.getTransactionHistory(user.id, 50, 0).catch(() => [] as WalletTransaction[]),
    walletManager.getBalance(user.id).catch(() => 0),
  ]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
        <p className="text-muted-foreground">View all your wallet transactions</p>
      </div>

      <div className="mb-6 rounded-lg border bg-muted/30 p-4">
        <div className="text-sm text-muted-foreground">Current balance</div>
        <div className="text-2xl font-bold">{currentBalance.toLocaleString()} coins</div>
      </div>

      <TransactionTable transactions={transactions} />
    </div>
  );
}
