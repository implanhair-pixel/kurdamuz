import { db } from '@/db';
import { walletTransactions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export interface TransactionRecord {
  walletId: string;
  userId: string;
  transactionType: 'credit' | 'debit' | 'adjustment' | 'correction' | 'refund' | 'admin_grant' | 'reward_distribution';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType?: string;
  referenceId?: string | null;
  description?: string;
}

export class TransactionService {
  /**
   * Record a wallet transaction
   * This is an atomic operation that creates an immutable transaction record
   */
  async recordTransaction(record: TransactionRecord): Promise<void> {
    await db.insert(walletTransactions).values({
      walletId: record.walletId,
      userId: record.userId,
      transactionType: record.transactionType,
      amount: record.amount,
      balanceBefore: record.balanceBefore,
      balanceAfter: record.balanceAfter,
      referenceType: record.referenceType,
      referenceId: record.referenceId,
      description: record.description,
    });
  }

  /**
   * Get transaction history for a user
   */
  async getTransactionHistory(userId: string, limit = 50, offset = 0) {
    const transactions = await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, userId))
      .orderBy(walletTransactions.createdAt)
      .limit(limit)
      .offset(offset);

    return transactions;
  }

  /**
   * Get transactions by reference type
   */
  async getTransactionsByReference(
    referenceType: string,
    referenceId: string
  ) {
    const transactions = await db
      .select()
      .from(walletTransactions)
      .where(
        and(
          eq(walletTransactions.referenceType, referenceType),
          eq(walletTransactions.referenceId, referenceId)
        )
      );

    return transactions;
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId: string) {
    const transactions = await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.id, transactionId))
      .limit(1);

    return transactions[0] || null;
  }
}

export const transactionService = new TransactionService();
