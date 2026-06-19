import { db } from '@/db';
import { userAchievements, achievementAuditLogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import type { 
  AchievementReward,
  ClaimAchievementRewardInput,
  AuditActionType 
} from '@/types/achievement';

/**
 * Claim achievement reward
 */
export async function claimAchievementReward(
  input: ClaimAchievementRewardInput
): Promise<{ success: boolean; reward: AchievementReward | null; error?: string }> {
  // Get user achievement
  const userAchievement = await db.select()
    .from(userAchievements)
    .where(
      and(
        eq(userAchievements.userId, input.userId),
        eq(userAchievements.achievementId, input.achievementId)
      )
    )
    .limit(1);

  if (userAchievement.length === 0) {
    return { success: false, reward: null, error: 'Achievement not found' };
  }

  const achievement = userAchievement[0];

  if (achievement.status !== 'completed') {
    return { success: false, reward: null, error: 'Achievement not completed yet' };
  }

  if ((achievement.status as string) === 'claimed') {
    return { success: false, reward: null, error: 'Reward already claimed' };
  }

  // Get achievement definition to determine reward
  // For now, we'll use a simple XP reward
  const reward: AchievementReward = {
    type: 'xp',
    value: 100, // Default XP reward
    metadata: {
      achievementId: input.achievementId,
    },
  };

  // Update achievement status to claimed
  await db.update(userAchievements)
    .set({ status: 'claimed' })
    .where(eq(userAchievements.id, achievement.id));

  // Log the claim event
  await logRewardEvent(input.userId, 'claimed', input.achievementId, reward);

  return { success: true, reward };
}

/**
 * Distribute reward to user
 */
export async function distributeReward(
  userId: string,
  reward: AchievementReward,
  sourceId: string
): Promise<boolean> {
  try {
    switch (reward.type) {
      case 'xp':
        await distributeXpReward(userId, reward.value, sourceId);
        break;
      
      case 'badge':
        await distributeBadgeReward(userId, reward, sourceId);
        break;
      
      case 'certificate':
        await distributeCertificateReward(userId, reward, sourceId);
        break;
      
      case 'item':
        await distributeItemReward(userId, reward, sourceId);
        break;
      
      case 'access':
        await distributeAccessReward(userId, reward, sourceId);
        break;
      
      case 'title':
        await distributeTitleReward(userId, reward, sourceId);
        break;
      
      case 'custom':
        await distributeCustomReward(userId, reward, sourceId);
        break;
      
      default:
        return false;
    }

    return true;
  } catch (error) {
    console.error('Error distributing reward:', error);
    return false;
  }
}

/**
 * Distribute XP reward
 */
async function distributeXpReward(
  userId: string,
  xpAmount: number,
  sourceId: string
): Promise<void> {
  // This would integrate with the XP system from Phase 6
  // For now, we'll log the reward distribution
  console.log(`Distributing ${xpAmount} XP to user ${userId} from achievement ${sourceId}`);
}

/**
 * Distribute badge reward
 */
async function distributeBadgeReward(
  userId: string,
  reward: AchievementReward,
  sourceId: string
): Promise<void> {
  // This would add a badge to the user's profile
  console.log(`Distributing badge to user ${userId} from achievement ${sourceId}`, reward);
}

/**
 * Distribute certificate reward
 */
async function distributeCertificateReward(
  userId: string,
  reward: AchievementReward,
  sourceId: string
): Promise<void> {
  // This would generate and award a certificate
  console.log(`Distributing certificate to user ${userId} from achievement ${sourceId}`, reward);
}

/**
 * Distribute item reward
 */
async function distributeItemReward(
  userId: string,
  reward: AchievementReward,
  sourceId: string
): Promise<void> {
  // This would add an item to the user's inventory
  console.log(`Distributing item to user ${userId} from achievement ${sourceId}`, reward);
}

/**
 * Distribute access reward
 */
async function distributeAccessReward(
  userId: string,
  reward: AchievementReward,
  sourceId: string
): Promise<void> {
  // This would grant access to premium content
  console.log(`Distributing access to user ${userId} from achievement ${sourceId}`, reward);
}

/**
 * Distribute title reward
 */
async function distributeTitleReward(
  userId: string,
  reward: AchievementReward,
  sourceId: string
): Promise<void> {
  // This would award a special title to the user
  console.log(`Distributing title to user ${userId} from achievement ${sourceId}`, reward);
}

/**
 * Distribute custom reward
 */
async function distributeCustomReward(
  userId: string,
  reward: AchievementReward,
  sourceId: string
): Promise<void> {
  // This would handle custom reward types
  console.log(`Distributing custom reward to user ${userId} from achievement ${sourceId}`, reward);
}

/**
 * Validate reward eligibility
 */
export async function validateRewardEligibility(
  userId: string,
  reward: AchievementReward
): Promise<{ eligible: boolean; reason?: string }> {
  // Check if user has already claimed this type of reward
  // This would integrate with the reward system
  return { eligible: true };
}

/**
 * Get user's claimed rewards
 */
export async function getUserClaimedRewards(userId: string) {
  const claimedAchievements = await db.select()
    .from(userAchievements)
    .where(
      and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.status, 'claimed')
      )
    );

  return {
    totalClaimed: claimedAchievements.length,
    rewards: claimedAchievements.map(a => ({
      achievementId: a.achievementId,
      claimedAt: a.earnedAt,
    })),
  };
}

