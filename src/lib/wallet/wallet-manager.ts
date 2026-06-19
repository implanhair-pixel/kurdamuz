import { db } from '@/db';
import { userWallets, walletTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { TransactionService } from './transaction-service';
import { AuditLogger } from './audit-logger';

export class WalletManager {
  private transactionService: TransactionService;
  private auditLogger: AuditLogger;

  constructor() {
    this.transactionService = new TransactionService();
    this.auditLogger = new AuditLogger();
  }

  /**
   * Create a new wallet for a user
   */
  async createWallet(userId: string, actorId: string): Promise<string> {
    const existingWallet = await db
      .select()
      .from(userWallets)
      .where(eq(userWallets.userId, userId))
      .limit(1);

    if (existingWallet.length > 0) {
      throw new Error('Wallet already exists for this user');
    }

    const wallet = await db
      .insert(userWallets)
      .values({
        userId,
        currentBalance: 0,
        lifetimeEarned: 0,
        lifetimeSpent: 0,
        walletStatus: 'active',
      })
      .returning();

    // Log wallet creation
    await this.auditLogger.log({
      actorId,
      targetUserId: userId,
      actionType: 'wallet_created',
      oldValue: null,
      newValue: { walletId: wallet[0].id },
    });

    return wallet[0].id;
  }

  /**
   * Get wallet balance for a user
   */
  async getBalance(userId: string): Promise<number> {
    const wallet = await db
      .select()
      .from(userWallets)
      .where(eq(userWallets.userId, userId))
      .limit(1);

    if (wallet.length === 0) {
      throw new Error('Wallet not found for this user');
    }

    return wallet[0].currentBalance;
  }

  /**
   * Get full wallet details
   */
  async getWallet(userId: string) {
    const wallet = await db
      .select()
      .from(userWallets)
      .where(eq(userWallets.userId, userId))
      .limit(1);

    if (wallet.length === 0) {
      throw new Error('Wallet not found for this user');
    }

    return wallet[0];
  }

  /**
   * Credit coins to a wallet
   */
  async creditCoins(
    userId: string,
    amount: number,
    referenceType: string,
    referenceId: string | null,
    description: string,
    actorId: string
  ): Promise<void> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const wallet = await this.getWallet(userId);

    const newBalance = wallet.currentBalance + amount;
    const newLifetimeEarned = wallet.lifetimeEarned + amount;

    await db
      .update(userWallets)
      .set({
        currentBalance: newBalance,
        lifetimeEarned: newLifetimeEarned,
        updatedAt: new Date(),
      })
      .where(eq(userWallets.id, wallet.id));

    // Record transaction
    await this.transactionService.recordTransaction({
      walletId: wallet.id,
      userId,
      transactionType: 'credit',
      amount,
      balanceBefore: wallet.currentBalance,
      balanceAfter: newBalance,
      referenceType,
      referenceId,
      description,
    });

    // Log audit
    await this.auditLogger.log({
      actorId,
      targetUserId: userId,
      actionType: 'balance_updated',
      oldValue: { balance: wallet.currentBalance },
      newValue: { balance: newBalance },
    });
  }

  /**
   * Debit coins from a wallet
   */
  async debitCoins(
    userId: string,
    amount: number,
    referenceType: string,
    referenceId: string | null,
    description: string,
    actorId: string
  ): Promise<void> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const wallet = await this.getWallet(userId);

    if (wallet.currentBalance < amount) {
      throw new Error('Insufficient balance');
    }

    const newBalance = wallet.currentBalance - amount;
    const newLifetimeSpent = wallet.lifetimeSpent + amount;

    await db
      .update(userWallets)
      .set({
        currentBalance: newBalance,
        lifetimeSpent: newLifetimeSpent,
        updatedAt: new Date(),
      })
      .where(eq(userWallets.id, wallet.id));

    // Record transaction
    await this.transactionService.recordTransaction({
      walletId: wallet.id,
      userId,
      transactionType: 'debit',
      amount,
      balanceBefore: wallet.currentBalance,
      balanceAfter: newBalance,
      referenceType,
      referenceId,
      description,
    });

    // Log audit
    await this.auditLogger.log({
      actorId,
      targetUserId: userId,
      actionType: 'balance_updated',
      oldValue: { balance: wallet.currentBalance },
      newValue: { balance: newBalance },
    });
  }

  /**
   * Adjust wallet balance (admin operation)
   */
  async adjustBalance(
    userId: string,
    amount: number,
    reason: string,
    actorId: string
  ): Promise<void> {
    const wallet = await this.getWallet(userId);

    const newBalance = wallet.currentBalance + amount;

    if (newBalance < 0) {
      throw new Error('Balance cannot be negative');
    }

    const transactionType = amount >= 0 ? 'credit' : 'debit';
    const absoluteAmount = Math.abs(amount);

    await db
      .update(userWallets)
      .set({
        currentBalance: newBalance,
        updatedAt: new Date(),
      })
      .where(eq(userWallets.id, wallet.id));

    // Record transaction
    await this.transactionService.recordTransaction({
      walletId: wallet.id,
      userId,
      transactionType: amount >= 0 ? 'admin_grant' : 'adjustment',
      amount: absoluteAmount,
      balanceBefore: wallet.currentBalance,
      balanceAfter: newBalance,
      referenceType: 'admin_adjustment',
      referenceId: null,
      description: reason,
    });

    // Log audit
    await this.auditLogger.log({
      actorId,
      targetUserId: userId,
      actionType: 'balance_updated',
      oldValue: { balance: wallet.currentBalance },
      newValue: { balance: newBalance },
    });
  }

  /**
   * Update wallet status
   */
  async updateWalletStatus(
    userId: string,
    status: 'active' | 'suspended' | 'frozen',
    actorId: string
  ): Promise<void> {
    const wallet = await this.getWallet(userId);

    await db
      .update(userWallets)
      .set({
        walletStatus: status,
        updatedAt: new Date(),
      })
      .where(eq(userWallets.id, wallet.id));

    // Log audit
    await this.auditLogger.log({
      actorId,
      targetUserId: userId,
      actionType: 'status_changed',
      oldValue: { status: wallet.walletStatus },
      newValue: { status },
    });
  }
}

export const walletManager = new WalletManager();
