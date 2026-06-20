import type { ReliabilityMetrics } from './types';

/**
 * Calculate Cronbach's Alpha for internal consistency
 */
export function calculateCronbachAlpha(scores: number[][]): number {
  if (scores.length === 0 || scores[0].length === 0) return 0;

  const n = scores[0].length; // number of items
  const itemVariances: number[] = [];
  const totalScores: number[] = [];

  // Calculate variance for each item
  for (let i = 0; i < n; i++) {
    const itemScores = scores.map(s => s[i]);
    const mean = itemScores.reduce((a, b) => a + b, 0) / itemScores.length;
    const variance = itemScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / itemScores.length;
    itemVariances.push(variance);
  }

  // Calculate total scores and variance
  for (const scoreSet of scores) {
    const total = scoreSet.reduce((a, b) => a + b, 0);
    totalScores.push(total);
  }

  const totalMean = totalScores.reduce((a, b) => a + b, 0) / totalScores.length;
  const totalVariance = totalScores.reduce((sum, score) => sum + Math.pow(score - totalMean, 2), 0) / totalScores.length;

  const sumItemVariances = itemVariances.reduce((a, b) => a + b, 0);

  // Cronbach's Alpha formula
  const alpha = (n / (n - 1)) * (1 - sumItemVariances / totalVariance);
  
  return Math.max(0, Math.min(1, alpha)); // Clamp between 0 and 1
}

/**
 * Calculate split-half reliability
 */
export function calculateSplitHalfReliability(scores: number[][]): number {
  if (scores.length === 0 || scores[0].length < 2) return 0;

  const n = scores[0].length;
  const half = Math.floor(n / 2);

  const firstHalfScores = scores.map(s => s.slice(0, half).reduce((a, b) => a + b, 0));
  const secondHalfScores = scores.map(s => s.slice(half).reduce((a, b) => a + b, 0));

  // Calculate correlation between halves
  const correlation = calculatePearsonCorrelation(firstHalfScores, secondHalfScores);

  // Spearman-Brown prophecy formula
  const spearmanBrown = (2 * correlation) / (1 + correlation);
  
  return Math.max(0, Math.min(1, spearmanBrown));
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denominatorX += diffX * diffX;
    denominatorY += diffY * diffY;
  }

  const denominator = Math.sqrt(denominatorX * denominatorY);
  if (denominator === 0) return 0;

  return numerator / denominator;
}

/**
 * Calculate standard error of measurement
 */
export function calculateSEM(reliability: number, standardDeviation: number): number {
  if (reliability <= 0) return standardDeviation;
  return standardDeviation * Math.sqrt(1 - reliability);
}

/**
 * Generate reliability metrics
 */
export function generateReliabilityMetrics(
  scores: number[][],
  standardDeviation: number
): ReliabilityMetrics {
  const cronbachAlpha = calculateCronbachAlpha(scores);
  const splitHalfReliability = calculateSplitHalfReliability(scores);
  const standardErrorMeasurement = calculateSEM(cronbachAlpha, standardDeviation);

  return {
    cronbachAlpha,
    splitHalfReliability,
    testRetestReliability: 0, // Would need test-retest data
    standardErrorMeasurement,
  };
}
