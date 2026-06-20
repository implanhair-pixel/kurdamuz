// Achievement categories
export type AchievementCategory = 
  | 'learning'
  | 'course'
  | 'quiz'
  | 'consistency'
  | 'streak'
  | 'xp'
  | 'level'
  | 'social'
  | 'special_event'
  | 'seasonal'
  | 'administrative';

// Reward types
export type RewardType = 'xp' | 'badge' | 'certificate' | 'item' | 'access' | 'title' | 'custom';

// Achievement status
export type AchievementStatus = 'in_progress' | 'completed' | 'claimed';

// Audit action types
export type AuditActionType = 
  | 'earned'
  | 'claimed'
  | 'revoked'
  | 'manually_awarded'
  | 'criteria_updated';

// Achievement definition
export interface AchievementDefinition {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  xpBonus: number;
  criteria: Record<string, any>;
  createdAt: Date;
}

// User achievement progress
export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: Date | null;
  progressValue: number;
  status: AchievementStatus;
}

// Achievement audit log entry
export interface AchievementAuditLog {
  id: string;
  actorId: string;
  targetUserId: string;
  actionType: AuditActionType;
  oldValue: Record<string, any> | null;
  newValue: Record<string, any> | null;
  createdAt: Date;
}

// Achievement criteria structure
export interface AchievementCriteria {
  type: 'count' | 'streak' | 'cumulative' | 'conditional' | 'composite';
  target: number;
  conditions?: Record<string, any>;
  timeframe?: {
    start: Date;
    end: Date;
  };
  dependencies?: string[];
}

// Achievement reward
export interface AchievementReward {
  type: RewardType;
  value: number;
  metadata?: Record<string, any>;
}

// Achievement progress tracking
export interface AchievementProgress {
  achievementId: string;
  currentProgress: number;
  targetProgress: number;
  percentageComplete: number;
  estimatedCompletion: Date | null;
  milestones: AchievementMilestone[];
}

// Achievement milestone
export interface AchievementMilestone {
  value: number;
  title: string;
  description: string;
  reward: AchievementReward;
  achieved: boolean;
  achievedAt: Date | null;
}

// Achievement evaluation context
export interface AchievementEvaluationContext {
  userId: string;
  eventType: string;
  eventData: Record<string, any>;
  timestamp: Date;
}

// Achievement evaluation result
export interface AchievementEvaluationResult {
  achievementId: string;
  qualified: boolean;
  progressUpdate: number;
  rewardEarned: boolean;
  reward: AchievementReward | null;
}

// Achievement statistics
export interface AchievementStatistics {
  totalAchievements: number;
  earnedAchievements: number;
  inProgressAchievements: number;
  completionRate: number;
  totalXpEarned: number;
  recentAchievements: UserAchievement[];
  achievementCategories: Record<AchievementCategory, number>;
}

// Create achievement input
export interface CreateAchievementInput {
  name: string;
  description?: string;
  icon?: string;
  xpBonus: number;
  criteria: AchievementCriteria;
}

// Update achievement input
export interface UpdateAchievementInput {
  id: string;
  name?: string;
  description?: string;
  icon?: string;
  xpBonus?: number;
  criteria?: AchievementCriteria;
}

// Claim achievement reward input
export interface ClaimAchievementRewardInput {
  userId: string;
  achievementId: string;
}

// Manually award achievement input
export interface ManuallyAwardAchievementInput {
  userId: string;
  achievementId: string;
  actorId: string;
  reason?: string;
}
