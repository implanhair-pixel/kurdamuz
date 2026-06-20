import { db } from '../../db/index';
import {
  xpTransactions,
  userLevels,
  levelDefinitions,
} from '../../db/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import type {
  XPAnalytics,
  PlatformXPAnalytics,
  UserEngagementMetrics,
  Leaderboard,
  LeaderboardEntry,
  LeaderboardTimeframe,
  XPSourceType,
} from '../../types/xp';

/**
 * Get XP analytics for a specific user
 */
export async function getUserXPAnalytics(
  userId: string,
  timeRange: 'daily' | 'weekly' | 'monthly' = 'weekly'
): Promise<XPAnalytics> {
  const [userLevel] = await db
    .select()
    .from(userLevels)
    .where(eq(userLevels.userId, userId));

  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case 'daily':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'weekly':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'monthly':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
  }

  // Get XP earned in time period
  const [xpResult] = await db
    .select({
      total: sql<number>`sum(${xpTransactions.xpAmount})`,
    })
    .from(xpTransactions)
    .where(
      and(
        eq(xpTransactions.userId, userId),
        gte(xpTransactions.createdAt, startDate),
        eq(xpTransactions.transactionType, 'earned')
      )
    );

  const xpGrowth = xpResult?.total || 0;

  // Get XP history (grouped by day)
  const xpHistory = await db
    .select({
      date: sql<string>`date(${xpTransactions.createdAt})`,
      xp: sql<number>`sum(${xpTransactions.xpAmount})`,
    })
    .from(xpTransactions)
    .where(
      and(
        eq(xpTransactions.userId, userId),
        gte(xpTransactions.createdAt, startDate),
        eq(xpTransactions.transactionType, 'earned')
      )
    )
    .groupBy(sql`date(${xpTransactions.createdAt})`)
    .orderBy(sql`date(${xpTransactions.createdAt})`);

  // Get top XP sources
  const topSources = await db
    .select({
      sourceType: xpTransactions.sourceType,
      count: sql<number>`count(*)`,
      totalXP: sql<number>`sum(${xpTransactions.xpAmount})`,
    })
    .from(xpTransactions)
    .where(
      and(
        eq(xpTransactions.userId, userId),
        gte(xpTransactions.createdAt, startDate),
        eq(xpTransactions.transactionType, 'earned')
      )
    )
    .groupBy(xpTransactions.sourceType)
    .orderBy(sql`sum(${xpTransactions.xpAmount}) DESC`)
    .limit(5);

  return {
    userId,
    totalXP: userLevel?.totalXP || 0,
    currentLevel: userLevel?.currentLevel || 1,
    xpGrowth: {
      daily: await getXPInTimePeriod(userId, 'daily'),
      weekly: await getXPInTimePeriod(userId, 'weekly'),
      monthly: await getXPInTimePeriod(userId, 'monthly'),
    },
    xpHistory: xpHistory.map((h) => ({
      date: h.date,
      xp: h.xp,
    })),
    topSources: topSources.map((s) => ({
      sourceType: s.sourceType as XPSourceType,
      count: s.count,
      totalXP: s.totalXP,
    })),
  };
}

/**
 * Get XP earned in a specific time period
 */
async function getXPInTimePeriod(
  userId: string,
  period: 'daily' | 'weekly' | 'monthly'
): Promise<number> {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'daily':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'weekly':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'monthly':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
  }

  const [result] = await db
    .select({
      total: sql<number>`sum(${xpTransactions.xpAmount})`,
    })
    .from(xpTransactions)
    .where(
      and(
        eq(xpTransactions.userId, userId),
        gte(xpTransactions.createdAt, startDate),
        eq(xpTransactions.transactionType, 'earned')
      )
    );

  return result?.total || 0;
}

/**
 * Get platform-wide XP analytics
 */
