import { db } from '@/db';
import { learningRecommendations, userLearningProgress } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type {
  RecommendationInputs,
  RecommendationOutputs,
  RecommendationData,
  RecommendationEngineConfig,
} from '@/types/learning-paths';

const DEFAULT_CONFIG: RecommendationEngineConfig = {
  weights: {
    progressWeight: 0.3,
    performanceWeight: 0.25,
    engagementWeight: 0.2,
    goalsWeight: 0.25,
  },
  thresholds: {
    minConfidenceScore: 0.5,
    maxRecommendationsPerUser: 5,
    recommendationExpiryDays: 7,
  },
};

/**
 * Generate personalized learning recommendations for a user
 */
export async function generateRecommendations(
  inputs: RecommendationInputs,
  config: RecommendationEngineConfig = DEFAULT_CONFIG
): Promise<RecommendationOutputs> {
  const { userId, learningProgress, assessmentPerformance, xpHistory, achievements, streakActivity } = inputs;

  const outputs: RecommendationOutputs = {};

  // Calculate overall progress score
  const progressScore = calculateProgressScore(learningProgress, config.weights.progressWeight);

  // Calculate performance score
  const performanceScore = calculatePerformanceScore(assessmentPerformance, config.weights.performanceWeight);

  // Calculate engagement score
  const engagementScore = calculateEngagementScore(xpHistory, achievements, streakActivity, config.weights.engagementWeight);

  // Calculate goals alignment score
  const goalsScore = calculateGoalsScore(inputs.individualGoals, config.weights.goalsWeight);

  // Overall confidence score
  const overallConfidence = (progressScore + performanceScore + engagementScore + goalsScore) / 4;

  if (overallConfidence < config.thresholds.minConfidenceScore) {
    return outputs; // Not enough data for confident recommendations
  }

  // Generate next lesson recommendation
  outputs.nextLesson = await generateNextLessonRecommendation(inputs);

  // Generate next module recommendation
  outputs.nextModule = await generateNextModuleRecommendation(inputs);

  // Generate remedial content recommendations if needed
  if (performanceScore < 0.6) {
    outputs.remedialContent = await generateRemedialRecommendations(inputs);
  }

  // Generate practice activity recommendations
  outputs.practiceActivities = await generatePracticeRecommendations(inputs);

  // Generate certification targets if eligible
  if (progressScore > 0.9 && performanceScore > 0.8) {
    outputs.certificationTargets = await generateCertificationRecommendations(inputs);
  }

  // Save recommendations to database
  await saveRecommendations(userId, outputs, overallConfidence, config.thresholds.recommendationExpiryDays);

  return outputs;
}

/**
 * Calculate progress score based on user learning progress
 */
function calculateProgressScore(progress: any[], weight: number): number {
  if (!progress || progress.length === 0) return 0;

  const completedItems = progress.filter((p: any) => p.completionStatus === 'completed').length;
  const totalItems = progress.length;
  const completionRate = completedItems / totalItems;

  return completionRate * weight;
}

/**
 * Calculate performance score based on assessment results
 */
function calculatePerformanceScore(assessments: any[], weight: number): number {
  if (!assessments || assessments.length === 0) return 0.5; // Neutral score if no data

  const averageScore = assessments.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / assessments.length;
  return (averageScore / 100) * weight;
}

/**
 * Calculate engagement score based on XP, achievements, and streaks
 */
function calculateEngagementScore(
  xpHistory: any[],
  achievements: any[],
  streakActivity: any,
  weight: number
): number {
  let score = 0;

  // XP engagement
  if (xpHistory && xpHistory.length > 0) {
    const recentXP = xpHistory.slice(-7).reduce((sum: number, x: any) => sum + (x.xpAmount || 0), 0);
    score += Math.min(recentXP / 1000, 1) * 0.4;
  }

  // Achievement engagement
  if (achievements && achievements.length > 0) {
    score += Math.min(achievements.length / 10, 1) * 0.3;
  }

  // Streak engagement
  if (streakActivity && streakActivity.currentStreak > 0) {
    score += Math.min(streakActivity.currentStreak / 30, 1) * 0.3;
  }

  return score * weight;
}

/**
 * Calculate goals alignment score
 */
function calculateGoalsScore(goals: any, weight: number): number {
  if (!goals || goals.length === 0) return 0.5;

  const completedGoals = goals.filter((g: any) => g.status === 'completed').length;
  const totalGoals = goals.length;
  const completionRate = completedGoals / totalGoals;

  return completionRate * weight;
}

/**
 * Generate next lesson recommendation
 */
