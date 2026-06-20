import { db } from '@/db';
import { userProgress, lessons, userStreaks, streakHistory } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import type { RecommendationInputs } from '@/types/learning-paths';

/**
 * Integration with Phase 10: Placement Test
 * Fetches placement test results to inform recommendations
 * Note: Placement test system may not be fully implemented yet
 */
export async function getPlacementTestResults(userId: string): Promise<any> {
  // Placeholder - would integrate with Phase 10 placement test system when available
  return null;
}

/**
 * Integration with Phase 6: XP System
 * Fetches XP history from lesson completions to inform engagement scoring
 */
export async function getXPHistory(userId: string): Promise<any[]> {
  const progress = await db
    .select({
      lessonId: userProgress.lessonId,
      completedAt: userProgress.completedAt,
      xpEarned: lessons.xpReward,
    })
    .from(userProgress)
    .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
    .where(eq(userProgress.userId, userId))
    .orderBy(desc(userProgress.completedAt))
    .limit(50);

  return progress.map(p => ({
    date: p.completedAt,
    xp: p.xpEarned || 0,
    source: 'lesson_completion',
  }));
}

/**
 * Integration with Phase 7: Achievements & Streaks
 * Fetches achievements and streak data to inform recommendations
 */
export async function getAchievementsAndStreaks(userId: string): Promise<{
  achievements: any[];
  streakActivity: any;
}> {
  // Get streak data
  const streakData = await db
    .select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId))
    .limit(1);

  const streakActivity = streakData[0] || null;

  // Get recent streak history
  const recentStreakHistory = await db
    .select()
    .from(streakHistory)
    .where(eq(streakHistory.userId, userId))
    .orderBy(desc(streakHistory.activityDate))
    .limit(30);

  // Placeholder for achievements - would integrate with achievement system when available
  const achievements: any[] = [];

  return {
    achievements,
    streakActivity: streakActivity ? {
      currentStreak: streakActivity.currentStreak,
      longestStreak: streakActivity.longestStreak,
      status: streakActivity.streakStatus,
      recentActivity: recentStreakHistory,
    } : null,
  };
}

/**
 * Integration with Phase 8: Daily Challenges
 * Fetches daily challenge performance data
 * Note: Daily challenges system may not be fully implemented yet
 */
export async function getDailyChallengePerformance(userId: string): Promise<any[]> {
  // Placeholder - would integrate with Phase 8 daily challenges system when available
  return [];
}

/**
 * Integration with Phase 9: Daily Missions
 * Fetches daily mission completion data
 * Note: Daily missions system may not be fully implemented yet
 */
export async function getDailyMissionCompletion(userId: string): Promise<any[]> {
  // Placeholder - would integrate with Phase 9 daily missions system when available
  return [];
}

/**
 * Gather all integration data for recommendation engine
 */
export async function gatherIntegrationData(userId: string): Promise<RecommendationInputs> {
  const [placementResults, xpHistory, achievementsStreaks, challengePerformance, missionCompletion] =
    await Promise.all([
      getPlacementTestResults(userId),
      getXPHistory(userId),
      getAchievementsAndStreaks(userId),
      getDailyChallengePerformance(userId),
      getDailyMissionCompletion(userId),
    ]);

  return {
    userId,
    placementResults,
    learningProgress: [], // Would be fetched from userLearningProgress table
    assessmentPerformance: [], // Would be fetched from existing quiz system
    xpHistory,
    achievements: achievementsStreaks.achievements,
    streakActivity: achievementsStreaks.streakActivity,
    missionCompletion,
    engagementMetrics: {
      totalXP: xpHistory.reduce((sum, h) => sum + h.xp, 0),
      activityDays: xpHistory.length,
    },
    learningBehaviors: {},
    individualGoals: {},
  };
}
