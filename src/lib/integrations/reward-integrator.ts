import { rewardDistributor } from '@/lib/missions/reward-distributor';
import { walletManager } from '@/lib/wallet/wallet-manager';
import { policyService } from '@/lib/wallet/policy-service';

/**
 * Reward Integrator
 * Integrates the coin system with Phase 6 XP, Phase 7 Streaks/Achievements, and Phase 8 Daily Challenges
 */

export class RewardIntegrator {
  /**
   * Handle lesson completion event
   * Called when a user completes a lesson
   */
  async handleLessonCompletion(userId: string, lessonId: string): Promise<void> {
    await rewardDistributor.awardEventRewards(
      userId,
      'lesson_completion',
      lessonId
    );
  }

  /**
   * Handle quiz completion event
   * Called when a user completes a quiz
   */
  async handleQuizCompletion(userId: string, quizId: string, score: number): Promise<void> {
    // Award base rewards for quiz completion
    await rewardDistributor.awardEventRewards(
      userId,
      'quiz_completion',
      quizId
    );

    // Bonus rewards for high scores (90%+)
    if (score >= 90) {
      await walletManager.creditCoins(
        userId,
        10, // Bonus coins
        'quiz_bonus',
        quizId,
        'Bonus for high quiz score',
        userId
      );
    }
  }

  /**
   * Handle daily login event
   * Called when a user logs in for the first time in a day
   */
  async handleDailyLogin(userId: string): Promise<void> {
    await rewardDistributor.awardEventRewards(
      userId,
      'daily_login',
      userId
    );
  }

  /**
   * Handle vocabulary session completion
   * Called when a user completes a vocabulary session
   */
  async handleVocabularySession(userId: string, sessionId: string): Promise<void> {
    await rewardDistributor.awardEventRewards(
      userId,
      'vocabulary_session',
      sessionId
    );
  }

  /**
   * Handle streak milestone event
   * Called when a user reaches a streak milestone
   */
  async handleStreakMilestone(userId: string, streakDays: number): Promise<void> {
    // Base streak milestone reward
    await rewardDistributor.awardEventRewards(
      userId,
      'streak_milestone',
      userId
    );

    // Additional bonus for longer streaks
    if (streakDays >= 30) {
      await walletManager.creditCoins(
        userId,
        50, // Bonus coins for 30-day streak
        'streak_bonus',
        userId,
        'Bonus for 30-day streak',
        userId
      );
    } else if (streakDays >= 14) {
      await walletManager.creditCoins(
        userId,
        25, // Bonus coins for 14-day streak
        'streak_bonus',
        userId,
        'Bonus for 14-day streak',
        userId
      );
    }
  }

  /**
   * Handle achievement unlock event
   * Called when a user unlocks an achievement
   */
  async handleAchievementUnlock(userId: string, achievementId: string): Promise<void> {
    // Get achievement-specific reward from policy or use default
    const policy = await policyService.getPolicy('achievement_unlock');
    
    if (policy) {
      await walletManager.creditCoins(
        userId,
        policy.coinReward,
        'achievement',
        achievementId,
        `Reward for achievement unlock`,
        userId
      );
    } else {
      // Default achievement reward
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

  /**
   * Handle daily challenge completion
   * Called when a user completes a daily challenge
   */
  async handleDailyChallengeCompletion(userId: string, challengeId: string): Promise<void> {
    // Award mission completion rewards
    await rewardDistributor.awardEventRewards(
      userId,
      'mission_completion',
      challengeId
    );
  }

  /**
   * Calculate and award XP for an event
   * Integrates with Phase 6 XP system
   */
  async awardXP(userId: string, eventType: string, referenceId: string): Promise<number> {
    const rewards = await rewardDistributor.calculateRewards(eventType);
    
    if (!rewards) {
      return 0;
    }

    // TODO: Integrate with Phase 6 XP system
    // For now, we'll return the XP amount that would be awarded
    console.log(`Awarding ${rewards.xp} XP to user ${userId} for ${eventType}`);
    
    return rewards.xp;
  }

  /**
   * Get total rewards earned by a user
   */
  async getUserTotalRewards(userId: string): Promise<{
    totalCoins: number;
    totalXP: number;
  }> {
    // Get wallet balance
    const wallet = await walletManager.getBalance(userId);
    
    // TODO: Get total XP from Phase 6 system
    const totalXP = 0;

    return {
      totalCoins: wallet,
      totalXP,
    };
  }
}

export const rewardIntegrator = new RewardIntegrator();
