import { walletManager } from '@/lib/wallet/wallet-manager';
import { policyService } from '@/lib/wallet/policy-service';

export class RewardDistributor {
  /**
   * Distribute XP and coin rewards to a user
   */
  async distributeRewards(
    userId: string,
    xpReward: number,
    coinReward: number,
    referenceType: string,
    referenceId: string
  ): Promise<void> {
    // Award coins
    if (coinReward > 0) {
      await walletManager.creditCoins(
        userId,
        coinReward,
        referenceType,
        referenceId,
        `Reward for ${referenceType}`,
        userId
      );
    }

    // Award XP (integrate with Phase 6 XP system)
    if (xpReward > 0) {
      // TODO: Integrate with Phase 6 XP system
      // For now, we'll log this as a placeholder
      console.log(`Awarding ${xpReward} XP to user ${userId} for ${referenceType}`);
    }
  }

  /**
   * Calculate rewards based on event type using coin economy policies
   */
  async calculateRewards(eventType: string): Promise<{ coins: number; xp: number } | null> {
    const policy = await policyService.getPolicy(eventType);
    
    if (!policy || !policy.isActive) {
      return null;
    }

    return {
      coins: policy.coinReward,
      xp: policy.xpReward,
    };
  }

  /**
   * Award rewards based on event type
   */
  async awardEventRewards(
    userId: string,
    eventType: string,
    referenceId: string
  ): Promise<void> {
    const rewards = await this.calculateRewards(eventType);
    
    if (!rewards) {
      return;
    }

    await this.distributeRewards(
      userId,
      rewards.xp,
      rewards.coins,
      eventType,
      referenceId
    );
  }
}

export const rewardDistributor = new RewardDistributor();
