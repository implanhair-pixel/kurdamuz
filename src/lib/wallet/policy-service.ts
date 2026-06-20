import { db } from '@/db';
import { coinEconomyPolicies } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface CoinEconomyPolicy {
  id: string;
  eventType: 'daily_login' | 'lesson_completion' | 'quiz_completion' | 'vocabulary_session' | 'streak_milestone' | 'mission_completion';
  coinReward: number;
  xpReward: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PolicyService {
  /**
   * Get coin economy policy for an event type
   */
  async getPolicy(eventType: string): Promise<CoinEconomyPolicy | null> {
    const policies = await db
      .select()
      .from(coinEconomyPolicies)
      .where(eq(coinEconomyPolicies.eventType, eventType))
      .limit(1);

    if (policies.length === 0) {
      return null;
    }

    return policies[0] as CoinEconomyPolicy;
  }

  /**
   * Get all active policies
   */
  async getActivePolicies(): Promise<CoinEconomyPolicy[]> {
    const policies = await db
      .select()
      .from(coinEconomyPolicies)
      .where(eq(coinEconomyPolicies.isActive, true));

    return policies as CoinEconomyPolicy[];
  }

  /**
   * Get all policies
   */
  async getAllPolicies(): Promise<CoinEconomyPolicy[]> {
    const policies = await db
      .select()
      .from(coinEconomyPolicies);

    return policies as CoinEconomyPolicy[];
  }

  /**
   * Create or update a policy
   */
  async upsertPolicy(
    eventType: string,
    coinReward: number,
    xpReward: number,
    isActive: boolean = true,
    actorId: string
  ): Promise<CoinEconomyPolicy> {
    const existing = await this.getPolicy(eventType);

    if (existing) {
      // Update existing policy
      const updated = await db
        .update(coinEconomyPolicies)
        .set({
          coinReward,
          xpReward,
          isActive,
          updatedAt: new Date(),
        })
        .where(eq(coinEconomyPolicies.id, existing.id))
        .returning();

      return updated[0] as CoinEconomyPolicy;
    } else {
      // Create new policy
      const created = await db
        .insert(coinEconomyPolicies)
        .values({
          eventType,
          coinReward,
          xpReward,
          isActive,
        })
        .returning();

      return created[0] as CoinEconomyPolicy;
    }
  }

  /**
   * Deactivate a policy
   */
  async deactivatePolicy(eventType: string): Promise<void> {
    await db
      .update(coinEconomyPolicies)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(coinEconomyPolicies.eventType, eventType));
  }

  /**
   * Activate a policy
   */
  async activatePolicy(eventType: string): Promise<void> {
    await db
      .update(coinEconomyPolicies)
      .set({
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(coinEconomyPolicies.eventType, eventType));
  }

  /**
   * Delete a policy
   */
  async deletePolicy(eventType: string): Promise<void> {
    await db
      .delete(coinEconomyPolicies)
      .where(eq(coinEconomyPolicies.eventType, eventType));
  }

  /**
   * Calculate rewards for an event type
   */
  async calculateRewards(eventType: string): Promise<{ coins: number; xp: number } | null> {
    const policy = await this.getPolicy(eventType);

    if (!policy || !policy.isActive) {
      return null;
    }

    return {
      coins: policy.coinReward,
      xp: policy.xpReward,
    };
  }
}

export const policyService = new PolicyService();
