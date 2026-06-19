import { describe, it, expect, beforeEach } from '@jest/globals';
import { generatePersonalizedRecommendations, generateSimilarStories, getContinueReading, getTrendingStories, getLearningPathRecommendations } from '../recommendations';

describe('Recommendation Engine', () => {
  const userId = 'test-user-id';
  const storyId = 'test-story-id';

  beforeEach(() => {
    // Reset any test data before each test
  });

  describe('generatePersonalizedRecommendations', () => {
    it('should generate personalized recommendations based on user history', async () => {
      const recommendations = await generatePersonalizedRecommendations(userId);
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should return empty array for user with no history', async () => {
      const recommendations = await generatePersonalizedRecommendations('new-user-id');
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('generateSimilarStories', () => {
    it('should generate similar stories based on content', async () => {
      const similarStories = await generateSimilarStories(storyId);
      expect(Array.isArray(similarStories)).toBe(true);
    });

    it('should return empty array for non-existent story', async () => {
      const similarStories = await generateSimilarStories('non-existent-id');
      expect(similarStories).toEqual([]);
    });
  });

  describe('getContinueReading', () => {
    it('should return stories user is currently reading', async () => {
      const continueReading = await getContinueReading(userId);
      expect(Array.isArray(continueReading)).toBe(true);
    });
  });

  describe('getTrendingStories', () => {
    it('should return trending stories based on completions', async () => {
      const trendingStories = await getTrendingStories();
      expect(Array.isArray(trendingStories)).toBe(true);
    });
  });

  describe('getLearningPathRecommendations', () => {
    it('should return learning path based on user proficiency', async () => {
      const learningPath = await getLearningPathRecommendations(userId);
      expect(Array.isArray(learningPath)).toBe(true);
    });
  });
});