async function generateNextLessonRecommendation(inputs: RecommendationInputs): Promise<RecommendationData | undefined> {
  const { userId, learningProgress } = inputs;

  // Find the most recent incomplete lesson
  const recentProgress = await db
    .select()
    .from(userLearningProgress)
    .where(
      and(
        eq(userLearningProgress.userId, userId),
        eq(userLearningProgress.completionStatus, 'in_progress')
      )
    )
    .orderBy(desc(userLearningProgress.lastAccessedAt))
    .limit(1);

  if (recentProgress[0] && recentProgress[0].lessonId) {
    return {
      targetId: recentProgress[0].lessonId,
      targetType: 'lesson',
      reason: 'Continue your current lesson',
      priority: 'high',
    };
  }

  // If no in-progress lesson, find the first lesson of the first path
  if (learningProgress && learningProgress.length > 0) {
    const firstPathId = learningProgress[0].pathId;
    // This would need to query the curriculum structure
    // For now, return a placeholder
    return {
      targetId: firstPathId,
      targetType: 'path',
      reason: 'Start your learning journey',
      priority: 'high',
    };
  }

  return undefined;
}

/**
 * Generate next module recommendation
 */
async function generateNextModuleRecommendation(inputs: RecommendationInputs): Promise<RecommendationData | undefined> {
  // This would analyze module completion and recommend the next module
  // Placeholder implementation
  return undefined;
}

/**
 * Generate remedial content recommendations
 */
async function generateRemedialRecommendations(inputs: RecommendationInputs): Promise<RecommendationData[]> {
  // This would identify weak areas and recommend remedial content
  // Placeholder implementation
  return [];
}

/**
 * Generate practice activity recommendations
 */
async function generatePracticeRecommendations(inputs: RecommendationInputs): Promise<RecommendationData[]> {
  // This would recommend practice activities based on recent learning
  // Placeholder implementation
  return [];
}

/**
 * Generate certification recommendations
 */
async function generateCertificationRecommendations(inputs: RecommendationInputs): Promise<RecommendationData[]> {
  // This would recommend certification paths when user is eligible
  // Placeholder implementation
  return [];
}

/**
 * Save recommendations to database
 */
async function saveRecommendations(
  userId: string,
  outputs: RecommendationOutputs,
  confidenceScore: number,
  expiryDays: number
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  const recommendationsToSave: any[] = [];

  if (outputs.nextLesson) {
    recommendationsToSave.push({
      userId,
      recommendationType: 'next_lesson',
      recommendationData: outputs.nextLesson,
      confidenceScore,
      expiresAt,
    });
  }

  if (outputs.nextModule) {
    recommendationsToSave.push({
      userId,
      recommendationType: 'next_module',
      recommendationData: outputs.nextModule,
      confidenceScore,
      expiresAt,
    });
  }

  if (outputs.remedialContent && outputs.remedialContent.length > 0) {
    for (const remedial of outputs.remedialContent) {
      recommendationsToSave.push({
        userId,
        recommendationType: 'remedial',
        recommendationData: remedial,
        confidenceScore,
        expiresAt,
      });
    }
  }

  if (outputs.practiceActivities && outputs.practiceActivities.length > 0) {
    for (const practice of outputs.practiceActivities) {
      recommendationsToSave.push({
        userId,
        recommendationType: 'practice',
        recommendationData: practice,
        confidenceScore,
        expiresAt,
      });
    }
  }

  if (outputs.certificationTargets && outputs.certificationTargets.length > 0) {
    for (const cert of outputs.certificationTargets) {
      recommendationsToSave.push({
        userId,
        recommendationType: 'certification',
        recommendationData: cert,
        confidenceScore,
        expiresAt,
      });
    }
  }

  // Clear old recommendations
  await db
    .delete(learningRecommendations)
    .where(eq(learningRecommendations.userId, userId));

  // Insert new recommendations
  if (recommendationsToSave.length > 0) {
    await db.insert(learningRecommendations).values(recommendationsToSave);
  }
}

/**
 * Get active recommendations for a user
 */
export async function getUserRecommendations(userId: string): Promise<any[]> {
  const now = new Date();

  return db
    .select()
    .from(learningRecommendations)
    .where(
      and(
        eq(learningRecommendations.userId, userId),
        eq(learningRecommendations.isDismissed, false)
      )
    )
    .orderBy(desc(learningRecommendations.confidenceScore));
}

/**
 * Dismiss a recommendation
 */
export async function dismissRecommendation(recommendationId: string): Promise<boolean> {
  const results = await db
    .update(learningRecommendations)
    .set({ isDismissed: true })
    .where(eq(learningRecommendations.id, recommendationId))
    .returning();

  return results.length > 0;
}
