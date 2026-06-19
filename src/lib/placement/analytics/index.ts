import { db } from '@/db/index';
import { assessmentAttempts, placementResults, assessmentResponses } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { 
  AssessmentAnalytics, 
  ScoreDistribution, 
  PlacementDistribution,
  SkillBreakdown,
  PerformanceMetrics 
} from './types';

export class PlacementAnalytics {
  /**
   * Get overall assessment analytics
   */
  static async getOverallAnalytics(testId: string): Promise<AssessmentAnalytics> {
    const attempts = await db
      .select()
      .from(assessmentAttempts)
      .where(eq(assessmentAttempts.testId, testId));

    const completedAttempts = attempts.filter(a => a.status === 'completed');
    const totalAttempts = attempts.length;
    const completionRate = totalAttempts > 0 ? (completedAttempts.length / totalAttempts) * 100 : 0;

    const scores = completedAttempts
      .map(a => a.overallScore)
      .filter((s): s is string => s !== null && typeof s === "string")
      .map(s => parseFloat(s))
      .filter((n): n is number => !isNaN(n));
    
    const averageScore = scores.length > 0 
      ? scores.reduce((a, b) => a + b, 0) / scores.length 
      : 0;

    // Calculate average time
    const times = completedAttempts
      .filter(a => a.completedAt !== null && a.startedAt !== null)
      .map(a => {
        const start = new Date(a.startedAt!).getTime();
        const end = new Date(a.completedAt!).getTime();
        return (end - start) / 1000; // seconds
      });
    
    const averageTime = times.length > 0 
      ? times.reduce((a, b) => a + b, 0) / times.length 
      : 0;

    // Score distribution
    const scoreDistribution: ScoreDistribution = {
      beginner: scores.filter((s: number) => s < 40).length,
      intermediate: scores.filter((s: number) => s >= 40 && s < 70).length,
      advanced: scores.filter((s: number) => s >= 70).length,
    };

    // Placement distribution
    const placementDistribution: PlacementDistribution = {
      beginner: completedAttempts.filter(a => a.placementLevel === 'beginner').length,
      intermediate: completedAttempts.filter(a => a.placementLevel === 'intermediate').length,
      advanced: completedAttempts.filter(a => a.placementLevel === 'advanced').length,
    };

    return {
      totalAttempts,
      completionRate,
      averageScore,
      averageTime,
      scoreDistribution,
      placementDistribution,
    };
  }

  /**
   * Get skill breakdown for a user
   */
  static async getUserSkillBreakdown(userId: string): Promise<SkillBreakdown[]> {
    const results = await db
      .select()
      .from(placementResults)
      .where(eq(placementResults.userId, userId))
      .orderBy(desc(placementResults.createdAt))
      .limit(10);

    if (results.length === 0) return [];

    const domains = ['reading', 'writing', 'listening', 'speaking', 'grammar', 'vocabulary'];
    const breakdown: SkillBreakdown[] = [];

    for (const domain of domains) {
      const scores = results
        .map(r => r[`${domain}Score` as keyof typeof r])
        .filter((s): s is string => s !== null && typeof s === "string")
        .map(s => parseFloat(s))
        .filter((n): n is number => !isNaN(n));

      if (scores.length === 0) continue;

      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      
      // Calculate improvement trend (last 3 vs first 3)
      const recent = scores.slice(0, 3);
      const earlier = scores.slice(-3);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
      const improvementTrend = recentAvg - earlierAvg;

      breakdown.push({
        domain,
        averageScore,
        improvementTrend,
        rank: 0, // Would need comparison with other users
      });
    }

    return breakdown.sort((a, b) => b.averageScore - a.averageScore);
  }

  /**
   * Get performance metrics for a user
   */
  static async getUserPerformanceMetrics(userId: string): Promise<PerformanceMetrics> {
    const results = await db
      .select()
      .from(placementResults)
      .where(eq(placementResults.userId, userId));

    if (results.length === 0) {
      return {
        accuracy: 0,
        speed: 0,
        consistency: 0,
        growth: 0,
      };
    }

    const scores = results.map(r => parseFloat(r.overallScore)).filter((n): n is number => !isNaN(n));
    const accuracy = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Consistency (standard deviation)
    const mean = accuracy;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const consistency = 100 - Math.sqrt(variance); // Higher consistency = lower variance

    // Growth (improvement over time)
    const firstScore = scores[scores.length - 1];
    const lastScore = scores[0];
    const growth = lastScore - firstScore;

    // Speed would need timing data from attempts
    const speed = 0;

    return {
      accuracy,
      speed,
      consistency: Math.max(0, consistency),
      growth,
    };
  }

  /**
   * Get cohort performance comparison
   */
  static async getCohortComparison(userId: string) {
    const userResults = await db
      .select()
      .from(placementResults)
      .where(eq(placementResults.userId, userId));

    if (userResults.length === 0) return null;

    const userAvg = userResults.reduce((sum, r) => sum + parseFloat(r.overallScore), 0) / userResults.length;

    // Get all users' average scores
    const allResults = await db.select().from(placementResults);
    const userAverages = new Map<string, number[]>();

    for (const result of allResults) {
      if (!userAverages.has(result.userId)) {
        userAverages.set(result.userId, []);
      }
      userAverages.get(result.userId)!.push(parseFloat(result.overallScore));
    }

    const averages = Array.from(userAverages.values()).map(scores =>
      scores.reduce((a, b) => a + b, 0) / scores.length
    );

    const cohortAvg = averages.reduce((a, b) => a + b, 0) / averages.length;
    const percentile = (averages.filter(a => a < userAvg).length / averages.length) * 100;

    return {
      userAverage: userAvg,
      cohortAverage: cohortAvg,
      percentile,
      aboveAverage: userAvg >= cohortAvg,
    };
  }
}
