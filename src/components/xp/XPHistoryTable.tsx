import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import type { XPTransaction } from '@/types/xp';

interface XPHistoryTableProps {
  transactions: XPTransaction[];
  limit?: number;
}

export function XPHistoryTable({ transactions, limit = 10 }: XPHistoryTableProps) {
  const displayTransactions = transactions.slice(0, limit);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'removed':
        return <Minus className="h-4 w-4 text-red-500" />;
      case 'corrected':
        return <RotateCcw className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'earned':
        return <Badge variant="default" className="bg-green-500">Earned</Badge>;
      case 'removed':
        return <Badge variant="danger">Removed</Badge>;
      case 'corrected':
        return <Badge variant="secondary" className="bg-blue-500">Corrected</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getSourceBadge = (source: string) => {
    const colors: Record<string, string> = {
      lesson_completion: 'bg-purple-500',
      quiz_completion: 'bg-blue-500',
      course_completion: 'bg-green-500',
      daily_login: 'bg-yellow-500',
      streak: 'bg-orange-500',
      achievement: 'bg-pink-500',
      teacher_award: 'bg-indigo-500',
      admin_bonus: 'bg-red-500',
      special_event: 'bg-cyan-500',
    };

    const colorClass = colors[source] || 'bg-gray-500';
    const label = source.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    return <Badge className={colorClass}>{label}</Badge>;
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>XP Amount</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayTransactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            displayTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(transaction.transactionType)}
                    {getTransactionBadge(transaction.transactionType)}
                  </div>
                </TableCell>
                <TableCell>{getSourceBadge(transaction.sourceType)}</TableCell>
                <TableCell className={transaction.xpAmount > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {transaction.xpAmount > 0 ? '+' : ''}{transaction.xpAmount.toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {transaction.description || '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
