import type { RecommendationInputs, RecommendationData } from '@/types/learning-paths';

/**
 * Personalize recommendations based on user goals and preferences
 */
export function personalizeRecommendations(
  inputs: RecommendationInputs,
  baseRecommendations: RecommendationData[]
): RecommendationData[] {
  const { individualGoals } = inputs;

  if (!individualGoals || individualGoals.length === 0) {
    return baseRecommendations;
  }

  // Filter and prioritize recommendations based on user goals
  const personalized = baseRecommendations.map(rec => {
    const goalAlignment = calculateGoalAlignment(rec, individualGoals);
    return {
      ...rec,
      priority: goalAlignment > 0.7 ? 'high' : rec.priority,
    };
  });

  // Sort by goal alignment
  return personalized.sort((a, b) => {
    const aAlignment = calculateGoalAlignment(a, individualGoals);
    const bAlignment = calculateGoalAlignment(b, individualGoals);
    return bAlignment - aAlignment;
  });
}

/**
 * Calculate alignment between a recommendation and user goals
 */
function calculateGoalAlignment(recommendation: RecommendationData, goals: any[]): number {
  if (!goals || goals.length === 0) return 0.5;

  let alignmentScore = 0;

  for (const goal of goals) {
    // Simple alignment logic - can be enhanced with more sophisticated matching
    if (goal.targetType === recommendation.targetType) {
      alignmentScore += 0.3;
    }

    if (goal.difficultyLevel === recommendation.difficultyLevel) {
      alignmentScore += 0.2;
    }

    if (goal.estimatedDuration && recommendation.estimatedDuration) {
      const durationDiff = Math.abs(goal.estimatedDuration - (recommendation.estimatedDuration || 0));
      if (durationDiff < 10) {
        alignmentScore += 0.2;
      }
    }
  }

  return Math.min(alignmentScore, 1);
}

/**
 * Adapt recommendations based on learning behavior patterns
 */
export function adaptToLearningBehavior(
  recommendations: RecommendationData[],
  learningBehaviors: any
): RecommendationData[] {
  if (!learningBehaviors) return recommendations;

  const { preferredTimeOfDay, preferredLessonType, averageSessionLength } = learningBehaviors;

  return recommendations.map(rec => {
    const adapted = { ...rec };

    // Adjust recommendations based on preferred lesson type
    if (preferredLessonType && rec.targetType === 'lesson') {
      // This would filter or prioritize based on lesson type
    }

    // Adjust based on session length
    if (averageSessionLength && rec.estimatedDuration) {
      if (rec.estimatedDuration > averageSessionLength * 1.5) {
        adapted.priority = 'low';
      }
    }

    return adapted;
  });
}

/**
 * Filter recommendations based on user constraints
 */
export function filterByConstraints(
  recommendations: RecommendationData[],
  constraints: {
    maxDuration?: number;
    minDifficulty?: string;
    maxDifficulty?: string;
    availableTime?: number;
  }
): RecommendationData[] {
  return recommendations.filter(rec => {
    if (constraints.maxDuration && rec.estimatedDuration && rec.estimatedDuration > constraints.maxDuration) {
      return false;
    }

    if (constraints.minDifficulty && rec.difficultyLevel) {
      const difficultyOrder = ['beginner', 'intermediate', 'advanced'];
      const minIndex = difficultyOrder.indexOf(constraints.minDifficulty);
      const recIndex = difficultyOrder.indexOf(rec.difficultyLevel);
      if (recIndex < minIndex) return false;
    }

    if (constraints.maxDifficulty && rec.difficultyLevel) {
      const difficultyOrder = ['beginner', 'intermediate', 'advanced'];
      const maxIndex = difficultyOrder.indexOf(constraints.maxDifficulty);
      const recIndex = difficultyOrder.indexOf(rec.difficultyLevel);
      if (recIndex > maxIndex) return false;
    }

    return true;
  });
}
