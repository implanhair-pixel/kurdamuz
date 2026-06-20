import { z } from 'zod';

// Wallet status enum
export const WalletStatusSchema = z.enum(['active', 'suspended', 'frozen']);

// Transaction type enum
export const TransactionTypeSchema = z.enum([
  'credit',
  'debit',
  'adjustment',
  'correction',
  'refund',
  'admin_grant',
  'reward_distribution',
]);

// Reference type enum
export const ReferenceTypeSchema = z.enum([
  'lesson_completion',
  'quiz_completion',
  'daily_login',
  'streak_milestone',
  'mission_completion',
  'admin_adjustment',
]);

// Event type enum for coin economy policies
export const EventTypeSchema = z.enum([
  'daily_login',
  'lesson_completion',
  'quiz_completion',
  'vocabulary_session',
  'streak_milestone',
  'mission_completion',
]);

// Audit action type enum
export const AuditActionTypeSchema = z.enum([
  'wallet_created',
  'balance_updated',
  'transaction_recorded',
  'status_changed',
  'policy_modified',
]);

// Create wallet schema
export const CreateWalletSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

// Credit coins schema
export const CreditCoinsSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  amount: z.number().int().positive('Amount must be a positive integer'),
  referenceType: ReferenceTypeSchema,
  referenceId: z.string().uuid('Invalid reference ID').nullable(),
  description: z.string().min(1).max(500).optional(),
  actorId: z.string().uuid('Invalid actor ID'),
});

// Debit coins schema
export const DebitCoinsSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  amount: z.number().int().positive('Amount must be a positive integer'),
  referenceType: ReferenceTypeSchema,
  referenceId: z.string().uuid('Invalid reference ID').nullable(),
  description: z.string().min(1).max(500).optional(),
  actorId: z.string().uuid('Invalid actor ID'),
});

// Adjust balance schema (admin)
export const AdjustBalanceSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  amount: z.number().int('Amount must be an integer'),
  reason: z.string().min(1).max(500, 'Reason must be between 1 and 500 characters'),
  actorId: z.string().uuid('Invalid actor ID'),
});

// Update wallet status schema
export const UpdateWalletStatusSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  status: WalletStatusSchema,
  actorId: z.string().uuid('Invalid actor ID'),
});

// Get wallet balance schema
export const GetWalletBalanceSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

// Get transaction history schema
export const GetTransactionHistorySchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});

// Upsert policy schema
export const UpsertPolicySchema = z.object({
  eventType: EventTypeSchema,
  coinReward: z.number().int().nonnegative('Coin reward must be a non-negative integer'),
  xpReward: z.number().int().nonnegative('XP reward must be a non-negative integer'),
  isActive: z.boolean().default(true),
  actorId: z.string().uuid('Invalid actor ID'),
});

// Get policy schema
export const GetPolicySchema = z.object({
  eventType: EventTypeSchema,
});

// Deactivate policy schema
export const DeactivatePolicySchema = z.object({
  eventType: EventTypeSchema,
});

// Activate policy schema
export const ActivatePolicySchema = z.object({
  eventType: EventTypeSchema,
});

// Delete policy schema
export const DeletePolicySchema = z.object({
  eventType: EventTypeSchema,
});

// Get audit logs schema
export const GetAuditLogsSchema = z.object({
  targetUserId: z.string().uuid('Invalid user ID').optional(),
  actionType: AuditActionTypeSchema.optional(),
  actorId: z.string().uuid('Invalid actor ID').optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});

// Wallet response schema
export const WalletResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  currentBalance: z.number().int(),
  lifetimeEarned: z.number().int(),
  lifetimeSpent: z.number().int(),
  walletStatus: WalletStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Transaction response schema
export const TransactionResponseSchema = z.object({
  id: z.string().uuid(),
  walletId: z.string().uuid(),
  userId: z.string().uuid(),
  transactionType: TransactionTypeSchema,
  amount: z.number().int(),
  balanceBefore: z.number().int(),
  balanceAfter: z.number().int(),
  referenceType: ReferenceTypeSchema.nullable(),
  referenceId: z.string().uuid().nullable(),
  description: z.string().nullable(),
  createdAt: z.date(),
});

// Policy response schema
export const PolicyResponseSchema = z.object({
  id: z.string().uuid(),
  eventType: EventTypeSchema,
  coinReward: z.number().int(),
  xpReward: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Audit log response schema
export const AuditLogResponseSchema = z.object({
  id: z.string().uuid(),
  actorId: z.string().uuid(),
  targetUserId: z.string().uuid(),
  actionType: AuditActionTypeSchema,
  oldValue: z.any().nullable(),
  newValue: z.any().nullable(),
  createdAt: z.date(),
});

// Export all schemas for use in API routes and server actions
export const WalletValidationSchemas = {
  CreateWalletSchema,
  CreditCoinsSchema,
  DebitCoinsSchema,
  AdjustBalanceSchema,
  UpdateWalletStatusSchema,
  GetWalletBalanceSchema,
  GetTransactionHistorySchema,
  UpsertPolicySchema,
  GetPolicySchema,
  DeactivatePolicySchema,
  ActivatePolicySchema,
  DeletePolicySchema,
  GetAuditLogsSchema,
  WalletResponseSchema,
  TransactionResponseSchema,
  PolicyResponseSchema,
  AuditLogResponseSchema,
};
