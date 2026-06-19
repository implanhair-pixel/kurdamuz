import { db } from '@/db';
import { userStreaks, streakHistory, userAchievements } from '@/db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import type { EngagementMetrics, WeeklyActivity, MonthlyActivity } from '@/types/engagement';

/**
 * Calculate engagement metrics for a user
 */
export async function calculateEngagementMetrics(userId: string): Promise<EngagementMetrics> {
  const streak = await db.select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId))
    .limit(1);

  const history = await db.select()
    .from(streakHistory)
    .where(eq(streakHistory.userId, userId))
    .orderBy(desc(streakHistory.activityDate))
    .limit(90);

  const achievements = await db.select()
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));

  const currentStreak = streak[0]?.currentStreak || 0;
  const longestStreak = streak[0]?.longestStreak || 0;
  const totalLearningDays = history.length;
  const averageStreakLength = totalLearningDays > 0 ? longestStreak / totalLearningDays : 0;

  // Calculate weekly activity
  const weeklyActivity = calculateWeeklyActivity(history);

  // Calculate monthly activity
  const monthlyActivity = calculateMonthlyActivity(history);

  // Calculate engagement score (0-100)
  const engagementScore = calculateEngagementScore(
    currentStreak,
    longestStreak,
    totalLearningDays,
    achievements.filter(a => a.status === 'completed').length
  );

  // Calculate retention score (0-100)
  const retentionScore = calculateRetentionScore(history);

  return {
    userId,
    currentStreak,
    longestStreak,
    totalLearningDays,
    averageSessionDuration: 0, // Would be calculated from session data
    totalSessions: totalLearningDays,
    completionRate: 0, // Would be calculated from lesson completion data
    retentionScore,
    engagementScore,
    lastActiveDate: streak[0]?.lastActivityDate ? new Date(streak[0].lastActivityDate) : null as any,
    weeklyActivity,
    monthlyActivity,
  };
}

/**
 * Calculate weekly activity distribution
 */
function calculateWeeklyActivity(history: any[]): WeeklyActivity {
  const weekly: WeeklyActivity = {
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
  };

  history.forEach(entry => {
    const date = new Date(entry.activityDate);
    const day = date.getDay();
    const dayMap: Record<number, keyof WeeklyActivity> = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday',
    };
    weekly[dayMap[day]]++;
  });

  return weekly;
}

/**
 * Calculate monthly activity distribution
 */
function calculateMonthlyActivity(history: any[]): MonthlyActivity {
  const monthly: MonthlyActivity = {
    week1: 0,
    week2: 0,
    week3: 0,
    week4: 0,
  };

  history.forEach(entry => {
    const date = new Date(entry.activityDate);
    const dayOfMonth = date.getDate();
    const week = Math.min(Math.floor((dayOfMonth - 1) / 7), 3);
    const weekMap: Record<number, keyof MonthlyActivity> = {
      0: 'week1',
      1: 'week2',
      2: 'week3',
      3: 'week4',
    };
    monthly[weekMap[week]]++;
  });

  return monthly;
}

/**
 * Calculate engagement score (0-100)
 */
function calculateEngagementScore(
  currentStreak: number,
  longestStreak: number,
  totalLearningDays: number,
  achievementsEarned: number
): number {
  const streakScore = Math.min((currentStreak / 30) * 30, 30); // Max 30 points
  const consistencyScore = Math.min((longestStreak / 100) * 30, 30); // Max 30 points
  const activityScore = Math.min((totalLearningDays / 365) * 20, 20); // Max 20 points
  const achievementScore = Math.min((achievementsEarned / 10) * 20, 20); // Max 20 points

  return Math.round(streakScore + consistencyScore + activityScore + achievementScore);
}

/**
 * Calculate retention score (0-100)
 */
function calculateRetentionScore(history: any[]): number {
  if (history.length < 7) return 0;

  const recentHistory = history.slice(0, 30);
  let consecutiveDays = 0;
  let maxConsecutive = 0;

  for (let i = 0; i < recentHistory.length - 1; i++) {
    const currentDate = new Date(recentHistory[i].activityDate);
    const nextDate = new Date(recentHistory[i + 1].activityDate);
    const dayDiff = Math.abs((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));

    if (dayDiff <= 1) {
      consecutiveDays++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
    } else {
      consecutiveDays = 0;
    }
  }

  return Math.min((maxConsecutive / 30) * 100, 100);
}

/**
 * Get engagement analytics for a period
 */
export async function getEngagementAnalytics(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  const history = await db.select()
    .from(streakHistory)
    .where(
      and(
        eq(streakHistory.userId, userId),
        gte(streakHistory.activityDate, startDate.toISOString().split('T')[0]),
        lte(streakHistory.activityDate, endDate.toISOString().split('T')[0])
      )
    )
    .orderBy(desc(streakHistory.activityDate));

  return {
    totalActivities: history.length,
    activitiesByType: groupByActivityType(history),
    averageStreak: calculateAverageStreak(history),
    bestDay: findBestDay(history),
  };
}

/**
 * Group activities by type
 */
function groupByActivityType(history: any[]): Record<string, number> {
  const grouped: Record<string, number> = {};
  history.forEach(entry => {
    grouped[entry.activityType] = (grouped[entry.activityType] || 0) + 1;
  });
  return grouped;
}

/**
 * Calculate average streak from history
 */
function calculateAverageStreak(history: any[]): number {
  if (history.length === 0) return 0;
  const total = history.reduce((sum, entry) => sum + entry.streakValue, 0);
  return Math.round(total / history.length);
}

/**
 * Find the best day of the week for activity
 */
function findBestDay(history: any[]): string {
  const dayCounts: Record<number, number> = {};
  history.forEach(entry => {
    const day = new Date(entry.activityDate).getDay();
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let maxCount = 0;
  let bestDay = 'Monday';

  Object.entries(dayCounts).forEach(([day, count]) => {
    if (count > maxCount) {
      maxCount = count;
      bestDay = dayNames[parseInt(day)];
    }
  });

  return bestDay;
}

/**
 * Get cohort engagement data
 */
export async function getCohortEngagement(cohortStartDate: Date, cohortEndDate: Date) {
  // This would aggregate data for users who joined in the specified period
  // For now, return placeholder data
  return {
    cohortSize: 0,
    averageEngagementScore: 0,
    retentionRate: 0,
    averageStreakLength: 0,
  };
}
