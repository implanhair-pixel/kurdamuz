import { db } from '@/db';
import { learningPrograms } from '@/db/schema';
import { eq, and, desc, like } from 'drizzle-orm';
import type { LearningProgram, NewLearningProgram } from '@/types/learning-paths';

/**
 * Get all learning programs
 */
export async function getAllPrograms(options?: {
  status?: 'draft' | 'active' | 'archived';
  programType?: 'beginner' | 'intermediate' | 'advanced' | 'specialized';
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<LearningProgram[]> {
  const { status, programType, limit = 50, offset = 0, search } = options || {};

  const conditions = [];

  if (status) {
    conditions.push(eq(learningPrograms.status, status));
  }

  if (programType) {
    conditions.push(eq(learningPrograms.programType, programType));
  }

  if (search) {
    conditions.push(
      like(learningPrograms.name, `%${search}%`)
    );
  }

  const query = db
    .select()
    .from(learningPrograms)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(learningPrograms.createdAt))
    .limit(limit)
    .offset(offset);

  return query;
}

/**
 * Get a learning program by ID
 */
export async function getProgramById(id: string): Promise<LearningProgram | null> {
  const results = await db
    .select()
    .from(learningPrograms)
    .where(eq(learningPrograms.id, id))
    .limit(1);

  return results[0] || null;
}

/**
 * Get a learning program by slug
 */
export async function getProgramBySlug(slug: string): Promise<LearningProgram | null> {
  const results = await db
    .select()
    .from(learningPrograms)
    .where(eq(learningPrograms.slug, slug))
    .limit(1);

  return results[0] || null;
}

/**
 * Create a new learning program
 */
export async function createProgram(data: NewLearningProgram): Promise<LearningProgram> {
  const results = await db
    .insert(learningPrograms)
    .values({
      ...data,
      updatedAt: new Date(),
    })
    .returning();

  return results[0];
}

/**
 * Update a learning program
 */
export async function updateProgram(
  id: string,
  data: Partial<NewLearningProgram>
): Promise<LearningProgram | null> {
  const results = await db
    .update(learningPrograms)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(learningPrograms.id, id))
    .returning();

  return results[0] || null;
}

/**
 * Delete a learning program
 */
export async function deleteProgram(id: string): Promise<boolean> {
  const results = await db
    .delete(learningPrograms)
    .where(eq(learningPrograms.id, id))
    .returning();

  return results.length > 0;
}

/**
 * Activate a learning program
 */
export async function activateProgram(id: string): Promise<LearningProgram | null> {
  return updateProgram(id, { status: 'active' });
}

/**
 * Archive a learning program
 */
export async function archiveProgram(id: string): Promise<LearningProgram | null> {
  return updateProgram(id, { status: 'archived' });
}
