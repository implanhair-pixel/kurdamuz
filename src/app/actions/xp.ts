'use server';

import { revalidatePath } from 'next/cache';
import {
  awardXP,
  removeXP,
  correctXP,
  getUserXPBalance,
  getUserLevel,
  getXPTransactions,
  getLevelProgress,
} from '../../lib/xp/xp';
import {
  getCurrentLevel,
  getXPToNextLevel,
  recalculateUserLevels,
} from '../../lib/xp/progression';
import {
  createReward,
  updateReward,
  deleteReward,
  getRewards,
  getReward,
  checkRewardEligibility,
  awardReward,
  claimReward,
  getUserRewards,
  getAvailableRewardsForUser,
} from '../../lib/xp/rewards';
import {
  createAchievement,
  updateAchievement,
  deleteAchievement,
  getAchievements,
  getAchievement,
  checkAchievementEligibility,
  awardAchievement,
  getUserAchievements,
  evaluateAchievements,
} from '../../lib/xp/achievements';
import {
  getUserXPAnalytics,
  getPlatformXPAnalytics,
  getLeaderboard,
  getLeaderboardWithUserPosition,
  getUserEngagementMetrics,
  getXPGrowthTrends,
} from '../../lib/xp/analytics';
import { XPErrors, XPError } from '../../types/xp';
import type { TransactionType, XPSourceType, RewardType } from '../../types/xp';


const TRANSACTION_TYPES = ['earned', 'removed', 'corrected'] as const;
const XP_SOURCE_TYPES = [
  'lesson_completion',
  'quiz_completion',
  'course_completion',
  'daily_login',
  'streak',
  'achievement',
  'teacher_award',
  'admin_bonus',
  'special_event',
  'placement_test_completion',
  'community_post',
  'community_comment',
  'helpful_content',
] as const;

const REWARD_TYPES = [
  'badge',
  'certificate',
  'avatar_item',
  'profile_decoration',
  'course_unlock',
  'special_content',
  'event_access',
] as const;

function toTransactionType(value?: string): TransactionType | undefined {
  return value && (TRANSACTION_TYPES as readonly string[]).includes(value) ? (value as TransactionType) : undefined;
}

function toXPSourceType(value?: string): XPSourceType | undefined {
  return value && (XP_SOURCE_TYPES as readonly string[]).includes(value) ? (value as XPSourceType) : undefined;
}

function toRewardType(value?: string): RewardType | undefined {
  return value && (REWARD_TYPES as readonly string[]).includes(value) ? (value as RewardType) : undefined;
}

// ============================================================================
// XP TRANSACTION SERVER ACTIONS
// ============================================================================

/**
 * Award XP to a user
 */
export async function actionAwardXP(data: {
  userId: string;
  amount: number;
  sourceType: string;
  sourceId?: string;
  description?: string;
}) {
  try {
    const transaction = await awardXP(
      data.userId,
      data.amount,
      toXPSourceType(data.sourceType) ?? 'special_event',
      data.sourceId,
      data.description
    );

    revalidatePath('/dashboard');
    revalidatePath(`/profile/${data.userId}`);

    return { success: true, transaction };
  } catch (error) {
    if (error instanceof XPError) {
      return { success: false, error: error.message, code: error.code };
    }
    return { success: false, error: 'Failed to award XP' };
  }
}

/**
 * Remove XP from a user (admin only)
 */
export async function actionRemoveXP(data: {
  userId: string;
  amount: number;
  actorId: string;
  reason?: string;
}) {
  try {
    const transaction = await removeXP(
      data.userId,
      data.amount,
      data.actorId,
      data.reason
    );

    revalidatePath('/admin/xp');
    revalidatePath(`/profile/${data.userId}`);

    return { success: true, transaction };
  } catch (error) {
    if (error instanceof XPError) {
      return { success: false, error: error.message, code: error.code };
    }
    return { success: false, error: 'Failed to remove XP' };
  }
}

/**
 * Correct XP (admin only)
 */
export async function actionCorrectXP(data: {
  userId: string;
  oldAmount: number;
  newAmount: number;
  actorId: string;
  reason?: string;
}) {
  try {
    const transaction = await correctXP(
      data.userId,
      data.oldAmount,
      data.newAmount,
      data.actorId,
      data.reason
    );

    revalidatePath('/admin/xp');
    revalidatePath(`/profile/${data.userId}`);

    return { success: true, transaction };
  } catch (error) {
    if (error instanceof XPError) {
      return { success: false, error: error.message, code: error.code };
    }
    return { success: false, error: 'Failed to correct XP' };
  }
}

/**
 * Get user's XP balance
 */
export async function actionGetUserXPBalance(userId: string) {
  try {
    const balance = await getUserXPBalance(userId);
    return { success: true, balance };
  } catch (error) {
    return { success: false, error: 'Failed to fetch XP balance' };
  }
}

