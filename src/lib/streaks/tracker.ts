import { db } from '@/db';
import { userStreaks, streakHistory } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import type { 
  UserStreak, 
  StreakHistoryEntry, 
  StreakActivityEvent, 
  StreakStatus,
  ActivityType 
} from '@/types/streak';

// Default engagement window: 24 hours
const DEFAULT_ENGAGEMENT_WINDOW_HOURS = 24;

/**
 * Get or create user streak record
 */
export async function getOrCreateUserStreak(userId: string): Promise<UserStreak> {
  let streak = await db.select().from(userStreaks).where(eq(userStreaks.userId, userId)).limit(1);

  if (streak.length === 0) {
    const newStreak = await db.insert(userStreaks).values({
      userId,
      currentStreak: 0,
      longestStreak: 0,
      streakStatus: 'active',
    }).returning();
    
    streak = newStreak;
  }

  return streak[0] as UserStreak;
}

/**
 * Record a learning activity and update streak
 */
export async function recordActivity(
  userId: string, 
  activityType: ActivityType
): Promise<UserStreak> {
  const streak = await getOrCreateUserStreak(userId);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Check if streak is broken
  if (streak.lastActivityDate) {
    const lastActivity = new Date(streak.lastActivityDate);
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    // If more than 1 day has passed, streak is broken
    if (daysDiff > 1) {
      await db.update(userStreaks)
        .set({ 
          currentStreak: 0,
          streakStatus: 'broken',
          updatedAt: now 
        })
        .where(eq(userStreaks.userId, userId));
      
      streak.currentStreak = 0;
      streak.streakStatus = 'broken';
    }
  }

  // Calculate new streak value
  let newStreakValue = streak.currentStreak;
  
  if (streak.lastActivityDate) {
    const lastActivity = new Date(streak.lastActivityDate);
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    // If activity was yesterday, increment streak
    if (daysDiff === 1) {
      newStreakValue += 1;
    } else if (daysDiff === 0) {
      // Same day, don't increment
    } else {
      // Streak was broken, start new streak
      newStreakValue = 1;
    }
  } else {
    // First activity ever
    newStreakValue = 1;
  }

  // Update longest streak if needed
  const newLongestStreak = Math.max(streak.longestStreak, newStreakValue);

  // Update user streak
  const updatedStreak = await db.update(userStreaks)
    .set({
      currentStreak: newStreakValue,
      longestStreak: newLongestStreak,
      lastActivityDate: today.toISOString().split('T')[0],
      streakStatus: 'active',
      updatedAt: now,
    })
    .where(eq(userStreaks.userId, userId))
    .returning();

  // Record in history
  await db.insert(streakHistory).values({
    userId,
    activityDate: today.toISOString().split('T')[0],
    streakValue: newStreakValue,
    activityType,
  });

  return updatedStreak[0] as UserStreak;
}

/**
 * Check if user has activity today
 */
export async function hasActivityToday(userId: string): Promise<boolean> {
  const streak = await db.select().from(userStreaks).where(eq(userStreaks.userId, userId)).limit(1);
  
  if (streak.length === 0 || !streak[0].lastActivityDate) {
    return false;
  }

  const today = new Date();
  const lastActivity = new Date(streak[0].lastActivityDate);
  
  return (
    today.getFullYear() === lastActivity.getFullYear() &&
    today.getMonth() === lastActivity.getMonth() &&
    today.getDate() === lastActivity.getDate()
  );
}

/**
 * Get streak history for a user
 */
export async function getStreakHistory(
  userId: string, 
  limit: number = 30
): Promise<StreakHistoryEntry[]> {
  const history = await db.select()
    .from(streakHistory)
    .where(eq(streakHistory.userId, userId))
    .orderBy(desc(streakHistory.activityDate))
    .limit(limit);

  return history.map(entry => ({
    ...entry,
    activityDate: new Date(entry.activityDate),
  })) as StreakHistoryEntry[];
}

/**
 * Check if streak is at risk of breaking
 */
export async function isStreakAtRisk(userId: string): Promise<boolean> {
  const streak = await db.select().from(userStreaks).where(eq(userStreaks.userId, userId)).limit(1);
  
  if (streak.length === 0 || streak[0].streakStatus !== 'active' || !streak[0].lastActivityDate) {
    return false;
  }

  const now = new Date();
  const lastActivity = new Date(streak[0].lastActivityDate);
  const hoursDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
  
  // Consider at risk if more than 20 hours have passed
  return hoursDiff > 20;
}

/**
 * Get streak statistics
 */
export async function getStreakStatistics(userId: string) {
  const streak = await getOrCreateUserStreak(userId);
  const history = await getStreakHistory(userId, 365);
  
  const totalDaysActive = history.length;
  const averageStreakLength = totalDaysActive > 0 ? streak.longestStreak / totalDaysActive : 0;

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    totalDaysActive,
    averageStreakLength,
    streakHistory: history,
  };
}

/**
 * Reset user streak (admin function)
 */
export async function resetUserStreak(userId: string, reason?: string): Promise<UserStreak> {
  const now = new Date();
  
  const updatedStreak = await db.update(userStreaks)
    .set({
      currentStreak: 0,
      streakStatus: 'broken',
      updatedAt: now,
    })
    .where(eq(userStreaks.userId, userId))
    .returning();

  return updatedStreak[0] as UserStreak;
}

/**
 * Freeze user streak (prevent expiration)
 */
export async function freezeUserStreak(userId: string): Promise<UserStreak> {
  const now = new Date();
  
  const updatedStreak = await db.update(userStreaks)
    .set({
      streakStatus: 'frozen',
      updatedAt: now,
    })
    .where(eq(userStreaks.userId, userId))
    .returning();

  return updatedStreak[0] as UserStreak;
}

/**
 * Unfreeze user streak
 */
export async function unfreezeUserStreak(userId: string): Promise<UserStreak> {
  const now = new Date();
  
  const updatedStreak = await db.update(userStreaks)
    .set({
      streakStatus: 'active',
      updatedAt: now,
    })
    .where(eq(userStreaks.userId, userId))
    .returning();

  return updatedStreak[0] as UserStreak;
}
