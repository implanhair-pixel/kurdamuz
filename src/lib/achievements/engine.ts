import { db } from '@/db';
import { achievements, userAchievements, achievementAuditLogs } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { 
  AchievementDefinition,
  UserAchievement,
  AchievementEvaluationContext,
  AchievementEvaluationResult,
  AchievementStatus,
  AuditActionType 
} from '@/types/achievement';

/**
 * Evaluate achievements for a user based on an event
 */
export async function evaluateAchievements(
  context: AchievementEvaluationContext
): Promise<AchievementEvaluationResult[]> {
  const results: AchievementEvaluationResult[] = [];

  // Get all active achievements
  const allAchievements = await db.select()
    .from(achievements)
    .where(sql`${achievements.id} IS NOT NULL`); // Get all achievements for now

  // Get user's current achievement progress
  const userProgress = await db.select()
    .from(userAchievements)
    .where(eq(userAchievements.userId, context.userId));

  const progressMap = new Map(
    userProgress.map(p => [p.achievementId, p])
  );

  // Evaluate each achievement
  for (const achievement of allAchievements) {
    const result = await evaluateSingleAchievement(
      achievement as any,
      context,
      progressMap.get(achievement.id) as any
    );

    if (result.qualified) {
      results.push(result);
      
      // Update progress
      await updateAchievementProgress(
        context.userId,
        achievement.id,
        result.progressUpdate,
        result.rewardEarned ? 'completed' : 'in_progress'
      );

      // If reward earned, log it
      if (result.rewardEarned && result.reward) {
        await logAchievementEvent(
          context.userId,
          'earned',
          achievement.id,
          result.reward
        );
      }
    }
  }

  return results;
}

/**
 * Evaluate a single achievement
 */
async function evaluateSingleAchievement(
  achievement: AchievementDefinition,
  context: AchievementEvaluationContext,
  currentProgress: UserAchievement | undefined
): Promise<AchievementEvaluationResult> {
  const criteria = achievement.criteria as any;
  const currentProgressValue = currentProgress?.progressValue || 0;

  let qualified = false;
  let progressUpdate = currentProgressValue;
  let rewardEarned = false;

  // Evaluate based on criteria type
  switch (criteria.type) {
    case 'count':
      qualified = await evaluateCountCriteria(criteria, context, currentProgressValue);
      progressUpdate = qualified ? criteria.target : currentProgressValue + 1;
      rewardEarned = qualified && progressUpdate >= criteria.target;
      break;

    case 'streak':
      qualified = await evaluateStreakCriteria(criteria, context);
      progressUpdate = qualified ? criteria.target : currentProgressValue;
      rewardEarned = qualified;
      break;

    case 'cumulative':
      qualified = await evaluateCumulativeCriteria(criteria, context, currentProgressValue);
      progressUpdate = qualified ? criteria.target : currentProgressValue + 1;
      rewardEarned = qualified && progressUpdate >= criteria.target;
      break;

    case 'conditional':
      qualified = await evaluateConditionalCriteria(criteria, context);
      progressUpdate = qualified ? criteria.target : currentProgressValue;
      rewardEarned = qualified;
      break;

    default:
      qualified = false;
  }

  return {
    achievementId: achievement.id,
    qualified,
    progressUpdate,
    rewardEarned,
    reward: rewardEarned ? {
      type: 'xp',
      value: achievement.xpBonus,
    } : null,
  };
}

/**
 * Evaluate count-based criteria
 */
async function evaluateCountCriteria(
  criteria: any,
  context: AchievementEvaluationContext,
  currentProgress: number
): Promise<boolean> {
  const eventType = criteria.eventType || context.eventType;
  
  if (eventType !== context.eventType) {
    return false;
  }

  // Count occurrences of this event type
  const count = await countUserEvents(context.userId, eventType, criteria.timeframe);
  
  return count >= criteria.target;
}

/**
 * Evaluate streak-based criteria
 */
async function evaluateStreakCriteria(
  criteria: any,
  context: AchievementEvaluationContext
): Promise<boolean> {
  // Import streak functions to check streak
  const { getOrCreateUserStreak } = await import('../streaks');
  const streak = await getOrCreateUserStreak(context.userId);
  
  return streak.currentStreak >= criteria.target;
}

/**
 * Evaluate cumulative criteria
 */
async function evaluateCumulativeCriteria(
  criteria: any,
  context: AchievementEvaluationContext,
  currentProgress: number
): Promise<boolean> {
  // Check if the event contributes to the cumulative goal
  if (criteria.eventTypes && !criteria.eventTypes.includes(context.eventType)) {
    return false;
  }

  // Calculate cumulative progress
  const cumulative = await calculateCumulativeProgress(
    context.userId,
    criteria.eventTypes || [context.eventType],
    criteria.timeframe
  );

  return cumulative >= criteria.target;
}

/**
 * Evaluate conditional criteria
 */