export async function getPlatformXPAnalytics(): Promise<PlatformXPAnalytics> {
  // Get total users
  const [userCount] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(userLevels);

  // Get total XP awarded
  const [xpResult] = await db
    .select({
      total: sql<number>`sum(${userLevels.totalXP})`,
    })
    .from(userLevels);

  // Get average XP per user
  const averageXP = userCount?.count ? (xpResult?.total || 0) / userCount.count : 0;

  // Get level distribution
  const levelDistribution = await db
    .select({
      level: userLevels.currentLevel,
      count: sql<number>`count(*)`,
    })
    .from(userLevels)
    .groupBy(userLevels.currentLevel)
    .orderBy(userLevels.currentLevel);

  const totalUsers = userCount?.count || 0;
  const distribution = levelDistribution.map((ld) => ({
    level: ld.level,
    count: ld.count,
    percentage: totalUsers > 0 ? (ld.count / totalUsers) * 100 : 0,
  }));

  // Get top earners
  const topEarners = await db
    .select({
      userId: userLevels.userId,
      totalXP: userLevels.totalXP,
      level: userLevels.currentLevel,
    })
    .from(userLevels)
    .orderBy(sql`${userLevels.totalXP} DESC`)
    .limit(10);

  // Get active XP sources
  const activeSources = await db
    .select({
      sourceType: xpTransactions.sourceType,
      totalXP: sql<number>`sum(${xpTransactions.xpAmount})`,
      count: sql<number>`count(*)`,
    })
    .from(xpTransactions)
    .where(eq(xpTransactions.transactionType, 'earned'))
    .groupBy(xpTransactions.sourceType)
    .orderBy(sql`sum(${xpTransactions.xpAmount}) DESC`)
    .limit(10);

  return {
    totalUsers: userCount?.count || 0,
    totalXPAwarded: xpResult?.total || 0,
    averageXPPerUser: averageXP,
    levelDistribution: distribution,
    topEarners: topEarners.map((te) => ({
      userId: te.userId,
      totalXP: te.totalXP,
      level: te.level,
    })),
    activeSources: activeSources.map((as) => ({
      sourceType: as.sourceType as XPSourceType,
      totalXP: as.totalXP,
      count: as.count,
    })),
  };
}

/**
 * Get level distribution
 */
export async function getLevelDistribution(): Promise<
  Array<{ level: number; count: number; percentage: number }>
> {
  const [userCount] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(userLevels);

  const levelDistribution = await db
    .select({
      level: userLevels.currentLevel,
      count: sql<number>`count(*)`,
    })
    .from(userLevels)
    .groupBy(userLevels.currentLevel)
    .orderBy(userLevels.currentLevel);

  const totalUsers = userCount?.count || 0;

  return levelDistribution.map((ld) => ({
    level: ld.level,
    count: ld.count,
    percentage: totalUsers > 0 ? (ld.count / totalUsers) * 100 : 0,
  }));
}

/**
 * Get reward utilization statistics
 */
export async function getRewardUtilization(): Promise<
  Array<{ rewardId: string; rewardName: string; claimCount: number }>
> {
  // This would query the user_rewards table
  // For now, return empty array as placeholder
  return [];
}

/**
 * Get achievement completion statistics
 */
export async function getAchievementCompletionStats(): Promise<
  Array<{ achievementId: string; achievementName: string; completionCount: number }>
