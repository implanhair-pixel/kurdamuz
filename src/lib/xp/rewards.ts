import { db } from '../../db/index';
import { rewards, userRewards, userLevels, xpAuditLogs } from '../../db/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import type {
  Reward,
  RewardInput,
  UserReward,
  RewardEligibility,
  RewardType,
  RewardFilter,
} from '../../types/xp';
import { XPErrors, XPError } from '../../types/xp';
import { logRewardIssued, logRewardClaimed } from './audits';

/**
 * Create a new reward
 */
export async function createReward(
  data: RewardInput,
  actorId: string
): Promise<Reward> {
  const [reward] = await db.insert(rewards).values(data).returning();

  // Log audit
  await db.insert(xpAuditLogs).values({
    actorId,
    targetUserId: actorId,
    actionType: 'policy_modified',
    newValue: { rewardId: reward.id, ...data },
    reason: 'Reward created',
  });

  return reward;
}

/**
 * Update an existing reward
 */
export async function updateReward(
  rewardId: string,
  data: Partial<RewardInput>,
  actorId: string
): Promise<Reward> {
  const [reward] = await db
    .update(rewards)
    .set(data)
    .where(eq(rewards.id, rewardId))
    .returning();

  if (!reward) {
    throw new XPError('Reward not found', XPErrors.REWARD_NOT_FOUND);
  }

  // Log audit
  await db.insert(xpAuditLogs).values({
    actorId,
    targetUserId: actorId,
    actionType: 'policy_modified',
    oldValue: { rewardId },
    newValue: { rewardId, ...data },
    reason: 'Reward updated',
  });

  return reward;
}

/**
 * Delete a reward
 */
export async function deleteReward(rewardId: string, actorId: string): Promise<void> {
  const [reward] = await db
    .delete(rewards)
    .where(eq(rewards.id, rewardId))
    .returning();

  if (!reward) {
    throw new XPError('Reward not found', XPErrors.REWARD_NOT_FOUND);
  }

  // Log audit
  await db.insert(xpAuditLogs).values({
    actorId,
    targetUserId: actorId,
    actionType: 'policy_modified',
    oldValue: { rewardId, ...reward },
    reason: 'Reward deleted',
  });
}

/**
 * Get all rewards with optional filters
 */
export async function getRewards(filters?: RewardFilter): Promise<Reward[]> {
  const conditions = [];

  if (filters?.rewardType) {
    conditions.push(eq(rewards.rewardType, filters.rewardType));
  }

  if (filters?.requiredLevel !== undefined) {
    conditions.push(eq(rewards.requiredLevel, filters.requiredLevel));
  }

  if (filters?.requiredXP !== undefined) {
    conditions.push(gte(rewards.requiredXP, filters.requiredXP));
  }

  if (filters?.active !== undefined) {
    conditions.push(eq(rewards.active, filters.active));
  }

  const query = db
    .select()
    .from(rewards)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(rewards.createdAt));

  if (filters?.limit) {
    query.limit(filters.limit);
  }

  if (filters?.offset) {
    query.offset(filters.offset);
  }

  return await query;
}

/**
 * Get a single reward by ID
 */
export async function getReward(rewardId: string): Promise<Reward | null> {
  const [reward] = await db
    .select()
    .from(rewards)
    .where(eq(rewards.id, rewardId));

  return reward || null;
}

/**
 * Check if a user is eligible for a reward
 */
export async function checkRewardEligibility(
  userId: string,
  rewardId: string
): Promise<RewardEligibility> {
  const [reward] = await db
    .select()
    .from(rewards)
    .where(eq(rewards.id, rewardId));

  if (!reward) {
    throw new XPError('Reward not found', XPErrors.REWARD_NOT_FOUND);
  }

  if (!reward.active) {
    return {
      eligible: false,
      reason: 'Reward is not currently active',
    };
  }

  // Get user's current level and XP
  const [userLevel] = await db
    .select()
    .from(userLevels)
    .where(eq(userLevels.userId, userId));

  if (!userLevel) {
    return {
      eligible: false,
      reason: 'User level not found',
    };
  }

  const missingRequirements: any = {};

  if (userLevel.currentLevel < reward.requiredLevel) {
    missingRequirements.level = reward.requiredLevel - userLevel.currentLevel;
  }

  if (userLevel.totalXP < reward.requiredXP) {
    missingRequirements.xp = reward.requiredXP - userLevel.totalXP;
  }

  if (Object.keys(missingRequirements).length > 0) {
    return {
      eligible: false,
      reason: 'User does not meet requirements',
      missingRequirements,
    };
  }

  // Check if user already earned this reward
  const [existingUserReward] = await db
    .select()
    .from(userRewards)
    .where(
      and(
        eq(userRewards.userId, userId),
        eq(userRewards.rewardId, rewardId)
      )
    );

  if (existingUserReward) {
    return {
      eligible: false,
      reason: 'Reward already earned',
    };
  }

  return {
    eligible: true,
  };
}

