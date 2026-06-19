import { db } from '@/db';
import { learningLessons, learningUnits } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import type { LearningLesson, NewLearningLesson } from '@/types/learning-paths';

/**
 * Get all lessons for a specific unit
 */
export async function getLessonsByUnitId(unitId: string): Promise<LearningLesson[]> {
  return db
    .select()
    .from(learningLessons)
    .where(eq(learningLessons.unitId, unitId))
    .orderBy(asc(learningLessons.sequenceOrder));
}

/**
 * Get a lesson by ID
 */
export async function getLessonById(id: string): Promise<LearningLesson | null> {
  const results = await db
    .select()
    .from(learningLessons)
    .where(eq(learningLessons.id, id))
    .limit(1);

  return results[0] || null;
}

/**
 * Create a new lesson
 */
export async function createLesson(data: NewLearningLesson): Promise<LearningLesson> {
  const results = await db
    .insert(learningLessons)
    .values(data)
    .returning();

  return results[0];
}

/**
 * Update a lesson
 */
export async function updateLesson(
  id: string,
  data: Partial<NewLearningLesson>
): Promise<LearningLesson | null> {
  const results = await db
    .update(learningLessons)
    .set(data)
    .where(eq(learningLessons.id, id))
    .returning();

  return results[0] || null;
}

/**
 * Delete a lesson
 */
export async function deleteLesson(id: string): Promise<boolean> {
  const results = await db
    .delete(learningLessons)
    .where(eq(learningLessons.id, id))
    .returning();

  return results.length > 0;
}

/**
 * Reorder lessons within a unit
 */
export async function reorderLessons(unitId: string, lessonIds: string[]): Promise<void> {
  for (let i = 0; i < lessonIds.length; i++) {
    await updateLesson(lessonIds[i], { sequenceOrder: i });
  }
}

/**
 * Get lesson count for a unit
 */
export async function getLessonCountByUnitId(unitId: string): Promise<number> {
  const results = await db
    .select()
    .from(learningLessons)
    .where(eq(learningLessons.unitId, unitId));

  return results.length;
}

/**
 * Get total estimated duration for a unit (sum of all lesson durations)
 */
export async function getUnitTotalDuration(unitId: string): Promise<number> {
  const lessons = await getLessonsByUnitId(unitId);
  return lessons.reduce((total, lesson) => total + (lesson.estimatedDuration || 0), 0);
}
