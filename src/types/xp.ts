// ============================================================================
// PHASE 6: XP AND LEVELING SYSTEM TYPES
// ============================================================================

// XP Transaction Types
export type TransactionType = 'earned' | 'removed' | 'corrected';

export type XPSourceType =
  | 'lesson_completion'
  | 'quiz_completion'
  | 'course_completion'
  | 'daily_login'
  | 'streak'
  | 'achievement'
  | 'teacher_award'
  | 'admin_bonus'
  | 'special_event'
  | 'placement_test_completion'
  | 'community_post'
  | 'community_comment'
  | 'helpful_content';

export interface XPTransaction {
  id: string;
  userId: string;
  xpAmount: number;
  transactionType: TransactionType;
  sourceType: XPSourceType;
  sourceId?: string | null;
  description?: string | null;
  createdAt: Date;
}

export interface XPTransactionInput {
  userId: string;
  xpAmount: number;
  transactionType: TransactionType;
  sourceType: XPSourceType;
  sourceId?: string;
  description?: string;
}

// User Level Types
export interface UserLevel {
  id: string;
  userId: string;
  currentLevel: number;
  currentXP: number;
  totalXP: number;
  xpToNextLevel: number;
  updatedAt: Date;
}

export interface LevelProgress {
  currentLevel: number;
  currentXP: number;
  totalXP: number;
  xpToNextLevel: number;
  progressPercentage: number;
  canLevelUp: boolean;
}

// Level Definition Types
export interface LevelDefinition {
  id: string;
  levelNumber: number;
  requiredXP: number;
  title: string;
  badgeId?: string | null;
  createdAt: Date | null;
}

export interface LevelDefinitionInput {
  levelNumber: number;
  requiredXP: number;
  title: string;
  badgeId?: string | null;
}

// Reward Types
export type RewardType =
  | 'badge'
  | 'certificate'
  | 'avatar_item'
  | 'profile_decoration'
  | 'course_unlock'
  | 'special_content'
  | 'event_access';

export type RewardStatus = 'available' | 'claimed' | 'expired';

export interface Reward {
  id: string;
  name: string;
  description?: string | null;
  rewardType: RewardType;
  requiredLevel: number;
  requiredXP: number;
  active: boolean;
  createdAt: Date;
}

export interface RewardInput {
  name: string;
  description?: string | null;
  rewardType: RewardType;
  requiredLevel: number;
  requiredXP: number;
  active?: boolean;
}

export interface UserReward {
  id: string;
  userId: string;
  rewardId: string;
  earnedAt: Date;
  claimedAt?: Date | null;
  status: RewardStatus;
  reward?: Reward | null;
}

export interface RewardEligibility {
  eligible: boolean;
  reason?: string;
  missingRequirements?: {
    level?: number;
    xp?: number;
  };
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  xpBonus: number | null;
  criteria: Record<string, any>;
  createdAt: Date;
}

export interface AchievementInput {
  name: string;
  description?: string | null;
  icon?: string | null;
  xpBonus: number;
  criteria: Record<string, any>;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: Date | null;
  achievement?: Achievement | null;
}

export interface AchievementEligibility {
  eligible: boolean;
  reason?: string;
  progress?: number;
  total?: number;
}

// XP Audit Log Types
export type XPActionType =
  | 'xp_granted'
  | 'xp_removed'
  | 'xp_corrected'
  | 'reward_issued'
  | 'reward_claimed'
  | 'level_up'
  | 'policy_modified';

export interface XPAuditLog {
  id: string;
  actorId: string;
  targetUserId: string;
  actionType: XPActionType;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  reason?: string | null;
  createdAt: Date;
}

export interface XPAuditLogInput {
  actorId: string;
  targetUserId: string;
  actionType: XPActionType;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  reason?: string | null;
}

// Analytics Types
export interface XPAnalytics {
  userId: string;
  totalXP: number;
  currentLevel: number;
  xpGrowth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  xpHistory: Array<{
    date: string;
    xp: number;
  }>;
  topSources: Array<{
    sourceType: XPSourceType;
    count: number;
    totalXP: number;
  }>;
}

