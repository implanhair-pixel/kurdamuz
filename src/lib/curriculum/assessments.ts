import { db } from '@/db';
import { learningAssessments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { LearningAssessment, NewLearningAssessment } from '@/types/learning-paths';

/**
 * Get all assessments for a specific lesson
 */
export async function getAssessmentsByLessonId(lessonId: string): Promise<LearningAssessment[]> {
  return db
    .select()
    .from(learningAssessments)
    .where(eq(learningAssessments.lessonId, lessonId));
}

/**
 * Get an assessment by ID
 */
export async function getAssessmentById(id: string): Promise<LearningAssessment | null> {
  const results = await db
    .select()
    .from(learningAssessments)
    .where(eq(learningAssessments.id, id))
    .limit(1);

  return results[0] || null;
}

/**
 * Create a new assessment
 */
export async function createAssessment(data: NewLearningAssessment): Promise<LearningAssessment> {
  const results = await db
    .insert(learningAssessments)
    .values(data)
    .returning();

  return results[0];
}

/**
 * Update an assessment
 */
export async function updateAssessment(
  id: string,
  data: Partial<NewLearningAssessment>
): Promise<LearningAssessment | null> {
  const results = await db
    .update(learningAssessments)
    .set(data)
    .where(eq(learningAssessments.id, id))
    .returning();

  return results[0] || null;
}

/**
 * Delete an assessment
 */
export async function deleteAssessment(id: string): Promise<boolean> {
  const results = await db
    .delete(learningAssessments)
    .where(eq(learningAssessments.id, id))
    .returning();

  return results.length > 0;
}

/**
 * Get assessment count for a lesson
 */
export async function getAssessmentCountByLessonId(lessonId: string): Promise<number> {
  const results = await db
    .select()
    .from(learningAssessments)
    .where(eq(learningAssessments.lessonId, lessonId));

  return results.length;
}
