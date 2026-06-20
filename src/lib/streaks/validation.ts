import { db } from '@/db';
import { userStreaks, streakRecoveryRequests } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import type { 
  StreakStatus,
  RecoveryType,
  RecoveryStatus,
  ActivityType 
} from '@/types/streak';

/**
 * Validate if an activity type qualifies for streak tracking
 */
export function isValidActivityType(activityType: string): activityType is ActivityType {
  const validTypes: ActivityType[] = ['lesson', 'quiz', 'vocabulary', 'story', 'practice'];
  return validTypes.includes(activityType as ActivityType);
}

/**
 * Validate streak status transition
 */
export function isValidStreakStatusTransition(
  currentStatus: StreakStatus,
  newStatus: StreakStatus
): boolean {
  const validTransitions: Record<StreakStatus, StreakStatus[]> = {
    active: ['active', 'broken', 'frozen'],
    broken: ['active'],
    frozen: ['active', 'broken'],
  };

  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * Validate recovery type
 */
export function isValidRecoveryType(recoveryType: string): recoveryType is RecoveryType {
  const validTypes: RecoveryType[] = ['automatic', 'manual', 'reward_based', 'administrative', 'promotional'];
  return validTypes.includes(recoveryType as RecoveryType);
}

/**
 * Validate recovery status transition
 */
export function isValidRecoveryStatusTransition(
  currentStatus: RecoveryStatus,
  newStatus: RecoveryStatus
): boolean {
  const validTransitions: Record<RecoveryStatus, RecoveryStatus[]> = {
    pending: ['approved', 'denied'],
    approved: ['completed'],
    denied: [],
    completed: [],
  };

  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * Check if user can request recovery based on cooldown period
 */
export async function isRecoveryCooldownActive(userId: string): Promise<boolean> {
  const now = new Date();
  const cooldownDays = 7; // 7-day cooldown between recoveries

  const lastApprovedRecovery = await db.select()
    .from(streakRecoveryRequests)
    .where(
      and(
        eq(streakRecoveryRequests.userId, userId),
        eq(streakRecoveryRequests.status, 'completed')
      )
    )
    .orderBy(streakRecoveryRequests.reviewedAt)
    .limit(1);

  if (lastApprovedRecovery.length === 0 || !lastApprovedRecovery[0].reviewedAt) {
    return false;
  }

  const lastRecoveryDate = new Date(lastApprovedRecovery[0].reviewedAt);
  const daysSinceLastRecovery = Math.floor(
    (now.getTime() - lastRecoveryDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceLastRecovery < cooldownDays;
}

/**
 * Validate streak data integrity
 */
export async function validateStreakDataIntegrity(userId: string): Promise<{
  isValid: boolean;
  issues: string[];
}> {
  const issues: string[] = [];

  const streak = await db.select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId))
    .limit(1);

  if (streak.length === 0) {
    return { isValid: true, issues: [] };
  }

  const streakData = streak[0];

  // Check if current streak is negative
  if (streakData.currentStreak < 0) {
    issues.push('Current streak cannot be negative');
  }

  // Check if longest streak is less than current streak
  if (streakData.longestStreak < streakData.currentStreak) {
    issues.push('Longest streak should be >= current streak');
  }

  // Check if streak status is valid
  const validStatuses: StreakStatus[] = ['active', 'broken', 'frozen'];
  if (!validStatuses.includes(streakData.streakStatus as StreakStatus)) {
    issues.push('Invalid streak status');
  }

  // Check if last activity date is in the future
  if (streakData.lastActivityDate) {
    const lastActivity = new Date(streakData.lastActivityDate);
    const now = new Date();
    if (lastActivity > now) {
      issues.push('Last activity date cannot be in the future');
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Validate recovery request data
 */
export function validateRecoveryRequestData(data: {
  userId: string;
  missedDate: Date;
  recoveryType: string;
  reason?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.userId) {
    errors.push('User ID is required');
  }

  if (!data.missedDate) {
    errors.push('Missed date is required');
  } else {
    const missedDate = new Date(data.missedDate);
    const now = new Date();
    
    if (isNaN(missedDate.getTime())) {
      errors.push('Invalid missed date');
    } else if (missedDate > now) {
      errors.push('Missed date cannot be in the future');
    } else if (missedDate < new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())) {
      errors.push('Missed date cannot be more than 1 year ago');
    }
  }

  if (!data.recoveryType) {
    errors.push('Recovery type is required');
  } else if (!isValidRecoveryType(data.recoveryType)) {
    errors.push('Invalid recovery type');
  }

  if (data.reason && data.reason.length > 500) {
    errors.push('Reason cannot exceed 500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if streak qualifies for automatic recovery
 */
export async function qualifiesForAutomaticRecovery(userId: string): Promise<boolean> {
  const streak = await db.select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId))
    .limit(1);

  if (streak.length === 0) {
    return false;
  }

  // Automatic recovery for streaks >= 7 days
  return streak[0].longestStreak >= 7;
}

/**
 * Validate engagement window compliance
 */
export function isWithinEngagementWindow(
  lastActivityDate: Date | null,
  engagementWindowHours: number = 24
): boolean {
  if (!lastActivityDate) {
    return false;
  }

  const now = new Date();
  const lastActivity = new Date(lastActivityDate);
  const hoursDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

  return hoursDiff <= engagementWindowHours;
}

/**
 * Get streak health status
 */
export async function getStreakHealthStatus(userId: string): Promise<{
  status: 'healthy' | 'at_risk' | 'broken' | 'frozen';
  message: string;
  hoursUntilBreak: number | null;
}> {
  const streak = await db.select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId))
    .limit(1);

  if (streak.length === 0) {
    return {
      status: 'broken',
      message: 'No streak data found',
      hoursUntilBreak: null,
    };
  }

  const streakData = streak[0];

  if (streakData.streakStatus === 'frozen') {
    return {
      status: 'frozen',
      message: 'Streak is frozen and will not expire',
      hoursUntilBreak: null,
    };
  }

  if (streakData.streakStatus === 'broken') {
    return {
      status: 'broken',
      message: 'Streak has been broken',
      hoursUntilBreak: null,
    };
  }

  if (!streakData.lastActivityDate) {
    return {
      status: 'broken',
      message: 'No recent activity recorded',
      hoursUntilBreak: null,
    };
  }

  const now = new Date();
  const lastActivity = new Date(streakData.lastActivityDate);
  const hoursDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
  const hoursUntilBreak = 24 - hoursDiff;

  if (hoursDiff < 12) {
    return {
      status: 'healthy',
      message: 'Streak is in good standing',
      hoursUntilBreak: Math.max(0, hoursUntilBreak),
    };
  } else if (hoursDiff < 20) {
    return {
      status: 'at_risk',
      message: 'Streak at risk - complete an activity soon',
      hoursUntilBreak: Math.max(0, hoursUntilBreak),
    };
  } else {
    return {
      status: 'broken',
      message: 'Streak has expired',
      hoursUntilBreak: 0,
    };
  }
}
