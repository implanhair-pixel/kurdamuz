import { db } from '@/db';
import { stories, storyCompletions, storyProgress, storyFavorites, storyRecommendations } from '@/db/schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';

// Generate personalized recommendations based on user's reading history
export async function generatePersonalizedRecommendations(userId: string) {
  try {
    // Get user's completed stories
    const completedStories = await db
      .select()
      .from(storyCompletions)
      .where(eq(storyCompletions.userId, userId));

    // Get user's favorite stories
    const favoriteStories = await db
      .select()
      .from(storyFavorites)
      .where(eq(storyFavorites.userId, userId));

    // Get user's in-progress stories
    const inProgressStories = await db
      .select()
      .from(storyProgress)
      .where(
        and(
          eq(storyProgress.userId, userId),
          sql`${storyProgress.completionPercentage} < 100`
        )
      );

    // Determine user's preferred difficulty level
    const allUserStories = [...completedStories, ...inProgressStories];
    const difficultyCounts = allUserStories.reduce((acc, story: any) => {
      acc[(story as any).difficultyLevel || 'beginner'] = (acc[story.difficultyLevel || 'beginner'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const preferredDifficulty = Object.entries(difficultyCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'beginner';

    // Get stories not yet read by user
    const readStoryIds = new Set([
      ...completedStories.map(s => s.storyId),
      ...inProgressStories.map(s => s.storyId),
    ]);

    const candidateStories = await db
      .select()
      .from(stories)
      .where(
        and(
          eq(stories.status, 'published'),
          sql`${stories.id} NOT IN ${Array.from(readStoryIds)}`
        )
      );

    // Score each candidate story
    const scoredStories = candidateStories.map(story => {
      let score = 0.5; // Base score

      // Difficulty match
      if (story.difficultyLevel === preferredDifficulty) {
        score += 0.3;
      }

      // Featured stories get a boost
      if (story.isFeatured) {
        score += 0.2;
      }

      return {
        storyId: story.id,
        recommendationScore: Math.min(score, 1.0),
        recommendationType: 'personalized',
      };
    });

    // Clear old recommendations
    await db
      .delete(storyRecommendations)
      .where(eq(storyRecommendations.userId, userId));

    // Insert new recommendations
    if (scoredStories.length > 0) {
      await (db
        .insert(storyRecommendations) as any)
        .values(
          scoredStories.map(rec => ({
            userId,
            ...rec,
          }))
        );
    }

    return scoredStories;
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    return [];
  }
}

// Generate similar stories based on content (simplified)
export async function generateSimilarStories(storyId: string) {
  try {
    const targetStory = await db
      .select()
      .from(stories)
      .where(eq(stories.id, storyId))
      .limit(1);

    if (!targetStory.length) {
      return [];
    }

    const story = targetStory[0];

    // Find stories with similar difficulty and categories
    const similarStories = await db
      .select()
      .from(stories)
      .where(
        and(
          eq(stories.status, 'published'),
          sql`${stories.id} != ${storyId}`,
          eq(stories.difficultyLevel, story.difficultyLevel)
        )
      )
      .orderBy(desc(stories.publishedAt))
      .limit(10);

    return similarStories.map(s => ({
      ...s,
      recommendationScore: 0.7,
      recommendationType: 'similar',
    }));
  } catch (error) {
    console.error('Error generating similar stories:', error);
    return [];
  }
}

// Get stories user should continue reading
export async function getContinueReading(userId: string) {
  try {
    const inProgressStories = await db
      .select({
        id: stories.id,
        title: stories.title,
        slug: stories.slug,
        summary: stories.summary,
        coverImageUrl: stories.coverImageUrl,
        difficultyLevel: stories.difficultyLevel,
        completionPercentage: storyProgress.completionPercentage,
        lastReadAt: storyProgress.lastReadAt,
      })
      .from(storyProgress)
      .innerJoin(stories, eq(storyProgress.storyId, stories.id))
      .where(
        and(
          eq(storyProgress.userId, userId),
          sql`${storyProgress.completionPercentage} < 100`
        )
      )
      .orderBy(desc(storyProgress.lastReadAt))
      .limit(5);

    return inProgressStories;
  } catch (error) {
    console.error('Error getting continue reading:', error);
    return [];
  }
}

// Get trending stories across the platform
export async function getTrendingStories() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendingStories = await db
      .select({
        id: stories.id,
        title: stories.title,
        slug: stories.slug,
        summary: stories.summary,
        coverImageUrl: stories.coverImageUrl,
        difficultyLevel: stories.difficultyLevel,
        completionCount: count(storyCompletions.id),
      })
      .from(stories)
      .leftJoin(
        storyCompletions,
        and(
          eq(stories.id, storyCompletions.storyId),
          sql`${storyCompletions.completedAt} >= ${thirtyDaysAgo}`
        )
      )
      .where(eq(stories.status, 'published'))
      .groupBy(stories.id)
      .orderBy(desc(count(storyCompletions.id)))
      .limit(10);

    return trendingStories;
  } catch (error) {
    console.error('Error getting trending stories:', error);
    return [];
  }
}

// Get learning path recommendations based on user's proficiency
export async function getLearningPathRecommendations(userId: string) {
  try {
    // Get user's completion history to determine proficiency
    const completedStories = await db
      .select()
      .from(storyCompletions)
      .where(eq(storyCompletions.userId, userId));

    const totalCompletions = completedStories.length;
    let targetDifficulty = 'beginner';

    if (totalCompletions > 20) {
      targetDifficulty = 'advanced';
    } else if (totalCompletions > 10) {
      targetDifficulty = 'intermediate';
    }

    // Get stories at target difficulty that user hasn't completed
    const readStoryIds = new Set(completedStories.map(s => s.storyId));

    const recommendedStories = await db
      .select()
      .from(stories)
      .where(
        and(
          eq(stories.status, 'published'),
          eq(stories.difficultyLevel, targetDifficulty),
          sql`${stories.id} NOT IN ${Array.from(readStoryIds)}`
        )
      )
      .orderBy(desc(stories.publishedAt))
      .limit(10);

    return recommendedStories.map(s => ({
      ...s,
      recommendationScore: 0.8,
      recommendationType: 'learning_path',
    }));
  } catch (error) {
    console.error('Error getting learning path recommendations:', error);
    return [];
  }
}
