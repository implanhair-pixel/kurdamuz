// src/lib/challenges/rewards.ts
import { db } from '@/db';
import { challengeRewards, challengeScores, challengeDefinitions, challengeSchedules } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { logChallengeRewardClaimed } from './audit';
import { RewardType } from '@/types/challenges';

interface RewardDistributionInput {
  scoreId: string;
  userId: string;
  scheduleId: string;
  finalScore: number;
  rank?: number;
}

export async function distributeRewards(input: RewardDistributionInput): Promise<void> {
  try {
    // Get the schedule and definition to determine rewards
    const schedule = await db.query.challengeSchedules.findFirst({
      where: eq(challengeSchedules.id, input.scheduleId),
    });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    const definition = await db.query.challengeDefinitions.findFirst({
      where: eq(challengeDefinitions.id, schedule.challengeDefinitionId),
    });

    if (!definition) {
      throw new Error('Definition not found');
    }

    // Distribute XP reward
    if (definition.xpReward > 0) {
      await createReward({
        scoreId: input.scoreId,
        userId: input.userId,
        rewardType: RewardType.XP,
        rewardValue: { amount: definition.xpReward },
      });
    }

    // Distribute badge reward if specified
    if (definition.badgeReward) {
      await createReward({
        scoreId: input.scoreId,
        userId: input.userId,
        rewardType: RewardType.BADGE,
        rewardValue: { badgeId: definition.badgeReward },
      });
    }

    // Distribute rank-based rewards
    if (input.rank) {
      await distributeRankRewards(input.scoreId, input.userId, input.rank);
    }

    // Distribute score-based rewards
    await distributeScoreRewards(input.scoreId, input.userId, input.finalScore);
  } catch (error) {
    console.error('Error distributing rewards:', error);
    throw error;
  }
}

async function createReward(input: {
  scoreId: string;
  userId: string;
  rewardType: RewardType;
  rewardValue: Record<string, any>;
}): Promise<void> {
  try {
    const [reward] = await db.insert(challengeRewards).values({
      scoreId: input.scoreId,
      userId: input.userId,
      rewardType: input.rewardType,
      rewardValue: input.rewardValue,
      isClaimed: false,
    }).returning();

    await logChallengeRewardClaimed(reward.id, input.userId, {
      rewardType: input.rewardType,
      rewardValue: input.rewardValue,
    });
  } catch (error) {
    console.error('Error creating reward:', error);
    throw error;
  }
}

async function distributeRankRewards(
  scoreId: string,
  userId: string,
  rank: number
): Promise<void> {
  // Top 3 get special rewards
  if (rank === 1) {
    await createReward({
      scoreId,
      userId,
      rewardType: RewardType.TITLE,
      rewardValue: { title: 'Challenge Champion', icon: '🏆' },
    });
  } else if (rank === 2) {
    await createReward({
      scoreId,
      userId,
      rewardType: RewardType.DECORATION,
      rewardValue: { decoration: 'Silver Medal', icon: '🥈' },
    });
  } else if (rank === 3) {
    await createReward({
      scoreId,
      userId,
      rewardType: RewardType.DECORATION,
      rewardValue: { decoration: 'Bronze Medal', icon: '🥉' },
    });
  }

  // Top 10 get achievement
  if (rank <= 10) {
    await createReward({
      scoreId,
      userId,
      rewardType: RewardType.ACHIEVEMENT,
      rewardValue: { achievementId: 'top_10_challenger' },
    });
  }
}

async function distributeScoreRewards(
  scoreId: string,
  userId: string,
  finalScore: number
): Promise<void> {
  // Perfect score reward
  if (finalScore >= 100) {
    await createReward({
      scoreId,
      userId,
      rewardType: RewardType.ACHIEVEMENT,
      rewardValue: { achievementId: 'perfect_score' },
    });
  }

  // High score reward (90+)
  if (finalScore >= 90) {
    await createReward({
      scoreId,
      userId,
      rewardType: RewardType.XP,
      rewardValue: { amount: 50, bonus: true },
    });
  }
}

export async function claimReward(rewardId: string, userId: string): Promise<void> {
  try {
    const [reward] = await db
      .update(challengeRewards)
      .set({ isClaimed: true, claimedAt: new Date() })
      .where(
        and(
          eq(challengeRewards.id, rewardId),
          eq(challengeRewards.userId, userId),
          eq(challengeRewards.isClaimed, false)
        )
      )
      .returning();

    if (!reward) {
      throw new Error('Reward not found or already claimed');
    }

    // Apply the reward based on type
    await applyReward(reward);

    await logChallengeRewardClaimed(rewardId, userId, {
      rewardType: reward.rewardType,
      rewardValue: reward.rewardValue,
    });
  } catch (error) {
    console.error('Error claiming reward:', error);
    throw error;
  }
}

async function applyReward(reward: any): Promise<void> {
  // This would integrate with the XP System (Phase 6) and Achievements System (Phase 7)
  // For now, this is a placeholder

  switch (reward.rewardType) {
    case RewardType.XP:
      // Add XP to user's account
      // await addXP(reward.userId, reward.rewardValue.amount);
      break;

    case RewardType.BADGE:
      // Award badge to user
      // await awardBadge(reward.userId, reward.rewardValue.badgeId);
      break;

    case RewardType.ACHIEVEMENT:
      // Award achievement to user
      // await awardAchievement(reward.userId, reward.rewardValue.achievementId);
      break;

    case RewardType.TITLE:
      // Award title to user
      // await awardTitle(reward.userId, reward.rewardValue.title);
      break;

    case RewardType.DECORATION:
      // Award decoration to user
      // await awardDecoration(reward.userId, reward.rewardValue.decoration);
      break;

    case RewardType.COURSE_ACCESS:
      // Grant course access
      // await grantCourseAccess(reward.userId, reward.rewardValue.courseId);
      break;

    default:
      break;
  }
}

export async function getUserRewards(userId: string): Promise<any[]> {
  try {
    const rewards = await db.query.challengeRewards.findMany({
      where: eq(challengeRewards.userId, userId),
      orderBy: (rewards, { desc }) => [desc(rewards.awardedAt)],
    });

    return rewards;
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    throw error;
  }
}

export async function getUnclaimedRewards(userId: string): Promise<any[]> {
  try {
    const rewards = await db.query.challengeRewards.findMany({
      where: and(eq(challengeRewards.userId, userId), eq(challengeRewards.isClaimed, false)),
      orderBy: (rewards, { desc }) => [desc(rewards.awardedAt)],
    });

    return rewards;
  } catch (error) {
    console.error('Error fetching unclaimed rewards:', error);
    throw error;
  }
}