/**
 * Award a reward to a user
 */
export async function awardReward(
  userId: string,
  rewardId: string,
  actorId: string
): Promise<UserReward> {
  const eligibility = await checkRewardEligibility(userId, rewardId);

  if (!eligibility.eligible) {
    throw new XPError(eligibility.reason || 'Not eligible', XPErrors.REWARD_NOT_ELIGIBLE);
  }

  const [userReward] = await db
    .insert(userRewards)
    .values({
      userId,
      rewardId,
      earnedAt: new Date(),
      status: 'available',
    })
    .returning();

  // Log audit
  await logRewardIssued(actorId, userId, rewardId);

  return userReward;
}

/**
 * Claim a reward (mark as claimed)
 */
export async function claimReward(
  userId: string,
  rewardId: string
): Promise<UserReward> {
  const [userReward] = await db
    .update(userRewards)
    .set({
      claimedAt: new Date(),
      status: 'claimed',
    })
    .where(
      and(
        eq(userRewards.userId, userId),
        eq(userRewards.rewardId, rewardId),
        eq(userRewards.status, 'available')
      )
    )
    .returning();

  if (!userReward) {
    throw new XPError('Reward not available for claiming', XPErrors.REWARD_ALREADY_CLAIMED);
  }

  // Log audit
  await logRewardClaimed(userId, rewardId);

  return userReward;
}

/**
 * Get all rewards for a user
 */
export async function getUserRewards(
  userId: string,
  status?: 'available' | 'claimed' | 'expired'
): Promise<UserReward[]> {
  const conditions = [eq(userRewards.userId, userId)];

  if (status) {
    conditions.push(eq(userRewards.status, status));
  }

  return await db
    .select({
      id: userRewards.id,
      userId: userRewards.userId,
      rewardId: userRewards.rewardId,
      earnedAt: userRewards.earnedAt,
      claimedAt: userRewards.claimedAt,
      status: userRewards.status,
      reward: rewards,
    })
    .from(userRewards)
    .leftJoin(rewards, eq(userRewards.rewardId, rewards.id))
    .where(and(...conditions))
    .orderBy(desc(userRewards.earnedAt));
}

/**
 * Get available rewards for a user (eligible but not yet earned)
 */
export async function getAvailableRewardsForUser(
  userId: string
): Promise<Reward[]> {
  const [userLevel] = await db
    .select()
    .from(userLevels)
    .where(eq(userLevels.userId, userId));

  if (!userLevel) {
    return [];
  }

  // Get all rewards user hasn't earned yet
  const earnedRewardIds = await db
    .select({ rewardId: userRewards.rewardId })
    .from(userRewards)
    .where(eq(userRewards.userId, userId));

  const earnedIds = earnedRewardIds.map((r) => r.rewardId);

  return await db
    .select()
    .from(rewards)
    .where(
      and(
        eq(rewards.active, true),
        gte(rewards.requiredLevel, userLevel.currentLevel),
        gte(rewards.requiredXP, userLevel.totalXP)
      )
    )
    .orderBy(desc(rewards.createdAt));
}

/**
 * Get reward utilization statistics
 */
export async function getRewardUtilization(): Promise<
  Array<{ rewardId: string; rewardName: string; claimCount: number }>
> {
  const results = await db
    .select({
      rewardId: userRewards.rewardId,
      claimCount: sql<number>`count(*)`,
    })
    .from(userRewards)
    .groupBy(userRewards.rewardId)
    .orderBy(sql`count(*) DESC`);

  // Join with rewards to get names
  const utilization = [];
  for (const result of results) {
    const [reward] = await db
      .select({ name: rewards.name })
      .from(rewards)
      .where(eq(rewards.id, result.rewardId));

    if (reward) {
      utilization.push({
        rewardId: result.rewardId,
        rewardName: reward.name,
        claimCount: result.claimCount,
      });
    }
  }

  return utilization;
}