/**
 * Rollback reward distribution (for error recovery)
 */
export async function rollbackReward(
  userId: string,
  reward: AchievementReward,
  sourceId: string
): Promise<boolean> {
  try {
    switch (reward.type) {
      case 'xp':
        await rollbackXpReward(userId, reward.value, sourceId);
        break;
      
      case 'badge':
        await rollbackBadgeReward(userId, reward, sourceId);
        break;
      
      // Add rollback logic for other reward types as needed
      
      default:
        return false;
    }

    // Log the rollback event
    await logRewardEvent(userId, 'revoked' as AuditActionType, sourceId, reward);

    return true;
  } catch (error) {
    console.error('Error rolling back reward:', error);
    return false;
  }
}

/**
 * Rollback XP reward
 */
async function rollbackXpReward(
  userId: string,
  xpAmount: number,
  sourceId: string
): Promise<void> {
  // This would remove XP from the user's balance
  console.log(`Rolling back ${xpAmount} XP from user ${userId} for achievement ${sourceId}`);
}

/**
 * Rollback badge reward
 */
async function rollbackBadgeReward(
  userId: string,
  reward: AchievementReward,
  sourceId: string
): Promise<void> {
  // This would remove the badge from the user's profile
  console.log(`Rolling back badge from user ${userId} for achievement ${sourceId}`, reward);
}

/**
 * Log reward event for audit
 */
async function logRewardEvent(
  userId: string,
  actionType: AuditActionType,
  achievementId: string,
  reward: AchievementReward
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
 * Calculate total reward value for a user
 */
export async function calculateTotalRewardValue(userId: string): Promise<number> {
  const claimedRewards = await getUserClaimedRewards(userId);
  
  // For now, just count the number of claimed achievements
  // This would be expanded to calculate actual reward values
  return claimedRewards.totalClaimed;
}

/**
 * Get reward distribution statistics
 */
export async function getRewardStatistics() {
  const allClaimed = await db.select()
    .from(userAchievements)
    .where(eq(userAchievements.status, 'claimed'));

  return {
    totalRewardsClaimed: allClaimed.length,
    uniqueUsers: new Set(allClaimed.map(a => a.userId)).size,
    averageRewardsPerUser: allClaimed.length / (new Set(allClaimed.map(a => a.userId)).size || 1),
  };
}
