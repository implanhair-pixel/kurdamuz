import { recordActivity } from './streaks';
import { evaluateAchievements } from './achievements';
import type { ActivityType, StreakActivityEvent } from '@/types/streak';
import type { AchievementEvaluationContext } from '@/types/achievement';

/**
 * Track a learning activity and update streaks/achievements
 */
export async function trackActivity(
  userId: string,
  activityType: ActivityType,
  eventData: Record<string, any> = {}
): Promise<void> {
  // Update streak
  await recordActivity(userId, activityType);

  // Evaluate achievements
  const context: AchievementEvaluationContext = {
    userId,
    eventType: activityType,
    eventData,
    timestamp: new Date(),
  };

  await evaluateAchievements(context);
}

/**
 * Track lesson completion
 */
export async function trackLessonCompletion(
  userId: string,
  lessonId: string,
  score?: number
): Promise<void> {
  await trackActivity(userId, 'lesson', {
    lessonId,
    score,
    completedAt: new Date().toISOString(),
  });
}

/**
 * Track quiz completion
 */
export async function trackQuizCompletion(
  userId: string,
  quizId: string,
  score: number,
  passed: boolean
): Promise<void> {
  await trackActivity(userId, 'quiz', {
    quizId,
    score,
    passed,
    completedAt: new Date().toISOString(),
  });
}

/**
 * Track vocabulary review
 */
export async function trackVocabularyReview(
  userId: string,
  wordsReviewed: number,
  accuracy: number
): Promise<void> {
  await trackActivity(userId, 'vocabulary', {
    wordsReviewed,
    accuracy,
    completedAt: new Date().toISOString(),
  });
}

/**
 * Track story reading
 */
export async function trackStoryReading(
  userId: string,
  storyId: string,
  progressPercentage: number
): Promise<void> {
  await trackActivity(userId, 'story', {
    storyId,
    progressPercentage,
    completedAt: new Date().toISOString(),
  });
}

/**
 * Track practice session
 */
export async function trackPracticeSession(
  userId: string,
  practiceType: string,
  duration: number
): Promise<void> {
  await trackActivity(userId, 'practice', {
    practiceType,
    duration,
    completedAt: new Date().toISOString(),
  });
}

/**
 * Batch track multiple activities
 */
export async function batchTrackActivities(
  activities: Array<{
    userId: string;
    activityType: ActivityType;
    eventData: Record<string, any>;
  }>
): Promise<void> {
  for (const activity of activities) {
    await trackActivity(activity.userId, activity.activityType, activity.eventData);
  }
}

/**
 * Get activity statistics for a user
 */
export async function getActivityStatistics(userId: string) {
  // This would query activity logs or aggregate from existing data
  // For now, return a placeholder
  return {
    totalActivities: 0,
    activitiesByType: {} as Record<ActivityType, number>,
    lastActivityDate: null,
    streakDays: 0,
  };
}

/**
 * Check if user has qualifying activity today
 */
export async function hasQualifyingActivityToday(userId: string): Promise<boolean> {
  const { hasActivityToday } = await import('./streaks');
  return await hasActivityToday(userId);
}

/**
 * Get recent activities for a user
 */
export async function getRecentActivities(
  userId: string,
  limit: number = 10
): Promise<StreakActivityEvent[]> {
  // This would query activity logs
  // For now, return empty array
  return [];
}

/**
 * Create activity event for tracking
 */
export function createActivityEvent(
  userId: string,
  activityType: ActivityType,
  eventData: Record<string, any>
): StreakActivityEvent {
  return {
    userId,
    activityType,
    activityDate: new Date(),
    timestamp: new Date(),
    ...eventData,
  };
}
