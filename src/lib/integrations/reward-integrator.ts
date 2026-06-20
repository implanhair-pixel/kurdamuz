import { rewardDistributor } from '@/lib/missions/reward-distributor';
import { walletManager } from '@/lib/wallet/wallet-manager';
import { policyService } from '@/lib/wallet/policy-service';
import { getUserLevel } from '@/lib/xp/xp';

/**
 * Reward Integrator
 * Integrates the coin system with Phase 6 XP, Phase 7 Streaks/Achievements, and Phase 8 Daily Challenges
 */

export class RewardIntegrator {
  async handleLessonCompletion(userId: string, lessonId: string): Promise<void> {
    await rewardDistributor.awardEventRewards(
      userId,
      'lesson_completion',
      lessonId
    );
  }

  async handleQuizCompletion(userId: string, quizId: string, score: number): Promise<void> {
    await rewardDistributor.awardEventRewards(
      userId,
      'quiz_completion',
      quizId
    );

    if (score >= 90) {
      await walletManager.creditCoins(
        userId,
        10,
        'quiz_bonus',
        quizId,
        'Bonus for high quiz score',
        userId
      );
    }
  }

  async handleDailyLogin(userId: string): Promise<void> {
    await rewardDistributor.awardEventRewards(
      userId,
      'daily_login',
      userId
    );
  }

  async handleVocabularySession(userId: string, sessionId: string): Promise<void> {
    await rewardDistributor.awardEventRewards(
      userId,
      'vocabulary_session',
      sessionId
    );
  }

  async handleStreakMilestone(userId: string, streakDays: number): Promise<void> {
    await rewardDistributor.awardEventRewards(
      userId,
      'streak_milestone',
      userId
    );

    if (streakDays >= 30) {
      await walletManager.creditCoins(
        userId,
        50,
        'streak_bonus',
        userId,
        'Bonus for 30-day streak',
        userId
      );
    } else if (streakDays >= 14) {
      await walletManager.creditCoins(
        userId,
        25,
        'streak_bonus',
        userId,
        'Bonus for 14-day streak',
        userId
      );
    }
  }

  async handleAchievementUnlock(userId: string, achievementId: string): Promise<void> {
    const policy = await policyService.getPolicy('achievement_unlock');

    if (policy) {
      await walletManager.creditCoins(
        userId,
        policy.coinReward,
        'achievement',
        achievementId,
        'Reward for achievement unlock',
        userId
      );
    } else {
      await walletManager.creditCoins(
        userId,
        20,
        'achievement',
        achievementId,
        'Reward for achievement unlock',
        userId
      );
    }
  }

  async handleDailyChallengeCompletion(userId: string, challengeId: string): Promise<void> {
    await rewardDistributor.awardEventRewards(
      userId,
      'mission_completion',
      challengeId
    );
  }

  async awardXP(userId: string, eventType: string, referenceId: string): Promise<number> {
    const rewards = await rewardDistributor.calculateRewards(eventType);

    if (!rewards) {
      return 0;
    }

    console.log(`Awarding ${rewards.xp} XP to user ${userId} for ${eventType}`);
    return rewards.xp;
  }

  async getUserTotalRewards(userId: string): Promise<{
    totalCoins: number;
    totalXP: number;
  }> {
    const wallet = await walletManager.getBalance(userId);
    const level = await getUserLevel(userId);
    const totalXP = level?.totalXP ?? 0;

    return {
      totalCoins: wallet,
      totalXP,
    };
  }
}

export const rewardIntegrator = new RewardIntegrator();
