import { z } from 'zod';

// ============================================================================
// VOCABULARY PROGRESS TYPES
// ============================================================================

export interface VocabularyProgress {
  id: string;
  userId: string;
  vocabularyId: string;
  masteryScore: number; // 0-100
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  lastReviewedAt?: Date;
  nextReviewAt?: Date;
  vocabulary?: any; // Will be VocabularyEntry
}

export type LearningStatus = 'new' | 'learning' | 'reviewing' | 'mastered';

export const getLearningStatus = (progress: VocabularyProgress): LearningStatus => {
  if (progress.masteryScore >= 90) return 'mastered';
  if (progress.reviewCount >= 3) return 'reviewing';
  if (progress.reviewCount >= 1) return 'learning';
  return 'new';
};

// ============================================================================
// REVIEW SESSION TYPES
// ============================================================================

export interface ReviewSession {
  id: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  totalWords: number;
  correctAnswers: number;
  attempts?: ReviewAttempt[];
}

export interface ReviewAttempt {
  id: string;
  sessionId: string;
  vocabularyId: string;
  responseQuality: number; // 0-5
  reviewedAt: Date;
  vocabulary?: any; // Will be VocabularyEntry
}

// ============================================================================
// REVIEW QUALITY SCALE
// ============================================================================

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

export const REVIEW_QUALITY_LABELS: Record<ReviewQuality, string> = {
  0: 'Complete Failure',
  1: 'Difficult Recall',
  2: 'Partial Recall',
  3: 'Correct Recall',
  4: 'Easy Recall',
  5: 'Perfect Recall',
};

export const REVIEW_QUALITY_DESCRIPTIONS: Record<ReviewQuality, string> = {
  0: 'Could not recall the word at all',
  1: 'Recalled with significant difficulty',
  2: 'Recalled partially with some errors',
  3: 'Recalled correctly after some thought',
  4: 'Recalled easily without hesitation',
  5: 'Recalled instantly and perfectly',
};

// ============================================================================
// SPACED REPETITION ALGORITHM
// ============================================================================

export interface SpacedRepetitionConfig {
  initialInterval: number; // days
  minimumInterval: number; // days
  maximumInterval: number; // days
  easeFactor: number; // multiplier
  easeFactorModifier: number; // adjustment per review
}

export const DEFAULT_SPACED_REPETITION_CONFIG: SpacedRepetitionConfig = {
  initialInterval: 1,
  minimumInterval: 1,
  maximumInterval: 365,
  easeFactor: 2.5,
  easeFactorModifier: 0.1,
};

/**
 * Calculate next review date using SM-2 algorithm variant
 * @param currentProgress Current vocabulary progress
 * @param responseQuality Review quality (0-5)
 * @param config Spaced repetition configuration
 * @returns Next review date and updated mastery score
 */
export const calculateNextReview = (
  currentProgress: VocabularyProgress,
  responseQuality: ReviewQuality,
  config: SpacedRepetitionConfig = DEFAULT_SPACED_REPETITION_CONFIG
): { nextReviewAt: Date; masteryScore: number } => {
  const { masteryScore, reviewCount, lastReviewedAt } = currentProgress;
  
  // Calculate new mastery score based on response quality
  const qualityWeight = responseQuality / 5;
  const newMasteryScore = Math.min(100, Math.max(0, 
    masteryScore * 0.7 + qualityWeight * 30
  ));
  
  // Calculate interval based on review quality
  let interval: number;
  
  if (responseQuality < 3) {
    // Failed or difficult review - reset to shorter interval
    interval = config.initialInterval;
  } else {
    // Successful review - increase interval
    const previousInterval = lastReviewedAt 
      ? Math.max(1, Math.floor((Date.now() - lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24)))
      : config.initialInterval;
    
    const easeFactorAdjustment = (responseQuality - 3) * config.easeFactorModifier;
    const adjustedEaseFactor = Math.max(1.3, config.easeFactor + easeFactorAdjustment);
    
    interval = Math.min(config.maximumInterval, 
      Math.max(config.minimumInterval, Math.floor(previousInterval * adjustedEaseFactor))
    );
  }
  
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);
  
  return { nextReviewAt, masteryScore: Math.round(newMasteryScore) };
};

// ============================================================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================================================

export const reviewQualitySchema = z.number().int().min(0).max(5);

export const vocabularyProgressSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  vocabularyId: z.string().uuid(),
  masteryScore: z.number().int().min(0).max(100),
  reviewCount: z.number().int().min(0),
  correctCount: z.number().int().min(0),
  incorrectCount: z.number().int().min(0),
  lastReviewedAt: z.date().optional(),
  nextReviewAt: z.date().optional(),
});

export const reviewSessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  totalWords: z.number().int().min(0),
  correctAnswers: z.number().int().min(0),
});

export const reviewAttemptSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  vocabularyId: z.string().uuid(),
  responseQuality: reviewQualitySchema,
  reviewedAt: z.date(),
});

export const startReviewSessionSchema = z.object({
  vocabularyIds: z.array(z.string().uuid()).min(1).max(50),
});

export const submitReviewAttemptSchema = z.object({
  sessionId: z.string().uuid(),
  vocabularyId: z.string().uuid(),
  responseQuality: reviewQualitySchema,
});

export const completeReviewSessionSchema = z.object({
  sessionId: z.string().uuid(),
});

export const getDueForReviewSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  dialectId: z.string().uuid().optional(),
  difficultyLevel: z.enum(['beginner', 'elementary', 'intermediate', 'advanced']).optional(),
});

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type StartReviewSessionInput = z.infer<typeof startReviewSessionSchema>;
export type SubmitReviewAttemptInput = z.infer<typeof submitReviewAttemptSchema>;
export type CompleteReviewSessionInput = z.infer<typeof completeReviewSessionSchema>;
export type GetDueForReviewInput = z.infer<typeof getDueForReviewSchema>;
