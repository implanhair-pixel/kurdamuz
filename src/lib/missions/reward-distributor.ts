import { walletManager } from '@/lib/wallet/wallet-manager';
import { policyService } from '@/lib/wallet/policy-service';
import { awardXP } from '@/lib/xp/xp';

function mapRewardSourceType(referenceType: string) {
  switch (referenceType) {
    case 'mission_completion':
      return 'special_event' as const;
    case 'daily_login':
    case 'lesson_completion':
    case 'quiz_completion':
    case 'course_completion':
    case 'streak':
    case 'achievement':
    case 'teacher_award':
    case 'admin_bonus':
    case 'special_event':
    case 'placement_test_completion':
    case 'community_post':
    case 'community_comment':
    case 'helpful_content':
      return referenceType;
    default:
      return 'special_event' as const;
  }
}

export class RewardDistributor {
  async distributeRewards(
    userId: string,
    xpReward: number,
    coinReward: number,
    referenceType: string,
    referenceId: string
  ): Promise<void> {
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

    if (xpReward > 0) {
      await awardXP(
        userId,
        xpReward,
        mapRewardSourceType(referenceType),
        referenceId,
        `Reward for ${referenceType}`
      );
    }
  }

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
