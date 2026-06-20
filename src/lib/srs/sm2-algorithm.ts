/**
 * SM-2 (SuperMemo 2) Algorithm Implementation
 * 
 * Based on the original SuperMemo 2 algorithm by Piotr Wozniak
 * Quality rating scale: 0-5
 * 0 - Blackout (complete failure)
 * 1 - Incorrect response with correct response remembered
 * 2 - Incorrect response where correct response seemed easy to recall
 * 3 - Correct response recalled with serious difficulty
 * 4 - Correct response recalled after hesitation
 * 5 - Perfect response
 */

export interface SM2Schedule {
  interval: number; // Days until next review
  easeFactor: number; // Ease factor (default 2.5)
  repetitions: number; // Number of successful repetitions
}

export interface SM2Parameters {
  quality: number; // 0-5 rating
  previousInterval: number; // Previous interval in days
  previousEaseFactor: number; // Previous ease factor
  previousRepetitions: number; // Previous repetition count
}

/**
 * Calculate the next review interval using SM-2 algorithm
 * 
 * @param quality - Response quality rating (0-5)
 * @param previousInterval - Previous interval in days
 * @param previousEaseFactor - Previous ease factor
 * @param previousRepetitions - Previous repetition count
 * @returns Next schedule with interval, ease factor, and repetitions
 */
export function calculateNextInterval(
  quality: number,
  previousInterval: number,
  previousEaseFactor: number,
  previousRepetitions: number
): SM2Schedule {
  // Validate quality rating
  if (quality < 0 || quality > 5) {
    throw new Error('Quality rating must be between 0 and 5');
  }

  // If quality is less than 3, reset repetitions to 0 and interval to 1 day
  if (quality < 3) {
    return {
      interval: 1,
      easeFactor: previousEaseFactor,
      repetitions: 0,
    };
  }

  // Calculate new ease factor
  const newEaseFactor = calculateEaseFactor(quality, previousEaseFactor);

  // Calculate new interval based on repetitions
  let newInterval: number;
  let newRepetitions: number;

  if (previousRepetitions === 0) {
    // First successful review
    newInterval = 1;
    newRepetitions = 1;
  } else if (previousRepetitions === 1) {
    // Second successful review
    newInterval = 6;
    newRepetitions = 2;
  } else {
    // Subsequent reviews
    newInterval = Math.round(previousInterval * newEaseFactor);
    newRepetitions = previousRepetitions + 1;
  }

  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    repetitions: newRepetitions,
  };
}

/**
 * Calculate the ease factor based on quality rating
 * 
 * Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 * 
 * @param quality - Response quality rating (0-5)
 * @param previousEaseFactor - Previous ease factor
 * @returns New ease factor (minimum 1.3)
 */
export function calculateEaseFactor(quality: number, previousEaseFactor: number): number {
  // Validate quality rating
  if (quality < 0 || quality > 5) {
    throw new Error('Quality rating must be between 0 and 5');
  }

  // Calculate new ease factor using SM-2 formula
  const newEaseFactor =
    previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Ensure ease factor doesn't go below 1.3
  return Math.max(1.3, newEaseFactor);
}

/**
 * Initialize a new SM-2 schedule with default parameters
 * 
 * @returns Initial schedule with default values
 */
export function initializeSchedule(): SM2Schedule {
  return {
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
  };
}

/**
 * Calculate the next review date based on interval
 * 
 * @param interval - Interval in days
 * @param baseDate - Base date (defaults to current date)
 * @returns Next review date as Date object
 */
export function calculateNextReviewDate(interval: number, baseDate: Date = new Date()): Date {
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + interval);
  return nextDate;
}

/**
 * Calculate retention score based on review history
 * 
 * @param reviews - Array of review quality ratings
 * @returns Retention score (0-100)
 */
export function calculateRetentionScore(reviews: number[]): number {
  if (reviews.length === 0) {
    return 0;
  }

  // Calculate average quality
  const averageQuality = reviews.reduce((sum, quality) => sum + quality, 0) / reviews.length;

  // Convert to percentage (quality 0-5 maps to 0-100)
  return (averageQuality / 5) * 100;
}

/**
 * Determine mastery level based on schedule parameters
 * 
 * @param schedule - SM-2 schedule
 * @returns Mastery level (learning, reinforcement, retention, mastery)
 */
export function determineMasteryLevel(schedule: SM2Schedule): string {
  if (schedule.repetitions === 0) {
    return 'learning';
  } else if (schedule.repetitions < 3) {
    return 'reinforcement';
  } else if (schedule.repetitions < 7) {
    return 'retention';
  } else {
    return 'mastery';
  }
}

/**
 * Calculate difficulty score based on ease factor
 * 
 * @param easeFactor - Current ease factor
 * @returns Difficulty score (0-100, higher = more difficult)
 */
export function calculateDifficultyScore(easeFactor: number): number {
  // Inverse relationship: lower ease factor = higher difficulty
  // Ease factor typically ranges from 1.3 to 2.5+
  const normalized = (2.5 - easeFactor) / (2.5 - 1.3);
  return Math.max(0, Math.min(100, normalized * 100));
}

/**
 * Calculate stability score based on interval and repetitions
 * 
 * @param interval - Current interval in days
 * @param repetitions - Number of repetitions
 * @returns Stability score (0-100)
 */
export function calculateStabilityScore(interval: number, repetitions: number): number {
  // Stability increases with both interval and repetitions
  // Normalize interval: 0-365+ days maps to 0-50 points
  const intervalScore = Math.min(50, (interval / 365) * 50);
  
  // Normalize repetitions: 0-10+ repetitions maps to 0-50 points
  const repetitionScore = Math.min(50, (repetitions / 10) * 50);
  
  return intervalScore + repetitionScore;
}
