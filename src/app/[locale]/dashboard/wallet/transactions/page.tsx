import { TransactionTable } from '@/components/wallet/TransactionTable';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { WalletTransaction } from '@/types/wallet';

export default async function TransactionsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // TODO: Fetch actual transactions from API
  const transactions: WalletTransaction[] = [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
        <p className="text-muted-foreground">View all your wallet transactions</p>
      </div>

      <TransactionTable transactions={transactions} />
    </div>
  );
}
