import { db } from '@/db/index';
import { placementResults } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { defaultThresholds, getProficiencyLevel, getDomainProficiency } from './thresholds';
import type { ProficiencyThreshold, PlacementResult, DomainProficiency, ProficiencyLevel } from './types';

export class ProficiencyClassifier {
  /**
   * Classify learner proficiency based on overall score
   */
  static classify(overallScore: number, thresholds?: ProficiencyThreshold[]): ProficiencyLevel {
    const usedThresholds = thresholds || defaultThresholds;
    return getProficiencyLevel(overallScore, usedThresholds);
  }

  /**
   * Generate placement result with confidence
   */
  static generatePlacementResult(
    overallScore: number,
    domainScores: Record<string, number>,
    thresholds?: ProficiencyThreshold[]
  ): PlacementResult {
    const usedThresholds = thresholds || defaultThresholds;
    const recommendedLevel = this.classify(overallScore, usedThresholds);

    // Calculate confidence based on distance from threshold boundaries
    const threshold = usedThresholds.find(t => t.level === recommendedLevel);
    const range = threshold!.maxScore - threshold!.minScore;
    const distanceFromMin = overallScore - threshold!.minScore;
    const confidence = Math.min(1, (distanceFromMin / (range / 2)) + 0.5);

    // Calculate domain proficiencies
    const domainProficiencies: DomainProficiency[] = Object.entries(domainScores).map(([domain, score]) => {
      const { level, strength } = getDomainProficiency(score, usedThresholds);
      return {
        domain,
        score,
        level,
        strength,
      };
    });

    return {
      overallScore,
      recommendedLevel,
      confidence,
      domainScores: domainProficiencies,
    };
  }

  /**
   * Get user's placement history
   */
  static async getUserPlacementHistory(userId: string) {
    const results = await db
      .select()
      .from(placementResults)
      .where(eq(placementResults.userId, userId))
      .orderBy(desc(placementResults.createdAt));

    return results;
  }

  /**
   * Get latest placement result for user
   */
  static async getLatestPlacement(userId: string) {
    const [result] = await db
      .select()
      .from(placementResults)
      .where(eq(placementResults.userId, userId))
      .orderBy(desc(placementResults.createdAt))
      .limit(1);

    return result || null;
  }

  /**
   * Check if user needs re-assessment
   */
  static async needsReassessment(userId: string, daysSinceLast: number = 90): Promise<boolean> {
    const latest = await this.getLatestPlacement(userId);
    
    if (!latest) return true;
    
    const daysSince = Math.floor(
      (Date.now() - new Date(latest.createdAt!).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysSince >= daysSinceLast;
  }
}
