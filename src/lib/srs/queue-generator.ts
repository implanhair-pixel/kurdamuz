/**
 * Review Queue Generation Service
 * 
 * Generates prioritized daily review queues for learners.
 * Balances workload and prioritizes overdue/low-retention items.
 */

import { db } from '@/db';
import { srsItems, srsSchedules, srsReviews, srsReviewQueues, srsQueueItems } from '@/db/schema';
import { eq, and, lte, desc, asc, sql } from 'drizzle-orm';
import { getDueItems } from './scheduler';

export interface QueueItem {
  id: string;
  srsItemId: string;
  contentType: string;
  contentId: string;
  priorityScore: number;
  nextReviewAt: Date;
  currentInterval: number;
  easeFactor: number;
}

export interface GeneratedQueue {
  queueId: string;
  queueDate: Date;
  totalItems: number;
  items: QueueItem[];
}

/**
 * Calculate priority score for an SRS item
 * 
 * Priority factors:
 * - Overdue status (highest priority)
 * - Low retention score
 * - Frequent failures
 * - Current interval (shorter = higher priority)
 */
export function calculatePriorityScore(
  nextReviewAt: Date,
  currentInterval: number,
  easeFactor: number,
  recentReviews: number[]
): number {
  const now = new Date();
  const overdueHours = Math.max(0, (now.getTime() - nextReviewAt.getTime()) / (1000 * 60 * 60));
  
  // Base score from overdue status (0-50 points)
  const overdueScore = Math.min(50, overdueHours * 2); // 2 points per hour overdue, max 50
  
  // Score from ease factor (lower ease = higher priority, 0-25 points)
  const easeScore = Math.max(0, (2.5 - easeFactor) / (2.5 - 1.3) * 25);
  
  // Score from interval (shorter = higher priority, 0-15 points)
  const intervalScore = Math.max(0, (30 - currentInterval) / 30 * 15);
  
  // Score from recent performance (0-10 points)
  const recentReviewsCount = recentReviews.length;
  const recentAverage = recentReviewsCount > 0 
    ? recentReviews.reduce((sum, r) => sum + r, 0) / recentReviewsCount 
    : 5;
  const performanceScore = (5 - recentAverage) * 2; // Lower average = higher priority
  
  return overdueScore + easeScore + intervalScore + performanceScore;
}

/**
 * Generate daily review queue for a user
 */
export async function generateDailyQueue(
  userId: string,
  queueDate: Date = new Date()
): Promise<GeneratedQueue> {
  // Check if queue already exists for this date
  const [existingQueue] = await db
    .select()
    .from(srsReviewQueues)
    .where(
      and(
        eq(srsReviewQueues.userId, userId),
        eq(srsReviewQueues.queueDate, queueDate.toISOString().split('T')[0] as any)
      )
    )
    .limit(1);

  if (existingQueue) {
    // Return existing queue
    const queueItems = await db
      .select({
        id: srsQueueItems.id,
        srsItemId: srsQueueItems.srsItemId,
        contentType: srsItems.contentType,
        contentId: srsItems.contentId,
        priorityScore: srsQueueItems.priorityScore,
        nextReviewAt: srsSchedules.nextReviewAt,
        currentInterval: srsSchedules.currentInterval,
        easeFactor: srsSchedules.easeFactor,
      })
      .from(srsQueueItems)
      .innerJoin(srsItems, eq(srsQueueItems.srsItemId, srsItems.id))
      .innerJoin(srsSchedules, eq(srsItems.id, srsSchedules.srsItemId))
      .where(eq(srsQueueItems.queueId, existingQueue.id))
      .orderBy(desc(srsQueueItems.priorityScore));

    return {
      queueId: existingQueue.id,
      queueDate,
      totalItems: queueItems.length,
      items: queueItems.map((item) => ({
        id: item.id,
        srsItemId: item.srsItemId,
        contentType: item.contentType,
        contentId: item.contentId,
        priorityScore: parseFloat(item.priorityScore),
        nextReviewAt: item.nextReviewAt,
        currentInterval: item.currentInterval,
        easeFactor: parseFloat(item.easeFactor),
      })),
    };
  }

  // Get due items
  const dueItems = await getDueItems(userId, 100); // Get up to 100 due items

  if (dueItems.length === 0) {
    // Create empty queue
    const [queue] = await db
      .insert(srsReviewQueues)
      .values({
        userId,
        queueDate: queueDate.toISOString().split('T')[0] as any,
        totalItems: 0,
        generatedAt: new Date(),
      })
      .returning();

    return {
      queueId: queue.id,
      queueDate,
      totalItems: 0,
      items: [],
    };
  }

  // Calculate priority scores for each item
  const itemsWithPriority: QueueItem[] = [];
  
  for (const item of dueItems) {
    // Get recent reviews for this item
    const recentReviews = await db
      .select({ reviewQuality: srsReviews.reviewQuality })
      .from(srsReviews)
      .where(eq(srsReviews.srsItemId, item.id))
      .orderBy(desc(srsReviews.reviewedAt))
      .limit(10);

    const priorityScore = calculatePriorityScore(
      item.nextReviewAt,
      item.currentInterval,
      item.easeFactor,
      recentReviews.map((r) => r.reviewQuality)
    );

    itemsWithPriority.push({
      id: '', // Will be set when creating queue item
      srsItemId: item.id,
      contentType: item.contentType,
      contentId: item.contentId,
      priorityScore,
      nextReviewAt: item.nextReviewAt,
      currentInterval: item.currentInterval,
      easeFactor: item.easeFactor,
    });
  }

  // Balance workload - limit to reasonable daily target
  const targetItems = Math.min(itemsWithPriority.length, 50); // Max 50 items per day
  const prioritizedItems = itemsWithPriority
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, targetItems);

  // Create queue
  const [queue] = await db
    .insert(srsReviewQueues)
    .values({
      userId,
      queueDate: queueDate.toISOString().split('T')[0] as any,
      totalItems: prioritizedItems.length,
      generatedAt: new Date(),
    })
    .returning();

  // Create queue items
  for (const item of prioritizedItems) {
    await db.insert(srsQueueItems).values({
      queueId: queue.id,
      srsItemId: item.srsItemId,
      priorityScore: item.priorityScore.toString(),
      status: 'pending',
    });
  }

  return {
    queueId: queue.id,
    queueDate,
    totalItems: prioritizedItems.length,
    items: prioritizedItems.map((item) => ({
      ...item,
      id: '', // IDs not needed for return
    })),
  };
}

