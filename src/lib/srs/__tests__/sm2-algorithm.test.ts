/**
 * Unit Tests for SM-2 Algorithm
 * 
 * Tests the mathematical correctness of the SM-2 algorithm implementation
 * to ensure learner retention outcomes are not silently destroyed.
 */

import {
  calculateNextInterval,
  calculateEaseFactor,
  initializeSchedule,
  calculateNextReviewDate,
  calculateRetentionScore,
  determineMasteryLevel,
  calculateDifficultyScore,
  calculateStabilityScore,
  type SM2Schedule,
} from '../sm2-algorithm';

describe('SM-2 Algorithm', () => {
  describe('calculateEaseFactor', () => {
    it('should calculate ease factor correctly for quality 5 (perfect)', () => {
      const easeFactor = calculateEaseFactor(5, 2.5);
      expect(easeFactor).toBeCloseTo(2.6, 1);
    });

    it('should calculate ease factor correctly for quality 4 (hesitation)', () => {
      const easeFactor = calculateEaseFactor(4, 2.5);
      expect(easeFactor).toBeCloseTo(2.5, 1);
    });

    it('should calculate ease factor correctly for quality 3 (difficulty)', () => {
      const easeFactor = calculateEaseFactor(3, 2.5);
      expect(easeFactor).toBeCloseTo(2.36, 1);
    });

    it('should calculate ease factor correctly for quality 2 (incorrect but easy)', () => {
      const easeFactor = calculateEaseFactor(2, 2.5);
      expect(easeFactor).toBeCloseTo(2.18, 1);
    });

    it('should calculate ease factor correctly for quality 1 (incorrect but remembered)', () => {
      const easeFactor = calculateEaseFactor(1, 2.5);
      expect(easeFactor).toBeCloseTo(1.96, 1);
    });

    it('should calculate ease factor correctly for quality 0 (blackout)', () => {
      const easeFactor = calculateEaseFactor(0, 2.5);
      expect(easeFactor).toBeCloseTo(1.7, 1);
    });

    it('should not allow ease factor below 1.3', () => {
      const easeFactor = calculateEaseFactor(0, 1.3);
      expect(easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('should throw error for quality > 5', () => {
      expect(() => calculateEaseFactor(6, 2.5)).toThrow('Quality rating must be between 0 and 5');
    });

    it('should throw error for quality < 0', () => {
      expect(() => calculateEaseFactor(-1, 2.5)).toThrow('Quality rating must be between 0 and 5');
    });
  });

  describe('calculateNextInterval', () => {
    it('should reset to 1 day interval for quality < 3', () => {
      const schedule = calculateNextInterval(2, 10, 2.5, 5);
      expect(schedule.interval).toBe(1);
      expect(schedule.repetitions).toBe(0);
    });

    it('should set interval to 1 day for first successful review (quality >= 3)', () => {
      const schedule = calculateNextInterval(3, 0, 2.5, 0);
      expect(schedule.interval).toBe(1);
      expect(schedule.repetitions).toBe(1);
    });

    it('should set interval to 6 days for second successful review', () => {
      const schedule = calculateNextInterval(4, 1, 2.5, 1);
      expect(schedule.interval).toBe(6);
      expect(schedule.repetitions).toBe(2);
    });

    it('should calculate interval using ease factor for third+ review', () => {
      const schedule = calculateNextInterval(5, 6, 2.5, 2);
      expect(schedule.interval).toBe(16); // 6 * updated 2.6 = 15.6, rounded
      expect(schedule.interval).toBe(16); // 6 * updated EF 2.6 = 15.6, rounded to 16
      expect(schedule.repetitions).toBe(3);
    });

    it('should increase interval with high ease factor', () => {
      const schedule = calculateNextInterval(5, 10, 3.0, 3);
      expect(schedule.interval).toBe(31); // 10 * updated 3.1 = 31
      expect(schedule.interval).toBe(31); // 10 * updated EF 3.1 = 31
    });

    it('should decrease interval with low ease factor', () => {
      const schedule = calculateNextInterval(3, 10, 1.5, 3);
      expect(schedule.interval).toBe(14); // 10 * updated 1.36 = 13.6, rounded
      expect(schedule.interval).toBe(14); // 10 * updated EF 1.36 = 13.6, rounded to 14
    });

    it('should update ease factor based on quality', () => {
      const schedule = calculateNextInterval(5, 6, 2.5, 2);
      expect(schedule.easeFactor).toBeCloseTo(2.6, 1);
    });

    it('should throw error for quality > 5', () => {
      expect(() => calculateNextInterval(6, 0, 2.5, 0)).toThrow('Quality rating must be between 0 and 5');
    });

    it('should throw error for quality < 0', () => {
      expect(() => calculateNextInterval(-1, 0, 2.5, 0)).toThrow('Quality rating must be between 0 and 5');
    });
  });

  describe('initializeSchedule', () => {
    it('should initialize with default values', () => {
      const schedule = initializeSchedule();
      expect(schedule.interval).toBe(0);
      expect(schedule.easeFactor).toBe(2.5);
      expect(schedule.repetitions).toBe(0);
    });
  });

  describe('calculateNextReviewDate', () => {
    it('should calculate next review date correctly', () => {
      const baseDate = new Date('2024-01-01');
      const nextDate = calculateNextReviewDate(10, baseDate);
      expect(nextDate).toEqual(new Date('2024-01-11'));
    });

    it('should default to current date if base date not provided', () => {
      const nextDate = calculateNextReviewDate(1);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 1);
      expect(nextDate.getDate()).toBe(expectedDate.getDate());
    });

    it('should handle zero interval', () => {
      const baseDate = new Date('2024-01-01');
      const nextDate = calculateNextReviewDate(0, baseDate);
      expect(nextDate).toEqual(baseDate);
    });
  });

  describe('calculateRetentionScore', () => {
    it('should return 0 for empty review history', () => {
      const score = calculateRetentionScore([]);
      expect(score).toBe(0);
    });

    it('should calculate 100% for perfect reviews', () => {
      const score = calculateRetentionScore([5, 5, 5]);
      expect(score).toBe(100);
    });

    it('should calculate 0% for all blackouts', () => {
      const score = calculateRetentionScore([0, 0, 0]);
      expect(score).toBe(0);
    });

    it('should calculate 60% for average quality 3', () => {
      const score = calculateRetentionScore([3, 3, 3]);
      expect(score).toBe(60);
    });

    it('should calculate mixed reviews correctly', () => {
      const score = calculateRetentionScore([5, 3, 4, 2]);
      expect(score).toBe(70); // Average of 3.5 = 70%
    });
  });

  describe('determineMasteryLevel', () => {
    it('should return learning for 0 repetitions', () => {
      const schedule: SM2Schedule = { interval: 0, easeFactor: 2.5, repetitions: 0 };
      expect(determineMasteryLevel(schedule)).toBe('learning');
    });

    it('should return reinforcement for 1-2 repetitions', () => {
      const schedule: SM2Schedule = { interval: 1, easeFactor: 2.5, repetitions: 1 };
      expect(determineMasteryLevel(schedule)).toBe('reinforcement');
    });

    it('should return reinforcement for 2 repetitions', () => {
      const schedule: SM2Schedule = { interval: 6, easeFactor: 2.5, repetitions: 2 };
      expect(determineMasteryLevel(schedule)).toBe('reinforcement');
    });

    it('should return retention for 3-6 repetitions', () => {
      const schedule: SM2Schedule = { interval: 15, easeFactor: 2.5, repetitions: 3 };
      expect(determineMasteryLevel(schedule)).toBe('retention');
    });

    it('should return retention for 6 repetitions', () => {
      const schedule: SM2Schedule = { interval: 30, easeFactor: 2.5, repetitions: 6 };
      expect(determineMasteryLevel(schedule)).toBe('retention');
    });

    it('should return mastery for 7+ repetitions', () => {
      const schedule: SM2Schedule = { interval: 60, easeFactor: 2.5, repetitions: 7 };
      expect(determineMasteryLevel(schedule)).toBe('mastery');
    });
  });

  describe('calculateDifficultyScore', () => {
    it('should return 0 for maximum ease factor (2.5)', () => {
      const score = calculateDifficultyScore(2.5);
      expect(score).toBe(0);
    });

    it('should return 100 for minimum ease factor (1.3)', () => {
      const score = calculateDifficultyScore(1.3);
      expect(score).toBe(100);
    });

    it('should return intermediate score for intermediate ease factor', () => {
      const score = calculateDifficultyScore(1.9);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(100);
    });

    it('should handle ease factor above 2.5', () => {
      const score = calculateDifficultyScore(3.0);
      expect(score).toBe(0); // Capped at 0
    });
  });

  describe('calculateStabilityScore', () => {
    it('should return 0 for zero interval and repetitions', () => {
      const score = calculateStabilityScore(0, 0);
      expect(score).toBe(0);
    });

    it('should increase with interval', () => {
      const score1 = calculateStabilityScore(10, 0);
      const score2 = calculateStabilityScore(100, 0);
      expect(score2).toBeGreaterThan(score1);
    });

    it('should increase with repetitions', () => {
      const score1 = calculateStabilityScore(0, 1);
      const score2 = calculateStabilityScore(0, 5);
      expect(score2).toBeGreaterThan(score1);
    });

    it('should combine interval and repetition scores', () => {
      const score = calculateStabilityScore(182, 5); // Half year, 5 reps
      expect(score).toBeGreaterThan(25); // Should have meaningful score
    });

    it('should cap at 100', () => {
      const score = calculateStabilityScore(1000, 20);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('SM-2 Algorithm Integration Tests', () => {
    it('should handle complete review lifecycle', () => {
      // Initial state
      let schedule = initializeSchedule();
      expect(schedule.repetitions).toBe(0);

      // First review (quality 5)
      schedule = calculateNextInterval(5, schedule.interval, schedule.easeFactor, schedule.repetitions);
      expect(schedule.interval).toBe(1);
      expect(schedule.repetitions).toBe(1);

      // Second review (quality 4)
      schedule = calculateNextInterval(4, schedule.interval, schedule.easeFactor, schedule.repetitions);
      expect(schedule.interval).toBe(6);
      expect(schedule.repetitions).toBe(2);

      // Third review (quality 5)
      schedule = calculateNextInterval(5, schedule.interval, schedule.easeFactor, schedule.repetitions);
      expect(schedule.interval).toBeGreaterThan(6);
      expect(schedule.repetitions).toBe(3);

      // Failed review (quality 2)
      schedule = calculateNextInterval(2, schedule.interval, schedule.easeFactor, schedule.repetitions);
      expect(schedule.interval).toBe(1);
      expect(schedule.repetitions).toBe(0);
    });

    it('should maintain mathematical consistency across multiple reviews', () => {
      let schedule = initializeSchedule();
      const qualities = [5, 4, 5, 3, 5, 4, 5];

      qualities.forEach((quality) => {
        schedule = calculateNextInterval(quality, schedule.interval, schedule.easeFactor, schedule.repetitions);
        expect(schedule.interval).toBeGreaterThanOrEqual(0);
        expect(schedule.easeFactor).toBeGreaterThanOrEqual(1.3);
        expect(schedule.repetitions).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