export interface PlatformXPAnalytics {
  totalUsers: number;
  totalXPAwarded: number;
  averageXPPerUser: number;
  levelDistribution: Array<{
    level: number;
    count: number;
    percentage: number;
  }>;
  topEarners: Array<{
    userId: string;
    totalXP: number;
    level: number;
  }>;
  activeSources: Array<{
    sourceType: XPSourceType;
    totalXP: number;
    count: number;
  }>;
}

export interface UserEngagementMetrics {
  userId: string;
  totalSessions: number;
  averageSessionDuration: number;
  streakDays: number;
  longestStreak: number;
  lastActiveDate: Date;
  engagementScore: number;
}

// Leaderboard Types
export type LeaderboardTimeframe = 'daily' | 'weekly' | 'monthly' | 'all_time';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  totalXP: number;
  level: number;
  xpGained: number;
  username?: string;
  avatar?: string;
}

export interface Leaderboard {
  timeframe: LeaderboardTimeframe;
  entries: LeaderboardEntry[];
  userRank?: number;
  userEntry?: LeaderboardEntry;
}

// XP Policy Types
export interface XPPolicy {
  sourceType: XPSourceType;
  baseXP: number;
  multipliers?: Record<string, number>;
  maxDaily?: number;
  cooldown?: number; // in minutes
  active: boolean;
}

export interface XPPolicyInput {
  sourceType: XPSourceType;
  baseXP: number;
  multipliers?: Record<string, number>;
  maxDaily?: number;
  cooldown?: number;
  active?: boolean;
}

// Progression Types
export interface ProgressionModel {
  name: string;
  formula: string;
  parameters: Record<string, number>;
  levelDefinitions: LevelDefinition[];
}

export interface LevelUpEvent {
  userId: string;
  oldLevel: number;
  newLevel: number;
  xpAtLevelUp: number;
  timestamp: Date;
  rewards?: Reward[];
}

// Dashboard Types
export interface XPDashboard {
  userLevel: UserLevel;
  recentTransactions: XPTransaction[];
  availableRewards: Reward[];
  earnedRewards: UserReward[];
  achievements: UserAchievement[];
  leaderboardPosition?: number;
  engagementMetrics?: UserEngagementMetrics;
}

export interface AdminXPDashboard {
  totalTransactions: number;
  totalXPAwarded: number;
  activeUsers: number;
  averageXPPerUser: number;
  recentActivity: XPTransaction[];
  topSources: Array<{
    sourceType: XPSourceType;
    count: number;
    totalXP: number;
  }>;
  levelDistribution: Array<{
    level: number;
    count: number;
  }>;
}

// Filter Types
export interface XPTransactionFilter {
  userId?: string;
  transactionType?: TransactionType;
  sourceType?: XPSourceType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface RewardFilter {
  rewardType?: RewardType;
  requiredLevel?: number;
  requiredXP?: number;
  active?: boolean;
  limit?: number;
  offset?: number;
}

export interface AchievementFilter {
  xpBonus?: number;
  limit?: number;
  offset?: number;
}

export interface AuditLogFilter {
  actorId?: string;
  targetUserId?: string;
  actionType?: XPActionType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// Error Types
export class XPError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'XPError';
  }
}

export const XPErrors = {
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  INVALID_XP_AMOUNT: 'INVALID_XP_AMOUNT',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  LEVEL_NOT_FOUND: 'LEVEL_NOT_FOUND',
  REWARD_NOT_FOUND: 'REWARD_NOT_FOUND',
  ACHIEVEMENT_NOT_FOUND: 'ACHIEVEMENT_NOT_FOUND',
  REWARD_ALREADY_CLAIMED: 'REWARD_ALREADY_CLAIMED',
  REWARD_NOT_ELIGIBLE: 'REWARD_NOT_ELIGIBLE',
  ACHIEVEMENT_ALREADY_EARNED: 'ACHIEVEMENT_ALREADY_EARNED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  LEVEL_UP_FAILED: 'LEVEL_UP_FAILED',
  POLICY_VIOLATION: 'POLICY_VIOLATION',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;