/**
 * Get user's level and progress
 */
export async function actionGetUserLevelProgress(userId: string) {
  try {
    const currentLevel = await getCurrentLevel(userId);
    const levelProgress = await getLevelProgress(userId);
    return { success: true, currentLevel, levelProgress };
  } catch (error) {
    return { success: false, error: 'Failed to fetch user level' };
  }
}

/**
 * Get user's XP transactions
 */
export async function actionGetXPTransactions(data: {
  userId: string;
  transactionType?: string;
  sourceType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  try {
    const transactions = await getXPTransactions(data.userId, {
      transactionType: toTransactionType(data.transactionType),
      sourceType: toXPSourceType(data.sourceType) ?? 'special_event',
      startDate: data.startDate,
      endDate: data.endDate,
      limit: data.limit,
      offset: data.offset,
    });
    return { success: true, transactions };
  } catch (error) {
    return { success: false, error: 'Failed to fetch XP transactions' };
  }
}

// ============================================================================
// LEVEL PROGRESSION SERVER ACTIONS
// ============================================================================

/**
 * Recalculate user's level
 */
export async function actionRecalculateUserLevel(userId: string) {
  try {
    const levelUpEvent = await recalculateUserLevels(userId);
    revalidatePath('/dashboard');
    revalidatePath(`/profile/${userId}`);
    return { success: true, levelUpEvent };
  } catch (error) {
    return { success: false, error: 'Failed to recalculate user level' };
  }
}

// ============================================================================
// REWARD SERVER ACTIONS
// ============================================================================

/**
 * Create a new reward (admin only)
 */
export async function actionCreateReward(data: {
  name: string;
  description?: string;
  rewardType: string;
  requiredLevel: number;
  requiredXP: number;
  active?: boolean;
  actorId: string;
}) {
  try {
    const reward = await createReward(
      {
        ...data,
        rewardType: toRewardType(data.rewardType),
      },
      data.actorId
    );
    revalidatePath('/admin/rewards');
    return { success: true, reward };
  } catch (error) {
    if (error instanceof XPError) {
      return { success: false, error: error.message, code: error.code };
    }
    return { success: false, error: 'Failed to create reward' };
  }
}

/**
 * Update a reward (admin only)
 */
export async function actionUpdateReward(data: {
  rewardId: string;
  updates: {
    name?: string;
    description?: string;
    rewardType?: string;
    requiredLevel?: number;
    requiredXP?: number;
    active?: boolean;
  };
  actorId: string;
}) {
  try {
    const reward = await updateReward(
      data.rewardId,
      {
        ...data.updates,
        rewardType: toRewardType(data.updates.rewardType),
      },
      data.actorId
    );
    revalidatePath('/admin/rewards');
    return { success: true, reward };
  } catch (error) {
    if (error instanceof XPError) {
      return { success: false, error: error.message, code: error.code };
    }
    return { success: false, error: 'Failed to update reward' };
  }
}

/**
 * Delete a reward (admin only)
 */
export async function actionDeleteReward(data: {
  rewardId: string;
  actorId: string;
}) {
  try {
    await deleteReward(data.rewardId, data.actorId);
    revalidatePath('/admin/rewards');
    return { success: true };
  } catch (error) {
    if (error instanceof XPError) {
      return { success: false, error: error.message, code: error.code };
    }
    return { success: false, error: 'Failed to delete reward' };
  }
}

/**
 * Claim a reward
 */
export async function actionClaimReward(data: {
  userId: string;
  rewardId: string;
}) {
  try {
    const userReward = await claimReward(data.userId, data.rewardId);
    revalidatePath('/dashboard');
    revalidatePath(`/profile/${data.userId}`);
    return { success: true, userReward };
  } catch (error) {
    if (error instanceof XPError) {
      return { success: false, error: error.message, code: error.code };
    }
    return { success: false, error: 'Failed to claim reward' };
  }
}

/**
 * Get user's rewards
 */
export async function actionGetUserRewards(data: {
  userId: string;
  status?: 'available' | 'claimed' | 'expired';
}) {
  try {
    const rewards = await getUserRewards(data.userId, data.status);
    return { success: true, rewards };
  } catch (error) {
    return { success: false, error: 'Failed to fetch user rewards' };
  }
}

/**
 * Get available rewards for a user
 */
export async function actionGetAvailableRewards(userId: string) {
  try {
    const rewards = await getAvailableRewardsForUser(userId);
    return { success: true, rewards };
  } catch (error) {
    return { success: false, error: 'Failed to fetch available rewards' };
  }
}

// ============================================================================
// ACHIEVEMENT SERVER ACTIONS
// ============================================================================

/**
 * Create a new achievement (admin only)
 */
export async function actionCreateAchievement(data: {
  name: string;
  description?: string;
  icon?: string;
  xpBonus: number;
  criteria: Record<string, any>;
  actorId: string;
}) {
  try {
    const achievement = await createAchievement(data, data.actorId);
    revalidatePath('/admin/achievements');
    return { success: true, achievement };
  } catch (error) {
    if (error instanceof XPError) {
      return { success: false, error: error.message, code: error.code };
    }
    return { success: false, error: 'Failed to create achievement' };
  }
}

/**
 * Update an achievement (admin only)
 */
export async function actionUpdateAchievement(data: {
  achievementId: string;
  updates: {
    name?: string;
    description?: string;
    icon?: string;
    xpBonus?: number;
    criteria?: Record<string, any>;
  };
  actorId: string;
}) {
  try {
    const achievement = await updateAchievement(
      data.achievementId,
      data.updates,
      data.actorId
    );
    revalidatePath('/admin/achievements');
    return { success: true, achievement };
  } catch (error) {
    if (error instanceof XPError) {
      return { success: false, error: error.message, code: error.code };
    }
    return { success: false, error: 'Failed to update achievement' };
  }
}

/**
 * Delete an achievement (admin only)
 */
export async function actionDeleteAchievement(data: {
  achievementId: string;
  actorId: string;
}) {
  try {
    await deleteAchievement(data.achievementId, data.actorId);
    revalidatePath('/admin/achievements');
    return { success: true };
  } catch (error) {
    if (error instanceof XPError) {
      return { success: false, error: error.message, code: error.code };
    }
    return { success: false, error: 'Failed to delete achievement' };
  }
}

/**
 * Award an achievement to a user
 */
export async function actionAwardAchievement(data: {
  userId: string;
  achievementId: string;
  actorId?: string;
}) {
  try {
    const userAchievement = await awardAchievement(
      data.userId,
      data.achievementId,
      data.actorId
    );
    revalidatePath('/dashboard');
    revalidatePath(`/profile/${data.userId}`);
    return { success: true, userAchievement };
  } catch (error) {
    if (error instanceof XPError) {
      return { success: false, error: error.message, code: error.code };
    }
    return { success: false, error: 'Failed to award achievement' };
  }
}

/**
 * Get user's achievements
 */
export async function actionGetUserAchievements(userId: string) {
  try {
    const achievements = await getUserAchievements(userId);
    return { success: true, achievements };
  } catch (error) {
    return { success: false, error: 'Failed to fetch user achievements' };
  }
}

/**
 * Evaluate all achievements for a user
 */
export async function actionEvaluateAchievements(userId: string) {
  try {
    const newlyEarned = await evaluateAchievements(userId);
    revalidatePath('/dashboard');
    revalidatePath(`/profile/${userId}`);
    return { success: true, newlyEarned };
  } catch (error) {
    return { success: false, error: 'Failed to evaluate achievements' };
  }
}

// ============================================================================
// ANALYTICS SERVER ACTIONS
// ============================================================================

/**
 * Get user's XP analytics
 */
export async function actionGetUserXPAnalytics(data: {
  userId: string;
  timeRange?: 'daily' | 'weekly' | 'monthly';
}) {
  try {
    const analytics = await getUserXPAnalytics(
      data.userId,
      data.timeRange || 'weekly'
    );
    return { success: true, analytics };
  } catch (error) {
    return { success: false, error: 'Failed to fetch XP analytics' };
  }
}

/**
 * Get platform XP analytics (admin only)
 */
export async function actionGetPlatformXPAnalytics() {
  try {
    const analytics = await getPlatformXPAnalytics();
    return { success: true, analytics };
  } catch (error) {
    return { success: false, error: 'Failed to fetch platform XP analytics' };
  }
}

/**
 * Get leaderboard
 */
export async function actionGetLeaderboard(data: {
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  limit?: number;
  userId?: string;
}) {
  try {
    const leaderboard = data.userId
      ? await getLeaderboardWithUserPosition(
          data.userId,
          data.timeframe || 'weekly',
          data.limit || 50
        )
      : await getLeaderboard(data.timeframe || 'weekly', data.limit || 50);
    return { success: true, leaderboard };
  } catch (error) {
    return { success: false, error: 'Failed to fetch leaderboard' };
  }
}

/**
 * Get user engagement metrics
 */
export async function actionGetUserEngagementMetrics(userId: string) {
  try {
    const metrics = await getUserEngagementMetrics(userId);
    return { success: true, metrics };
  } catch (error) {
    return { success: false, error: 'Failed to fetch engagement metrics' };
  }
}

/**
 * Get XP growth trends
 */
export async function actionGetXPGrowthTrends(data: {
  userId: string;
  days?: number;
}) {
  try {
    const trends = await getXPGrowthTrends(data.userId, data.days || 30);
    return { success: true, trends };
  } catch (error) {
    return { success: false, error: 'Failed to fetch XP growth trends' };
  }
}
