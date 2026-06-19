// Wallet types for Phase 9.1 Coin System

export type WalletStatus = 'active' | 'suspended' | 'frozen';

export type TransactionType =
  | 'credit'
  | 'debit'
  | 'adjustment'
  | 'correction'
  | 'refund'
  | 'admin_grant'
  | 'reward_distribution';

export type ReferenceType =
  | 'lesson_completion'
  | 'quiz_completion'
  | 'daily_login'
  | 'streak_milestone'
  | 'mission_completion'
  | 'admin_adjustment';

export type EventType =
  | 'daily_login'
  | 'lesson_completion'
  | 'quiz_completion'
  | 'vocabulary_session'
  | 'streak_milestone'
  | 'mission_completion';

export type AuditActionType =
  | 'wallet_created'
  | 'balance_updated'
  | 'transaction_recorded'
  | 'status_changed'
  | 'policy_modified';

export interface Wallet {
  id: string;
  userId: string;
  currentBalance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  walletStatus: WalletStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  transactionType: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType?: ReferenceType;
  referenceId?: string | null;
  description?: string;
  createdAt: Date;
}

export interface WalletAuditLog {
  id: string;
  actorId: string;
  targetUserId: string;
  actionType: AuditActionType;
  oldValue: any;
  newValue: any;
  createdAt: Date;
}

export interface CoinEconomyPolicy {
  id: string;
  eventType: EventType;
  coinReward: number;
  xpReward: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RewardCalculation {
  coins: number;
  xp: number;
}

export interface WalletStats {
  currentBalance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  transactionCount: number;
  recentTransactions: WalletTransaction[];
}

export interface TransactionHistoryParams {
  userId: string;
  limit?: number;
  offset?: number;
}

export interface CreditCoinsParams {
  userId: string;
  amount: number;
  referenceType: ReferenceType;
  referenceId?: string | null;
  description?: string;
  actorId: string;
}

export interface DebitCoinsParams {
  userId: string;
  amount: number;
  referenceType: ReferenceType;
  referenceId?: string | null;
  description?: string;
  actorId: string;
}

export interface AdjustBalanceParams {
  userId: string;
  amount: number;
  reason: string;
  actorId: string;
}

export interface UpdateWalletStatusParams {
  userId: string;
  status: WalletStatus;
  actorId: string;
}

export interface UpsertPolicyParams {
  eventType: EventType;
  coinReward: number;
  xpReward: number;
  isActive?: boolean;
  actorId: string;
}
