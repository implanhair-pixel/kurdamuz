import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Settings, Gift, BookOpen, Trophy, Flame } from 'lucide-react';

interface Transaction {
  id: string;
  transactionType: 'credit' | 'debit' | 'adjustment' | 'correction' | 'refund' | 'admin_grant' | 'reward_distribution';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType?: string;
  description?: string;
  createdAt: Date;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

const transactionIcons: Record<string, any> = {
  credit: ArrowUp,
  debit: ArrowDown,
  adjustment: Settings,
  correction: Settings,
  refund: ArrowUp,
  admin_grant: Gift,
  reward_distribution: Trophy,
};

const referenceIcons: Record<string, any> = {
  lesson_completion: BookOpen,
  quiz_completion: Trophy,
  daily_login: Flame,
  streak_milestone: Trophy,
  mission_completion: Trophy,
  admin_adjustment: Settings,
};

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions found
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const TransactionIcon = transactionIcons[transaction.transactionType] || Settings;
            const ReferenceIcon = transaction.referenceType ? referenceIcons[transaction.referenceType] : null;
            const isCredit = transaction.transactionType === 'credit' || transaction.transactionType === 'refund' || transaction.transactionType === 'admin_grant' || transaction.transactionType === 'reward_distribution';

            return (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TransactionIcon className="h-4 w-4" />
                    <Badge variant={isCredit ? 'default' : 'danger'}>
                      {transaction.transactionType}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {transaction.referenceType && ReferenceIcon && (
                    <div className="flex items-center gap-2">
                      <ReferenceIcon className="h-4 w-4" />
                      <span className="capitalize">{transaction.referenceType.replace(/_/g, ' ')}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {transaction.description || '-'}
                </TableCell>
                <TableCell className={`text-right font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                  {isCredit ? '+' : '-'}{transaction.amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {transaction.balanceAfter.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
