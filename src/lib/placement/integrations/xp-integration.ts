import { db } from '@/db/index';
import { xpTransactions, userLevels } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * XP Integration for Placement Test
 * Awards XP on test completion in a decoupled manner
 */
export class PlacementXPIntegration {
  /**
   * Award XP for completing a placement test
   * XP amount is based on overall score and completion
   */
  static async awardXPForTestCompletion(
    userId: string,
    attemptId: string,
    overallScore: number,
    placementLevel: string
  ): Promise<void> {
    try {
      // Calculate XP based on score and placement level
      const baseXP = 100; // Base XP for completing test
      const scoreBonus = Math.floor(overallScore * 0.5); // Bonus based on score
      const levelBonus = this.getLevelBonus(placementLevel);
      
      const totalXP = baseXP + scoreBonus + levelBonus;

      // Create XP transaction
      await db.insert(xpTransactions).values({
        userId,
        xpAmount: totalXP,
        transactionType: 'earned',
        sourceType: 'placement_test_completion',
        sourceId: attemptId,
        description: `Placement test completion - Score: ${overallScore.toFixed(1)}%, Level: ${placementLevel}`,
      });

      // Update user level
      await this.updateUserLevel(userId, totalXP);

      console.log(`Awarded ${totalXP} XP to user ${userId} for placement test completion`);
    } catch (error) {
      // Log error but don't fail the placement test
      console.error('Error awarding XP for placement test:', error);
      // XP integration failure should not break placement test functionality
    }
  }

  /**
   * Get bonus XP based on placement level
   */
  private static getLevelBonus(level: string): number {
    switch (level) {
      case 'advanced':
        return 50; // Bonus for achieving advanced level
      case 'intermediate':
        return 25; // Bonus for achieving intermediate level
      case 'beginner':
      default:
        return 0;
    }
  }

  /**
   * Update user level after earning XP
   */
  private static async updateUserLevel(userId: string, xpEarned: number): Promise<void> {
    try {
      const [userLevel] = await db
        .select()
        .from(userLevels)
        .where(eq(userLevels.userId, userId));

      if (!userLevel) {
        // Create new user level entry
        await db.insert(userLevels).values({
          userId,
          currentLevel: 1,
          currentXP: xpEarned,
          totalXP: xpEarned,
          xpToNextLevel: 100,
        });
      } else {
        // Update existing user level
        const newTotalXP = userLevel.totalXP + xpEarned;
        let newCurrentXP = userLevel.currentXP + xpEarned;
        
        // Check for level up
        let newLevel = userLevel.currentLevel;
        let xpToNext = userLevel.xpToNextLevel;
        
        while (newCurrentXP >= xpToNext) {
          newLevel++;
          newCurrentXP -= xpToNext;
          xpToNext = Math.floor(xpToNext * 1.5); // XP requirement increases by 50% each level
        }

        await db
          .update(userLevels)
          .set({
            currentLevel: newLevel,
            currentXP: newCurrentXP,
            totalXP: newTotalXP,
            xpToNextLevel: xpToNext,
            updatedAt: new Date(),
          })
          .where(eq(userLevels.userId, userId));
      }
    } catch (error) {
      console.error('Error updating user level:', error);
    }
  }

  /**
   * Check if XP system is available
   */
  static isXPSystemAvailable(): boolean {
    // Check if XP tables exist in schema
    // For now, assume available - in production would check database schema
    return true;
  }
}