/**
 * Get queue for a user for a specific date
 */
export async function getQueueForUser(
  userId: string,
  queueDate: Date = new Date()
): Promise<GeneratedQueue | null> {
  const [queue] = await db
    .select()
    .from(srsReviewQueues)
    .where(
      and(
        eq(srsReviewQueues.userId, userId),
        eq(srsReviewQueues.queueDate, queueDate.toISOString().split('T')[0] as any)
      )
    )
    .limit(1);

  if (!queue) {
    return null;
  }

  const queueItems = await db
    .select({
      id: srsQueueItems.id,
      srsItemId: srsQueueItems.srsItemId,
      contentType: srsItems.contentType,
      contentId: srsItems.contentId,
      priorityScore: srsQueueItems.priorityScore,
      status: srsQueueItems.status,
      nextReviewAt: srsSchedules.nextReviewAt,
      currentInterval: srsSchedules.currentInterval,
      easeFactor: srsSchedules.easeFactor,
    })
    .from(srsQueueItems)
    .innerJoin(srsItems, eq(srsQueueItems.srsItemId, srsItems.id))
    .innerJoin(srsSchedules, eq(srsItems.id, srsSchedules.srsItemId))
    .where(eq(srsQueueItems.queueId, queue.id))
    .orderBy(desc(srsQueueItems.priorityScore));

  return {
    queueId: queue.id,
    queueDate,
    totalItems: queueItems.length,
    items: queueItems.map((item) => ({
      id: item.id,
      srsItemId: item.srsItemId,
      contentType: item.contentType,
      contentId: item.contentId,
      priorityScore: parseFloat(item.priorityScore),
      nextReviewAt: item.nextReviewAt,
      currentInterval: item.currentInterval,
      easeFactor: parseFloat(item.easeFactor),
    })),
  };
}

/**
 * Balance workload by adjusting queue size based on learner capacity
 * 
 * @param userId - User ID
 * @param targetItems - Target number of items
 * @returns Adjusted number of items
 */
export async function balanceWorkload(
  userId: string,
  targetItems: number
): Promise<number> {
  // Get recent completion rates
  const recentQueues = await db
    .select({ totalItems: srsReviewQueues.totalItems })
    .from(srsReviewQueues)
    .where(eq(srsReviewQueues.userId, userId))
    .orderBy(desc(srsReviewQueues.queueDate))
    .limit(7);

  if (recentQueues.length === 0) {
    return targetItems;
  }

  const avgItems = recentQueues.reduce((sum, q) => sum + q.totalItems, 0) / recentQueues.length;

  // If user consistently completes fewer items, reduce target
  if (avgItems < targetItems * 0.7) {
    return Math.max(10, Math.floor(avgItems * 1.2)); // Gradual increase
  }

  // If user consistently completes more items, can increase target
  if (avgItems > targetItems * 1.3) {
    return Math.min(100, Math.floor(targetItems * 1.1));
  }

  return targetItems;
}

/**
 * Mark queue item as completed
 */
export async function completeQueueItem(queueItemId: string): Promise<void> {
  await db
    .update(srsQueueItems)
    .set({ status: 'completed' })
    .where(eq(srsQueueItems.id, queueItemId));
}

/**
 * Skip queue item
 */
export async function skipQueueItem(queueItemId: string): Promise<void> {
  await db
    .update(srsQueueItems)
    .set({ status: 'skipped' })
    .where(eq(srsQueueItems.id, queueItemId));
}

/**
 * Get queue completion statistics
 */
export async function getQueueStatistics(queueId: string) {
  const items = await db
    .select({ status: srsQueueItems.status })
    .from(srsQueueItems)
    .where(eq(srsQueueItems.queueId, queueId));

  const total = items.length;
  const completed = items.filter((i) => i.status === 'completed').length;
  const skipped = items.filter((i) => i.status === 'skipped').length;
  const pending = items.filter((i) => i.status === 'pending').length;

  return {
    total,
    completed,
    skipped,
    pending,
    completionRate: total > 0 ? (completed / total) * 100 : 0,
  };
}
