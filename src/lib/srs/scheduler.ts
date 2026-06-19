/**
 * SRS Scheduling Engine
 * 
 * Core scheduling logic for the Spaced Repetition System.
 * Integrates with SM-2 algorithm to calculate review schedules.
 */

import { db } from '@/db';
import { srsItems, srsSchedules, srsReviews, srsEvents, vocabulary } from '@/db/schema';
import { eq, and, lte, desc } from 'drizzle-orm';
import {
  calculateNextInterval,
  calculateNextReviewDate,
  initializeSchedule,
  calculateRetentionScore,
  determineMasteryLevel,
  calculateDifficultyScore,
  calculateStabilityScore,
  type SM2Schedule,
} from './sm2-algorithm';

export interface CreateSrsItemParams {
  userId: string;
  contentType: 'vocabulary' | 'story_vocabulary' | 'grammar_concepts' | 'lesson_concepts' | 'quiz_concepts';
  contentId: string;
}

export interface ScheduleReviewParams {
  srsItemId: string;
  quality: number; // 0-5 rating
  responseTime: number; // in milliseconds
}

export interface DueItem {
  id: string;
  contentType: string;
  contentId: string;
  nextReviewAt: Date;
  currentInterval: number;
  easeFactor: number;
  repetitions: number;
}

/**
 * Create a new SRS item with initial schedule
 */
