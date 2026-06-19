import { db } from '../../db/index';
import { achievements, userAchievements, userLevels } from '../../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import type {
  Achievement,
  AchievementInput,
  UserAchievement,
  AchievementEligibility,
  AchievementFilter,
} from '../../types/xp';
import { XPErrors, XPError } from '../../types/xp';
import { awardXP } from './xp';
import { logXPTransaction } from './audits';

/**
 * Create a new achievement
 */
export async function createAchievement(
  data: AchievementInput,
  actorId: string
): Promise<Achievement> {
  const [achievement] = await db.insert(achievements).values(data).returning();

  // Log audit
  await logXPTransaction(actorId, 'policy_modified', {
    action: 'create_achievement',
    achievementId: achievement.id,
    ...data,
  });

  return achievement;
}

/**
 * Update an existing achievement
 */
export async function updateAchievement(
  achievementId: string,
  data: Partial<AchievementInput>,
  actorId: string
): Promise<Achievement> {
  const [achievement] = await db
    .update(achievements)
    .set(data)
    .where(eq(achievements.id, achievementId))
    .returning();

  if (!achievement) {
    throw new XPError('Achievement not found', XPErrors.ACHIEVEMENT_NOT_FOUND);
  }

  // Log audit
  await logXPTransaction(actorId, 'policy_modified', {
    action: 'update_achievement',
    achievementId,
    newData: data,
  });

  return achievement;
}

/**
 * Delete an achievement
 */
export async function deleteAchievement(
  achievementId: string,
  actorId: string
): Promise<void> {
  const [achievement] = await db
    .delete(achievements)
    .where(eq(achievements.id, achievementId))
    .returning();

  if (!achievement) {
    throw new XPError('Achievement not found', XPErrors.ACHIEVEMENT_NOT_FOUND);
  }

  // Log audit
  await logXPTransaction(actorId, 'policy_modified', {
    action: 'delete_achievement',
    achievementId,
    deletedData: achievement,
  });
}

/**
 * Get all achievements with optional filters
 */
export async function getAchievements(
  filters?: AchievementFilter
): Promise<Achievement[]> {
  const conditions = [];

  if (filters?.xpBonus !== undefined) {
    conditions.push(eq(achievements.xpBonus, filters.xpBonus));
  }

  const query = db
    .select()
    .from(achievements)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(achievements.createdAt));

  if (filters?.limit) {
    query.limit(filters.limit);
  }

  if (filters?.offset) {
    query.offset(filters.offset);
  }

  return await query;
}

/**
 * Get a single achievement by ID
 */
export async function getAchievement(
  achievementId: string
): Promise<Achievement | null> {
  const [achievement] = await db
    .select()
    .from(achievements)
    .where(eq(achievements.id, achievementId));

  return achievement || null;
}

/**
 * Check if a user is eligible for an achievement
 */
export async function checkAchievementEligibility(
  userId: string,
  achievementId: string
): Promise<AchievementEligibility> {
  const [achievement] = await db
    .select()
    .from(achievements)
    .where(eq(achievements.id, achievementId));

  if (!achievement) {
    throw new XPError('Achievement not found', XPErrors.ACHIEVEMENT_NOT_FOUND);
  }

  // Check if user already earned this achievement
  const [existingUserAchievement] = await db
    .select()
    .from(userAchievements)
    .where(
      and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      )
    );

  if (existingUserAchievement) {
    return {
      eligible: false,
      reason: 'Achievement already earned',
    };
  }

  // Evaluate achievement criteria
  const eligibility = await evaluateAchievementCriteria(
    userId,
    achievement.criteria
  );

  return eligibility;
}

/**
 * Evaluate achievement criteria
 */
async function evaluateAchievementCriteria(
  userId: string,
  criteria: Record<string, any>
): Promise<AchievementEligibility> {
  // This is a placeholder for achievement evaluation logic
  // In a real implementation, this would check various user metrics
  // such as lessons completed, quizzes passed, streaks, etc.

  const { type, target } = criteria;

  switch (type) {
    case 'lessons_completed':
      // Check if user has completed target number of lessons
      const lessonsCompleted = await getLessonsCompletedCount(userId);
      return {
        eligible: lessonsCompleted >= target,
        progress: lessonsCompleted,
        total: target,
      };

    case 'quizzes_perfect':
      // Check if user has target number of perfect quiz scores
      const perfectQuizzes = await getPerfectQuizCount(userId);
      return {
        eligible: perfectQuizzes >= target,
        progress: perfectQuizzes,
        total: target,
      };

    case 'streak_days':
      // Check if user has achieved target streak
      const [userLevel] = await db
        .select()
        .from(userLevels)
        .where(eq(userLevels.userId, userId));
      
      // This would need to integrate with the streak system
      return {
        eligible: false,
        reason: 'Streak integration not yet implemented',
      };

    default:
      return {
        eligible: false,
        reason: 'Unknown achievement type',
      };
  }
}