async function evaluateConditionalCriteria(
  criteria: any,
  context: AchievementEvaluationContext
): Promise<boolean> {
  // Check all conditions
  if (criteria.conditions) {
    for (const condition of criteria.conditions) {
      const result = await evaluateCondition(condition, context);
      if (!result) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Evaluate a single condition
 */
async function evaluateCondition(condition: any, context: AchievementEvaluationContext): Promise<boolean> {
  switch (condition.operator) {
    case 'equals':
      return context.eventData[condition.field] === condition.value;
    
    case 'greater_than':
      return context.eventData[condition.field] > condition.value;
    
    case 'less_than':
      return context.eventData[condition.field] < condition.value;
    
    case 'contains':
      return Array.isArray(context.eventData[condition.field]) && 
             context.eventData[condition.field].includes(condition.value);
    
    default:
      return false;
  }
}

/**
 * Count user events of a specific type
 */
async function countUserEvents(
  userId: string,
  eventType: string,
  timeframe?: { start: Date; end: Date }
): Promise<number> {
  // This would query an events table or aggregate from existing data
  // For now, return a placeholder
  return 0;
}

/**
 * Calculate cumulative progress
 */
async function calculateCumulativeProgress(
  userId: string,
  eventTypes: string[],
  timeframe?: { start: Date; end: Date }
): Promise<number> {
  // This would aggregate progress across multiple event types
  // For now, return a placeholder
  return 0;
}

/**
 * Update achievement progress
 */
async function updateAchievementProgress(
  userId: string,
  achievementId: string,
  progressValue: number,
  status: AchievementStatus
): Promise<void> {
  const existing = await db.select()
    .from(userAchievements)
    .where(
      and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      )
    )
    .limit(1);

  if (existing.length === 0) {
    await db.insert(userAchievements).values({
      userId,
      achievementId,
      progressValue,
      status,
      earnedAt: status === 'completed' ? new Date() : null,
    });
  } else {
    await db.update(userAchievements)
      .set({
        progressValue,
        status,
        earnedAt: status === 'completed' && !existing[0].earnedAt ? new Date() : existing[0].earnedAt,
      })
      .where(eq(userAchievements.id, existing[0].id));
  }
}

/**
 * Log achievement event for audit
 */
async function logAchievementEvent(
  userId: string,
  actionType: AuditActionType,
  achievementId: string,
  reward: any
): Promise<void> {
  await db.insert(achievementAuditLogs).values({
    actorId: userId,
    targetUserId: userId,
    actionType,
    oldValue: null,
    newValue: {
      achievementId,
      reward,
    },
  });
}

/**
 * Get user achievements
 */
export async function getUserAchievements(
  userId: string,
  status?: AchievementStatus
): Promise<UserAchievement[]> {
  const query = status
    ? db.select()
        .from(userAchievements)
        .where(
          and(
            eq(userAchievements.userId, userId),
            eq(userAchievements.status, status)
          )
        )
    : db.select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId));

  const achievements = await query.orderBy(desc(userAchievements.earnedAt));

  return achievements.map(a => ({
    ...a,
    earnedAt: a.earnedAt ? new Date(a.earnedAt) : null,
  })) as UserAchievement[];
}

/**
 * Get achievement details for a user
 */
export async function getUserAchievementDetails(userId: string) {
  const userAchievements = await getUserAchievements(userId);
  const allAchievements = await db.select().from(achievements);

  const details = userAchievements.map(ua => {
    const achievement = allAchievements.find(a => a.id === ua.achievementId);
    return {
      ...ua,
      achievement,
    };
  });

  return {
    totalAchievements: allAchievements.length,
    earnedAchievements: userAchievements.filter(a => a.status === 'completed').length,
    inProgressAchievements: userAchievements.filter(a => a.status === 'in_progress').length,
    completionRate: (userAchievements.filter(a => a.status === 'completed').length / allAchievements.length) * 100,
    achievements: details,
  };
}

/**
 * Manually award achievement (admin function)
 */
export async function manuallyAwardAchievement(
  userId: string,
  achievementId: string,
  actorId: string,
  reason?: string
): Promise<void> {
  await updateAchievementProgress(userId, achievementId, 100, 'completed');
  
  await logAchievementEvent(userId, 'manually_awarded', achievementId, {
    actorId,
    reason,
  });
}

/**
 * Revoke achievement (admin function)
 */
export async function revokeAchievement(
  userId: string,
  achievementId: string,
  actorId: string,
  reason?: string
): Promise<void> {
  const existing = await db.select()
    .from(userAchievements)
    .where(
      and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      )
    )
    .limit(1);

  if (existing.length === 0) {
    throw new Error('Achievement not found for user');
  }

  await db.update(userAchievements)
    .set({
      status: 'in_progress',
      progressValue: 0,
      earnedAt: null,
    })
    .where(eq(userAchievements.id, existing[0].id));

  await logAchievementEvent(userId, 'revoked', achievementId, {
    actorId,
    reason,
    previousStatus: existing[0].status,
  });
}
