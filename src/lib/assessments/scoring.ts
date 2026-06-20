/**
 * Calculate assessment score based on answers
 */
export function calculateAssessmentScore(
  answers: Record<string, any>,
  correctAnswers: Record<string, any>,
  totalQuestions: number
): number {
  let correctCount = 0;

  for (const questionId in answers) {
    if (answers[questionId] === correctAnswers[questionId]) {
      correctCount++;
    }
  }

  return (correctCount / totalQuestions) * 100;
}

/**
 * Calculate weighted assessment score
 */
export function calculateWeightedScore(
  scores: number[],
  weights: number[]
): number {
  if (scores.length !== weights.length) {
    throw new Error('Scores and weights must have the same length');
  }

  let totalWeight = 0;
  let weightedSum = 0;

  for (let i = 0; i < scores.length; i++) {
    weightedSum += scores[i] * weights[i];
    totalWeight += weights[i];
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Determine if assessment is passed
 */
export function isAssessmentPassed(score: number, passingScore: number): boolean {
  return score >= passingScore;
}

/**
 * Calculate assessment grade
 */
export function calculateAssessmentGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Calculate assessment percentile
 */
export function calculatePercentile(score: number, allScores: number[]): number {
  if (allScores.length === 0) return 0;

  const scoresBelow = allScores.filter(s => s < score).length;
  return (scoresBelow / allScores.length) * 100;
}

/**
 * Calculate assessment improvement
 */
export function calculateImprovement(
  previousScore: number,
  currentScore: number
): number {
  return currentScore - previousScore;
}

/**
 * Calculate assessment consistency
 */
export function calculateConsistency(scores: number[]): number {
  if (scores.length < 2) return 100;

  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const standardDeviation = Math.sqrt(variance);

  // Consistency is inverse of standard deviation (lower deviation = higher consistency)
  return Math.max(0, 100 - standardDeviation);
}

/**
 * Normalize assessment score to a standard scale
 */
export function normalizeScore(score: number, min: number, max: number): number {
  return ((score - min) / (max - min)) * 100;
}

/**
 * Calculate assessment difficulty based on average scores
 */
export function calculateAssessmentDifficulty(averageScore: number): 'easy' | 'medium' | 'hard' {
  if (averageScore >= 80) return 'easy';
  if (averageScore >= 60) return 'medium';
  return 'hard';
}

/**
 * Calculate assessment reliability (Cronbach's alpha approximation)
 */
export function calculateReliability(
  itemScores: number[][]
): number {
  if (itemScores.length < 2) return 0;

  const itemCount = itemScores.length;
  const participantCount = itemScores[0].length;

  // Calculate variance of total scores
  const totalScores = [];
  for (let i = 0; i < participantCount; i++) {
    let total = 0;
    for (let j = 0; j < itemCount; j++) {
      total += itemScores[j][i];
    }
    totalScores.push(total);
  }

  const meanTotal = totalScores.reduce((sum, score) => sum + score, 0) / participantCount;
  const varianceTotal = totalScores.reduce((sum, score) => sum + Math.pow(score - meanTotal, 2), 0) / participantCount;

  // Calculate variance of individual items
  let sumItemVariances = 0;
  for (let j = 0; j < itemCount; j++) {
    const meanItem = itemScores[j].reduce((sum, score) => sum + score, 0) / participantCount;
    const varianceItem = itemScores[j].reduce((sum, score) => sum + Math.pow(score - meanItem, 2), 0) / participantCount;
    sumItemVariances += varianceItem;
  }

  // Cronbach's alpha
  const alpha = (itemCount / (itemCount - 1)) * (1 - (sumItemVariances / varianceTotal));

  return Math.max(0, Math.min(1, alpha));
}
