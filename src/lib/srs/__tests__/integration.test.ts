/**
 * Integration Tests for SRS Workflows
 * 
 * Tests the complete SRS workflow from item creation to review submission
 * to ensure learner retention outcomes are not silently destroyed.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createSrsItem, scheduleReview, getDueItems } from '../scheduler';
import { generateDailyQueue } from '../queue-generator';
import { db } from '@/db';
import { srsItems, srsSchedules, srsReviews } from '@/db/schema';
import { eq } from 'drizzle-orm';

// requires live server
describe.skip('SRS Integration Tests', () => {
  const testUserId = 'test-user-integration';
  let testVocabularyId: string;

  beforeAll(async () => {
    // Setup test data
    testVocabularyId = 'test-vocab-' + Date.now();
  });

  afterAll(async () => {
    // Cleanup test data
    await db.delete(srsReviews).where(eq(srsReviews.userId, testUserId));
    await db.delete(srsSchedules);
    await db.delete(srsItems).where(eq(srsItems.userId, testUserId));
  });

  describe('Complete Review Workflow', () => {
    it('should create SRS item and initialize schedule', async () => {
      const srsItemId = await createSrsItem({
        userId: testUserId,
        contentType: 'vocabulary',
        contentId: testVocabularyId,
      });

      expect(srsItemId).toBeDefined();

      // Verify item was created
      const [item] = await db
        .select()
        .from(srsItems)
        .where(eq(srsItems.id, srsItemId))
        .limit(1);

      expect(item).toBeDefined();
      expect(item.userId).toBe(testUserId);
      expect(item.contentType).toBe('vocabulary');
      expect(item.contentId).toBe(testVocabularyId);
      expect(item.status).toBe('learning');

      // Verify schedule was initialized
      const [schedule] = await db
        .select()
        .from(srsSchedules)
        .where(eq(srsSchedules.srsItemId, srsItemId))
        .limit(1);

      expect(schedule).toBeDefined();
      expect(parseFloat(schedule.easeFactor)).toBe(2.5);
      expect(schedule.repetitionCount).toBe(0);
      expect(schedule.currentInterval).toBe(0);
    });

    it('should process review and update schedule', async () => {
      const srsItemId = await createSrsItem({
        userId: testUserId,
        contentType: 'vocabulary',
        contentId: testVocabularyId + '-review',
      });

      // Submit a review with quality 4 (easy)
      const result = await scheduleReview({
        srsItemId,
        quality: 4,
        responseTime: 2000,
      });

      expect(result).toBeDefined();
      expect(result.interval).toBeGreaterThan(0);
      expect(result.easeFactor).toBeGreaterThan(2.5);
      expect(result.repetitions).toBe(1);
      expect(result.masteryLevel).toBe('reinforcement');

      // Verify schedule was updated
      const [schedule] = await db
        .select()
        .from(srsSchedules)
        .where(eq(srsSchedules.srsItemId, srsItemId))
        .limit(1);

      expect(schedule.currentInterval).toBe(result.interval);
      expect(parseFloat(schedule.easeFactor)).toBeCloseTo(result.easeFactor, 1);
      expect(schedule.repetitionCount).toBe(result.repetitions);

      // Verify review was recorded
      const [review] = await db
        .select()
        .from(srsReviews)
        .where(eq(srsReviews.srsItemId, srsItemId))
        .limit(1);

      expect(review).toBeDefined();
      expect(review.reviewQuality).toBe(4);
      expect(review.responseTime).toBe(2000);
    });

    it('should handle failed review by resetting schedule', async () => {
      const srsItemId = await createSrsItem({
        userId: testUserId,
        contentType: 'vocabulary',
        contentId: testVocabularyId + '-fail',
      });

      // First successful review
      await scheduleReview({
        srsItemId,
        quality: 5,
        responseTime: 1000,
      });

      // Failed review (quality 2)
      const result = await scheduleReview({
        srsItemId,
        quality: 2,
        responseTime: 5000,
      });

      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
      expect(result.masteryLevel).toBe('learning');
    });
  });

  describe('Queue Generation Workflow', () => {
    it('should generate daily queue for user', async () => {
      // Create multiple SRS items
      const item1 = await createSrsItem({
        userId: testUserId,
        contentType: 'vocabulary',
        contentId: testVocabularyId + '-queue-1',
      });

      const item2 = await createSrsItem({
        userId: testUserId,
        contentType: 'vocabulary',
        contentId: testVocabularyId + '-queue-2',
      });

      // Generate queue
      const queue = await generateDailyQueue(testUserId);

      expect(queue).toBeDefined();
      expect(queue.queueId).toBeDefined();
      expect(queue.totalItems).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(queue.items)).toBe(true);
    });

    it('should prioritize overdue items in queue', async () => {
      const srsItemId = await createSrsItem({
        userId: testUserId,
        contentType: 'vocabulary',
        contentId: testVocabularyId + '-priority',
      });

      // Submit a review to set next review date
      await scheduleReview({
        srsItemId,
        quality: 5,
        responseTime: 1000,
      });

      // Manually set next review date to past (overdue)
      await db
        .update(srsSchedules)
        .set({ nextReviewAt: new Date(Date.now() - 86400000) }) // 1 day ago
        .where(eq(srsSchedules.srsItemId, srsItemId));

      // Generate queue
      const queue = await generateDailyQueue(testUserId);

      // Verify overdue item is in queue
      const overdueItem = queue.items.find((item) => item.id === srsItemId);
      expect(overdueItem).toBeDefined();
    });
  });

  describe('Due Items Retrieval', () => {
    it('should retrieve items due for review', async () => {
      const srsItemId = await createSrsItem({
        userId: testUserId,
        contentType: 'vocabulary',
        contentId: testVocabularyId + '-due',
      });

      // Set next review date to now
      await db
        .update(srsSchedules)
        .set({ nextReviewAt: new Date() })
        .where(eq(srsSchedules.srsItemId, srsItemId));

      // Get due items
      const dueItems = await getDueItems(testUserId);

      expect(Array.isArray(dueItems)).toBe(true);
      const dueItem = dueItems.find((item) => item.id === srsItemId);
      expect(dueItem).toBeDefined();
    });
  });

  describe('SM-2 Algorithm Integration', () => {
    it('should maintain mathematical consistency across review cycle', async () => {
      const srsItemId = await createSrsItem({
        userId: testUserId,
        contentType: 'vocabulary',
        contentId: testVocabularyId + '-consistency',
      });

      let currentEaseFactor = 2.5;
      let currentInterval = 0;
      let currentRepetitions = 0;

      // Simulate a review cycle
      const qualities = [5, 4, 5, 3, 5, 4, 5];

      for (const quality of qualities) {
        const result = await scheduleReview({
          srsItemId,
          quality,
          responseTime: 2000,
        });

        // Verify mathematical consistency
        expect(result.interval).toBeGreaterThanOrEqual(0);
        expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
        expect(result.repetitions).toBeGreaterThanOrEqual(0);

        currentEaseFactor = result.easeFactor;
        currentInterval = result.interval;
        currentRepetitions = result.repetitions;
      }

      // Final state should reflect cumulative learning
      expect(currentRepetitions).toBeGreaterThan(0);
      expect(currentInterval).toBeGreaterThan(0);
    });
  });
});