export async function createSrsItem(params: CreateSrsItemParams): Promise<string> {
  const { userId, contentType, contentId } = params;

  // Create SRS item
  const [srsItem] = await db
    .insert(srsItems)
    .values({
      userId,
      contentType,
      contentId,
      status: 'learning',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Initialize schedule
  const initialSchedule = initializeSchedule();
  const nextReviewAt = calculateNextReviewDate(initialSchedule.interval);

  await db.insert(srsSchedules).values({
    srsItemId: srsItem.id,
    nextReviewAt,
    currentInterval: initialSchedule.interval,
    easeFactor: initialSchedule.easeFactor.toString(),
    repetitionCount: initialSchedule.repetitions,
    stabilityScore: '0',
    difficultyScore: '0',
    updatedAt: new Date(),
  });

  // Log event
  await logSrsEvent(userId, 'item_created', {
    srsItemId: srsItem.id,
    contentType,
    contentId,
  });

  return srsItem.id;
}

/**
 * Process a review and calculate next schedule
 */
export async function scheduleReview(params: ScheduleReviewParams): Promise<{
  nextReviewAt: Date;
  interval: number;
  easeFactor: number;
  repetitions: number;
  masteryLevel: string;
}> {
  const { srsItemId, quality, responseTime } = params;

  // Get current schedule
  const [schedule] = await db
    .select()
    .from(srsSchedules)
    .where(eq(srsSchedules.srsItemId, srsItemId))
    .limit(1);

  if (!schedule) {
    throw new Error('Schedule not found for SRS item');
  }

  // Get SRS item to retrieve userId
  const [srsItem] = await db
    .select()
    .from(srsItems)
    .where(eq(srsItems.id, srsItemId))
    .limit(1);

  if (!srsItem) {
    throw new Error('SRS item not found');
  }

  // Calculate new schedule using SM-2
  const newSchedule = calculateNextInterval(
    quality,
    schedule.currentInterval,
    parseFloat(schedule.easeFactor),
    schedule.repetitionCount
  );

  // Calculate next review date
  const nextReviewAt = calculateNextReviewDate(newSchedule.interval);

  // Update schedule
  await db
    .update(srsSchedules)
    .set({
      nextReviewAt,
      currentInterval: newSchedule.interval,
      easeFactor: newSchedule.easeFactor.toString(),
      repetitionCount: newSchedule.repetitions,
      stabilityScore: calculateStabilityScore(
        newSchedule.interval,
        newSchedule.repetitions
      ).toString(),
      difficultyScore: calculateDifficultyScore(newSchedule.easeFactor).toString(),
      updatedAt: new Date(),
    })
    .where(eq(srsSchedules.srsItemId, srsItemId));

  // Record review
  await db.insert(srsReviews).values({
    userId: srsItem.userId,
    srsItemId,
    reviewQuality: quality,
    responseTime,
    reviewedAt: new Date(),
  });

  // Update item status based on mastery level
  const masteryLevel = determineMasteryLevel(newSchedule);
  await db
    .update(srsItems)
    .set({
      status: masteryLevel,
      updatedAt: new Date(),
    })
    .where(eq(srsItems.id, srsItemId));

  // Log event
  await logSrsEvent(srsItem.userId, 'review_submitted', {
    srsItemId,
    quality,
    responseTime,
    newInterval: newSchedule.interval,
    newEaseFactor: newSchedule.easeFactor,
  });

  return {
    nextReviewAt,
    interval: newSchedule.interval,
    easeFactor: newSchedule.easeFactor,
    repetitions: newSchedule.repetitions,
    masteryLevel,
  };
}

/**
 * Get items due for review for a user
 */
export async function getDueItems(userId: string, limit: number = 20): Promise<DueItem[]> {
  const now = new Date();

  const results = await db
    .select({
      id: srsItems.id,
      contentType: srsItems.contentType,
      contentId: srsItems.contentId,
      nextReviewAt: srsSchedules.nextReviewAt,
      currentInterval: srsSchedules.currentInterval,
      easeFactor: srsSchedules.easeFactor,
      repetitions: srsSchedules.repetitionCount,
    })
    .from(srsItems)
    .innerJoin(srsSchedules, eq(srsItems.id, srsSchedules.srsItemId))
    .where(
      and(
        eq(srsItems.userId, userId),
        lte(srsSchedules.nextReviewAt, now),
        eq(srsItems.status, 'learning') // Only vocabulary for now
      )
    )
    .orderBy(srsSchedules.nextReviewAt)
    .limit(limit);

  return results.map((item) => ({
    id: item.id,
    contentType: item.contentType,
    contentId: item.contentId,
    nextReviewAt: item.nextReviewAt,
    currentInterval: item.currentInterval,
    easeFactor: parseFloat(item.easeFactor),
    repetitions: item.repetitions,
  }));
}

/**
 * Update schedule parameters for an SRS item
 */
export async function updateSchedule(
  srsItemId: string,
  scheduleData: Partial<SM2Schedule>
): Promise<void> {
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (scheduleData.interval !== undefined) {
    updateData.currentInterval = scheduleData.interval;
  }
  if (scheduleData.easeFactor !== undefined) {
    updateData.easeFactor = scheduleData.easeFactor.toString();
  }
  if (scheduleData.repetitions !== undefined) {
    updateData.repetitionCount = scheduleData.repetitions;
  }

  await db
    .update(srsSchedules)
    .set(updateData)
    .where(eq(srsSchedules.srsItemId, srsItemId));
}

/**
 * Get content details for an SRS item
 * Currently supports vocabulary only
 */
export async function getSrsItemContent(srsItemId: string) {
  const [srsItem] = await db
    .select()
    .from(srsItems)
    .where(eq(srsItems.id, srsItemId))
    .limit(1);

  if (!srsItem) {
    throw new Error('SRS item not found');
  }

  // For now, only support vocabulary
  if (srsItem.contentType === 'vocabulary') {
    const [vocab] = await db
      .select()
      .from(vocabulary)
      .where(eq(vocabulary.id, srsItem.contentId))
      .limit(1);

    if (!vocab) {
      throw new Error('Vocabulary not found');
    }

    return {
      type: 'vocabulary',
      content: vocab,
    };
  }

  throw new Error(`Content type ${srsItem.contentType} not yet supported`);
}

/**
 * Log an SRS event for audit trail
 */
async function logSrsEvent(
  userId: string,
  eventType: string,
  payload: Record<string, any>
): Promise<void> {
  await db.insert(srsEvents).values({
    userId,
    eventType,
    payload,
    createdAt: new Date(),
  });
}

/**
 * Get review history for a user
 */
export async function getReviewHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  const reviews = await db
    .select()
    .from(srsReviews)
    .where(eq(srsReviews.userId, userId))
    .orderBy(desc(srsReviews.reviewedAt))
    .limit(limit)
    .offset(offset);

  return reviews;
}

/**
 * Calculate retention score for a user based on recent reviews
 */
export async function getUserRetentionScore(userId: string): Promise<number> {
  const reviews = await db
    .select({ reviewQuality: srsReviews.reviewQuality })
    .from(srsReviews)
    .where(eq(srsReviews.userId, userId))
    .orderBy(desc(srsReviews.reviewedAt))
    .limit(100);

  const qualities = reviews.map((r) => r.reviewQuality);
  return calculateRetentionScore(qualities);
}
