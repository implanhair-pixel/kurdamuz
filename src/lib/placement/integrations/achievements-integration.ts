import { db } from '@/db/index';
import { userAchievements, achievements } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Achievements Integration for Placement Test
 * Triggers achievements for test completion and proficiency placement
 */
export class PlacementAchievementsIntegration {
  /**
   * Check and trigger achievements for placement test completion
   */
  static async triggerAchievementsForTestCompletion(
    userId: string,
    attemptId: string,
    overallScore: number,
    placementLevel: string
  ): Promise<void> {
    try {
      // Achievement: First Placement Test
      await this.checkAndAwardAchievement(
        userId,
        'first_placement_test',
        attemptId,
        'Completed first placement test'
      );

      // Achievement: Advanced Placement
      if (placementLevel === 'advanced') {
        await this.checkAndAwardAchievement(
          userId,
          'advanced_placement',
          attemptId,
          'Achieved advanced proficiency level'
        );
      }

      // Achievement: Intermediate Placement
      if (placementLevel === 'intermediate') {
        await this.checkAndAwardAchievement(
          userId,
          'intermediate_placement',
          attemptId,
          'Achieved intermediate proficiency level'
        );
      }

      // Achievement: High Score (90%+)
      if (overallScore >= 90) {
        await this.checkAndAwardAchievement(
          userId,
          'placement_high_score',
          attemptId,
          'Scored 90% or higher on placement test'
        );
      }

      // Achievement: Perfect Score (100%)
      if (overallScore === 100) {
        await this.checkAndAwardAchievement(
          userId,
          'placement_perfect_score',
          attemptId,
          'Achieved perfect score on placement test'
        );
      }

      console.log(`Checked achievements for user ${userId} for placement test completion`);
    } catch (error) {
      // Log error but don't fail the placement test
      console.error('Error triggering achievements for placement test:', error);
      // Achievement integration failure should not break placement test functionality
    }
  }

  /**
   * Check and award a specific achievement
   */
  private static async checkAndAwardAchievement(
    userId: string,
    achievementCode: string,
    sourceId: string,
    description: string
  ): Promise<void> {
    try {
      // Check if achievement exists
      const [achievement] = await db
        .select()
        .from(achievements)
        .where(eq((achievements as any).name, achievementCode));

      if (!achievement) {
        console.warn(`Achievement with code ${achievementCode} not found`);
        return;
      }

      // Check if user already has this achievement
      const [existing] = await db
        .select()
        .from(userAchievements)
        .where(
          and(
            eq(userAchievements.userId, userId),
            eq(userAchievements.achievementId, achievement.id)
          )
        );

      if (existing) {
        // User already has this achievement
        return;
      }

      // Award the achievement
      await (db.insert(userAchievements) as any).values({
        userId,
        achievementId: achievement.id,
        awardedAt: new Date(),
        sourceId,
      });

      console.log(`Awarded achievement ${achievementCode} to user ${userId}`);
    } catch (error) {
      console.error(`Error awarding achievement ${achievementCode}:`, error);
    }
  }

  /**
   * Check if achievements system is available
   */
  static isAchievementsSystemAvailable(): boolean {
    // Check if achievements tables exist in schema
    // For now, assume available - in production would check database schema
    return true;
  }
}
