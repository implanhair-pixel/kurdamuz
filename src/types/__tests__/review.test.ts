import {
  calculateNextReview,
  getLearningStatus,
  DEFAULT_SPACED_REPETITION_CONFIG,
} from '../review';

describe('Spaced Repetition Algorithm', () => {
  describe('calculateNextReview', () => {
    it('should calculate next review for high quality response', () => {
      const currentProgress = {
        id: '1',
        userId: 'user1',
        vocabularyId: 'vocab1',
        masteryScore: 50,
        reviewCount: 1,
        correctCount: 1,
        incorrectCount: 0,
        lastReviewedAt: new Date(),
      };

      const result = calculateNextReview(currentProgress, 5);

      expect(result.masteryScore).toBeGreaterThan(50);
      expect(result.nextReviewAt).toBeInstanceOf(Date);
    });

    it('should calculate next review for low quality response', () => {
      const currentProgress = {
        id: '1',
        userId: 'user1',
        vocabularyId: 'vocab1',
        masteryScore: 50,
        reviewCount: 1,
        correctCount: 0,
        incorrectCount: 1,
        lastReviewedAt: new Date(),
      };

      const result = calculateNextReview(currentProgress, 1);

      expect(result.masteryScore).toBeLessThan(50);
      expect(result.nextReviewAt).toBeInstanceOf(Date);
    });

    it('should reset interval for failed reviews (quality < 3)', () => {
      const currentProgress = {
        id: '1',
        userId: 'user1',
        vocabularyId: 'vocab1',
        masteryScore: 50,
        reviewCount: 5,
        correctCount: 3,
        incorrectCount: 2,
        lastReviewedAt: new Date(),
      };

      const result = calculateNextReview(currentProgress, 2);

      const daysUntilReview = Math.ceil(
        (result.nextReviewAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      expect(daysUntilReview).toBe(DEFAULT_SPACED_REPETITION_CONFIG.initialInterval);
    });

    it('should increase interval for successful reviews (quality >= 3)', () => {
      const currentProgress = {
        id: '1',
        userId: 'user1',
        vocabularyId: 'vocab1',
        masteryScore: 50,
        reviewCount: 5,
        correctCount: 4,
        incorrectCount: 1,
        lastReviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      };

      const result = calculateNextReview(currentProgress, 4);

      const daysUntilReview = Math.ceil(
        (result.nextReviewAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      expect(daysUntilReview).toBeGreaterThan(DEFAULT_SPACED_REPETITION_CONFIG.initialInterval);
    });

    it('should cap mastery score at 100', () => {
      const currentProgress = {
        id: '1',
        userId: 'user1',
        vocabularyId: 'vocab1',
        masteryScore: 95,
        reviewCount: 10,
        correctCount: 10,
        incorrectCount: 0,
        lastReviewedAt: new Date(),
      };

      const result = calculateNextReview(currentProgress, 5);

      expect(result.masteryScore).toBeLessThanOrEqual(100);
    });

    it('should ensure mastery score is at least 0', () => {
      const currentProgress = {
        id: '1',
        userId: 'user1',
        vocabularyId: 'vocab1',
        masteryScore: 5,
        reviewCount: 10,
        correctCount: 0,
        incorrectCount: 10,
        lastReviewedAt: new Date(),
      };

      const result = calculateNextReview(currentProgress, 0);

      expect(result.masteryScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getLearningStatus', () => {
    it('should return mastered for high mastery score', () => {
      const progress = {
        id: '1',
        userId: 'user1',
        vocabularyId: 'vocab1',
        masteryScore: 92,
        reviewCount: 5,
        correctCount: 5,
        incorrectCount: 0,
      };

      const status = getLearningStatus(progress);
      expect(status).toBe('mastered');
    });

    it('should return reviewing for multiple reviews', () => {
      const progress = {
        id: '1',
        userId: 'user1',
        vocabularyId: 'vocab1',
        masteryScore: 60,
        reviewCount: 3,
        correctCount: 2,
        incorrectCount: 1,
      };

      const status = getLearningStatus(progress);
      expect(status).toBe('reviewing');
    });

    it('should return learning for some reviews', () => {
      const progress = {
        id: '1',
        userId: 'user1',
        vocabularyId: 'vocab1',
        masteryScore: 40,
        reviewCount: 1,
        correctCount: 0,
        incorrectCount: 1,
      };

      const status = getLearningStatus(progress);
      expect(status).toBe('learning');
    });

    it('should return new for no reviews', () => {
      const progress = {
        id: '1',
        userId: 'user1',
        vocabularyId: 'vocab1',
        masteryScore: 0,
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
      };

      const status = getLearningStatus(progress);
      expect(status).toBe('new');
    });
  });
});

describe('Review Quality Labels', () => {
  it('should have correct number of quality levels', () => {
    const { REVIEW_QUALITY_LABELS } = require('../review');
    expect(Object.keys(REVIEW_QUALITY_LABELS)).toHaveLength(6);
  });

  it('should have quality levels from 0 to 5', () => {
    const { REVIEW_QUALITY_LABELS } = require('../review');
    const levels = Object.keys(REVIEW_QUALITY_LABELS).map(Number);
    expect(levels).toEqual([0, 1, 2, 3, 4, 5]);
  });
});
