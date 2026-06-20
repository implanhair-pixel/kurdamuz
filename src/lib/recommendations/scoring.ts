import type { RecommendationData } from '@/types/learning-paths';

/**
 * Calculate confidence score for a recommendation
 */
export function calculateConfidenceScore(
  recommendation: RecommendationData,
  context: {
    userProgress: number;
    performanceScore: number;
    engagementScore: number;
    dataFreshness: number; // 0-1, where 1 is most recent
  }
): number {
  let confidence = 0.5; // Base confidence

  // Adjust based on user progress
  if (context.userProgress > 0.8) {
    confidence += 0.2;
  } else if (context.userProgress > 0.5) {
    confidence += 0.1;
  }

  // Adjust based on performance
  if (context.performanceScore > 0.8) {
    confidence += 0.15;
  } else if (context.performanceScore > 0.6) {
    confidence += 0.1;
  }

  // Adjust based on engagement
  if (context.engagementScore > 0.7) {
    confidence += 0.1;
  }

  // Adjust based on data freshness
  confidence += context.dataFreshness * 0.05;

  // Adjust based on recommendation priority
  if (recommendation.priority === 'high') {
    confidence += 0.1;
  } else if (recommendation.priority === 'low') {
    confidence -= 0.1;
  }

  return Math.min(Math.max(confidence, 0), 1);
}

/**
 * Score multiple recommendations and return sorted list
 */
export function scoreAndSortRecommendations(
  recommendations: RecommendationData[],
  context: {
    userProgress: number;
    performanceScore: number;
    engagementScore: number;
    dataFreshness: number;
  }
): RecommendationData[] {
  const scored = recommendations.map(rec => ({
    ...rec,
    confidenceScore: calculateConfidenceScore(rec, context),
  }));

  // Sort by confidence score (descending)
  return scored.sort((a, b) => {
    const aScore = a.confidenceScore || 0;
    const bScore = b.confidenceScore || 0;
    return bScore - aScore;
  });
}

/**
 * Calculate learning velocity score
 */
export function calculateLearningVelocity(
  lessonsCompleted: number,
  timeSpent: number,
  timePeriod: number // in days
): number {
  if (timePeriod === 0) return 0;

  const lessonsPerDay = lessonsCompleted / timePeriod;
  const averageTimePerLesson = timeSpent / lessonsCompleted;

  // Normalize scores (these thresholds can be adjusted)
  const velocityScore = Math.min(lessonsPerDay / 2, 1); // 2 lessons per day = max score
  const efficiencyScore = Math.min(30 / averageTimePerLesson, 1); // 30 min per lesson = max score

  return (velocityScore + efficiencyScore) / 2;
}

/**
 * Calculate retention score based on review performance
 */
export function calculateRetentionScore(
  reviewResults: { correct: number; total: number }[]
): number {
  if (reviewResults.length === 0) return 0.5;

  const totalCorrect = reviewResults.reduce((sum, r) => sum + r.correct, 0);
  const totalQuestions = reviewResults.reduce((sum, r) => sum + r.total, 0);

  if (totalQuestions === 0) return 0.5;

  const accuracy = totalCorrect / totalQuestions;
  return accuracy;
}

/**
 * Calculate skill gap score
 */
export function calculateSkillGap(
  currentSkillLevel: number,
  targetSkillLevel: number,
  requiredSkillLevel: number
): number {
  const gapToTarget = targetSkillLevel - currentSkillLevel;
  const gapToRequired = requiredSkillLevel - currentSkillLevel;

  // Higher score means larger gap (more need for learning)
  const maxGap = Math.max(gapToTarget, gapToRequired);
  return Math.min(maxGap / 100, 1); // Normalize to 0-1
}

/**
 * Calculate recommendation diversity score
 */
export function calculateDiversityScore(
  recommendations: RecommendationData[]
): number {
  if (recommendations.length === 0) return 0;

  const types = new Set(recommendations.map(r => r.targetType));
  const typeDiversity = types.size / recommendations.length;

  const difficulties = new Set(recommendations.map(r => r.difficultyLevel).filter(Boolean));
  const difficultyDiversity = difficulties.size / recommendations.length;

  return (typeDiversity + difficultyDiversity) / 2;
}