/**
 * Placeholder function to get lessons completed count
 */
async function getLessonsCompletedCount(userId: string): Promise<number> {
  // This would query the user_progress table
  // For now, return 0 as placeholder
  return 0;
}

/**
 * Placeholder function to get perfect quiz count
 */
async function getPerfectQuizCount(userId: string): Promise<number> {
  // This would query quiz results
  // For now, return 0 as placeholder
  return 0;
}

/**
 * Award an achievement to a user
 */
export async function awardAchievement(
  userId: string,
  achievementId: string,
  actorId?: string
): Promise<UserAchievement> {
  const eligibility = await checkAchievementEligibility(userId, achievementId);

  if (!eligibility.eligible) {
    throw new XPError(
      eligibility.reason || 'Not eligible for achievement',
      XPErrors.ACHIEVEMENT_ALREADY_EARNED
    );
  }

  const [achievement] = await db
    .select()
    .from(achievements)
    .where(eq(achievements.id, achievementId));

  if (!achievement) {
    throw new XPError('Achievement not found', XPErrors.ACHIEVEMENT_NOT_FOUND);
  }

  // Create user achievement record
  const [userAchievement] = await db
    .insert(userAchievements)
    .values({
      userId,
      achievementId,
      earnedAt: new Date(),
    })
    .returning();

  // Award XP bonus if applicable
  if ((achievement.xpBonus ?? 0) > 0) {
    await awardXP(
      userId,
      achievement.xpBonus ?? 0,
      'achievement',
      achievementId,
      `Achievement: ${achievement.name}`
    );
  }

  // Log audit
  await logXPTransaction(actorId || userId, 'policy_modified', {
    action: 'achievement_earned',
    userId,
    achievementId,
    xpBonus: achievement.xpBonus,
  });

  return userAchievement;
}

/**
 * Get all achievements for a user
 */
export async function getUserAchievements(
  userId: string
): Promise<UserAchievement[]> {
  return await db
    .select({
      id: userAchievements.id,
      userId: userAchievements.userId,
      achievementId: userAchievements.achievementId,
      earnedAt: userAchievements.earnedAt,
      achievement: achievements,
    })
    .from(userAchievements)
    .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId))
    .orderBy(desc(userAchievements.earnedAt));
}

/**
 * Evaluate all achievements for a user
 */
export async function evaluateAchievements(
  userId: string
): Promise<UserAchievement[]> {
  const allAchievements = await getAchievements();
  const newlyEarned: UserAchievement[] = [];

  for (const achievement of allAchievements) {
    try {
      const eligibility = await checkAchievementEligibility(
        userId,
        achievement.id
      );

      if (eligibility.eligible) {
        const userAchievement = await awardAchievement(userId, achievement.id);
        newlyEarned.push(userAchievement);
      }
    } catch (error) {
      // Skip achievements that can't be evaluated
      continue;
    }
  }

  return newlyEarned;
}

/**
 * Get achievement completion statistics
 */
export async function getAchievementCompletionStats(): Promise<
  Array<{ achievementId: string; achievementName: string; completionCount: number }>
> {
  const results = await db
    .select({
      achievementId: userAchievements.achievementId,
      completionCount: sql<number>`count(*)`,
    })
    .from(userAchievements)
    .groupBy(userAchievements.achievementId)
    .orderBy(sql`count(*) DESC`);

  // Join with achievements to get names
  const stats = [];
  for (const result of results) {
    const [achievement] = await db
      .select({ name: achievements.name })
      .from(achievements)
      .where(eq(achievements.id, result.achievementId));

    if (achievement) {
      stats.push({
        achievementId: result.achievementId,
        achievementName: achievement.name,
        completionCount: result.completionCount,
      });
    }
  }

  return stats;
}