> {
  // This would query the user_achievements table
  // For now, return empty array as placeholder
  return [];
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(
  timeframe: LeaderboardTimeframe = 'weekly',
  limit: number = 50
): Promise<Leaderboard> {
  const now = new Date();
  let startDate: Date;

  switch (timeframe) {
    case 'daily':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'weekly':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'monthly':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'all_time':
      startDate = new Date(0); // Beginning of time
      break;
  }

  // Get XP earned in timeframe for all users
  const xpEarned = await db
    .select({
      userId: xpTransactions.userId,
      xpGained: sql<number>`sum(${xpTransactions.xpAmount})`,
    })
    .from(xpTransactions)
    .where(
      and(
        gte(xpTransactions.createdAt, startDate),
        eq(xpTransactions.transactionType, 'earned')
      )
    )
    .groupBy(xpTransactions.userId)
    .orderBy(sql`sum(${xpTransactions.xpAmount}) DESC`)
    .limit(limit);

  // Get user levels for ranking
  const entries: LeaderboardEntry[] = [];
  for (let i = 0; i < xpEarned.length; i++) {
    const [userLevel] = await db
      .select()
      .from(userLevels)
      .where(eq(userLevels.userId, xpEarned[i].userId));

    if (userLevel) {
      entries.push({
        rank: i + 1,
        userId: userLevel.userId,
        totalXP: userLevel.totalXP,
        level: userLevel.currentLevel,
        xpGained: xpEarned[i].xpGained,
      });
    }
  }

  return {
    timeframe,
    entries,
  };
}

/**
 * Get leaderboard with user's position
 */
export async function getLeaderboardWithUserPosition(
  userId: string,
  timeframe: LeaderboardTimeframe = 'weekly',
  limit: number = 50
): Promise<Leaderboard> {
  const leaderboard = await getLeaderboard(timeframe, limit);

  // Find user's position
  const userEntry = leaderboard.entries.find((e) => e.userId === userId);
  const userRank = userEntry?.rank;

  return {
    timeframe,
    entries: leaderboard.entries,
    userRank,
    userEntry,
  };
}

/**
 * Get user engagement metrics
 */
export async function getUserEngagementMetrics(
  userId: string
): Promise<UserEngagementMetrics> {
  // Get user's total XP and level
  const [userLevel] = await db
    .select()
    .from(userLevels)
    .where(eq(userLevels.userId, userId));

  if (!userLevel) {
    return {
      userId,
      totalSessions: 0,
      averageSessionDuration: 0,
      streakDays: 0,
      longestStreak: 0,
      lastActiveDate: new Date(),
      engagementScore: 0,
    };
  }

  // Get recent activity
  const [recentTransaction] = await db
    .select()
    .from(xpTransactions)
    .where(eq(xpTransactions.userId, userId))
    .orderBy(desc(xpTransactions.createdAt))
    .limit(1);

  // Calculate engagement score based on XP growth rate
  const weeklyXP = await getXPInTimePeriod(userId, 'weekly');
  const engagementScore = Math.min(100, weeklyXP / 10); // 100 XP per week = 100% engagement

  return {
    userId,
    totalSessions: await getTotalSessions(userId),
    averageSessionDuration: await getAverageSessionDuration(userId),
    streakDays: await getStreakDays(userId),
    longestStreak: await getLongestStreak(userId),
    lastActiveDate: recentTransaction?.createdAt || new Date(),
    engagementScore,
  };
}

/**
 * Get total sessions for a user
 */
async function getTotalSessions(userId: string): Promise<number> {
  // This would track distinct login/activity sessions
  // For now, return count of days with activity
  const [result] = await db
    .select({
      count: sql<number>`count(distinct date(${xpTransactions.createdAt}))`,
    })
    .from(xpTransactions)
    .where(eq(xpTransactions.userId, userId));

  return result?.count || 0;
}

/**
 * Get average session duration
 */
async function getAverageSessionDuration(userId: string): Promise<number> {
  // This would track actual session durations
  // For now, return placeholder
  return 0;
}

/**
 * Get current streak days
 */
async function getStreakDays(userId: string): Promise<number> {
  // This would integrate with the streak system
  // For now, return placeholder
  return 0;
}

/**
 * Get longest streak
 */
async function getLongestStreak(userId: string): Promise<number> {
  // This would integrate with the streak system
  // For now, return placeholder
  return 0;
}

/**
 * Get XP growth trends for a user
 */
export async function getXPGrowthTrends(
  userId: string,
  days: number = 30
): Promise<Array<{ date: string; xp: number; cumulativeXP: number }>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const results = await db
    .select({
      date: sql<string>`date(${xpTransactions.createdAt})`,
      xp: sql<number>`sum(${xpTransactions.xpAmount})`,
    })
    .from(xpTransactions)
    .where(
      and(
        eq(xpTransactions.userId, userId),
        gte(xpTransactions.createdAt, startDate),
        eq(xpTransactions.transactionType, 'earned')
      )
    )
    .groupBy(sql`date(${xpTransactions.createdAt})`)
    .orderBy(sql`date(${xpTransactions.createdAt})`);

  let cumulativeXP = 0;
  return results.map((r) => {
    cumulativeXP += r.xp;
    return {
      date: r.date,
      xp: r.xp,
      cumulativeXP,
    };
  });
}
