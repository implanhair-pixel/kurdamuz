import { userStreaks, streakHistory, streakRecoveryRequests } from '@/db/schema';

// Streak status types
export type StreakStatus = 'active' | 'broken' | 'frozen';

// Activity types that contribute to streaks
export type ActivityType = 'lesson' | 'quiz' | 'vocabulary' | 'story' | 'practice';

// Recovery types
export type RecoveryType = 'automatic' | 'manual' | 'reward_based' | 'administrative' | 'promotional';

// Recovery request status
export type RecoveryStatus = 'pending' | 'approved' | 'denied' | 'completed';

// User streak data
export interface UserStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  streakStatus: StreakStatus;
  updatedAt: Date;
}

// Streak history entry
export interface StreakHistoryEntry {
  id: string;
  userId: string;
  activityDate: Date;
  streakValue: number;
  activityType: ActivityType;
  createdAt: Date;
}

// Streak recovery request
export interface StreakRecoveryRequest {
  id: string;
  userId: string;
  missedDate: Date;
  recoveryType: RecoveryType;
  status: RecoveryStatus;
  reason: string | null;
  reviewedBy: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
}

// Streak statistics
export interface StreakStatistics {
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
  averageStreakLength: number;
  streakHistory: StreakHistoryEntry[];
  recoveryRequests: StreakRecoveryRequest[];
}

// Streak activity event
export interface StreakActivityEvent {
  userId: string;
  activityType: ActivityType;
  activityDate: Date;
  timestamp: Date;
}

// Streak recovery request input
export interface CreateRecoveryRequestInput {
  userId: string;
  missedDate: Date;
  recoveryType: RecoveryType;
  reason?: string;
}

// Streak recovery approval input
export interface ApproveRecoveryRequestInput {
  requestId: string;
  reviewedBy: string;
  approved: boolean;
  reason?: string;
}

// Streak policy configuration
export interface StreakPolicy {
  engagementWindowHours: number;
  maxRecoveriesPerMonth: number;
  recoveryCooldownDays: number;
  automaticRecoveryEnabled: boolean;
  rewardBasedRecoveryEnabled: boolean;
}

// Streak milestone
export interface StreakMilestone {
  streakValue: number;
  title: string;
  description: string;
  rewardXp: number;
  icon: string;
  achieved: boolean;
  achievedAt: Date | null;
}
