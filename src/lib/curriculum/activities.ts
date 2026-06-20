import { db } from '@/db';
import { learningActivities } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import type { LearningActivity, NewLearningActivity } from '@/types/learning-paths';

/**
 * Get all activities for a specific lesson
 */
export async function getActivitiesByLessonId(lessonId: string): Promise<LearningActivity[]> {
  return db
    .select()
    .from(learningActivities)
    .where(eq(learningActivities.lessonId, lessonId))
    .orderBy(asc(learningActivities.sequenceOrder));
}

/**
 * Get an activity by ID
 */
export async function getActivityById(id: string): Promise<LearningActivity | null> {
  const results = await db
    .select()
    .from(learningActivities)
    .where(eq(learningActivities.id, id))
    .limit(1);

  return results[0] || null;
}

/**
 * Create a new activity
 */
export async function createActivity(data: NewLearningActivity): Promise<LearningActivity> {
  const results = await db
    .insert(learningActivities)
    .values(data)
    .returning();

  return results[0];
}

/**
 * Update an activity
 */
export async function updateActivity(
  id: string,
  data: Partial<NewLearningActivity>
): Promise<LearningActivity | null> {
  const results = await db
    .update(learningActivities)
    .set(data)
    .where(eq(learningActivities.id, id))
    .returning();

  return results[0] || null;
}

/**
 * Delete an activity
 */
export async function deleteActivity(id: string): Promise<boolean> {
  const results = await db
    .delete(learningActivities)
    .where(eq(learningActivities.id, id))
    .returning();

  return results.length > 0;
}

/**
 * Reorder activities within a lesson
 */
export async function reorderActivities(lessonId: string, activityIds: string[]): Promise<void> {
  for (let i = 0; i < activityIds.length; i++) {
    await updateActivity(activityIds[i], { sequenceOrder: i });
  }
}

/**
 * Get activity count for a lesson
 */
export async function getActivityCountByLessonId(lessonId: string): Promise<number> {
  const results = await db
    .select()
    .from(learningActivities)
    .where(eq(learningActivities.lessonId, lessonId));

  return results.length;
}
