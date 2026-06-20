import { db } from '@/db';
import { learningPaths, learningPrograms } from '@/db/schema';
import { eq, and, desc, like } from 'drizzle-orm';
import type { LearningPath, NewLearningPath, LearningPathFull } from '@/types/learning-paths';

/**
 * Get all learning paths
 */
export async function getAllPaths(options?: {
  programId?: string;
  status?: 'draft' | 'active' | 'archived';
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  active?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<LearningPath[]> {
  const { programId, difficultyLevel, active, limit = 50, offset = 0, search } = options || {};

  const conditions = [];

  if (programId) {
    conditions.push(eq(learningPaths.programId, programId));
  }

  if (difficultyLevel) {
    conditions.push(eq(learningPaths.difficultyLevel, difficultyLevel));
  }

  if (active !== undefined) {
    conditions.push(eq(learningPaths.active, active));
  }

  if (search) {
    conditions.push(
      like(learningPaths.name, `%${search}%`)
    );
  }

  const query = db
    .select()
    .from(learningPaths)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(learningPaths.createdAt))
    .limit(limit)
    .offset(offset);

  return query;
}

/**
 * Get a learning path by ID with full hierarchy
 */
export async function getPathById(id: string): Promise<LearningPathFull | null> {
  const path = await db
    .select()
    .from(learningPaths)
    .where(eq(learningPaths.id, id))
    .limit(1);

  if (!path[0]) return null;

  const program = await db
    .select()
    .from(learningPrograms)
    .where(eq(learningPrograms.id, path[0].programId))
    .limit(1);

  return {
    ...path[0],
    program: program[0],
    modules: [],
  };
}

/**
 * Get a learning path by slug
 */
export async function getPathBySlug(slug: string): Promise<LearningPath | null> {
  const results = await db
    .select()
    .from(learningPaths)
    .where(eq(learningPaths.slug, slug))
    .limit(1);

  return results[0] || null;
}

/**
 * Get learning paths by program ID
 */
export async function getPathsByProgramId(programId: string): Promise<LearningPath[]> {
  return getAllPaths({ programId });
}

/**
 * Create a new learning path
 */
export async function createPath(data: NewLearningPath): Promise<LearningPath> {
  const results = await db
    .insert(learningPaths)
    .values(data)
    .returning();

  return results[0];
}

/**
 * Update a learning path
 */
export async function updatePath(
  id: string,
  data: Partial<NewLearningPath>
): Promise<LearningPath | null> {
  const results = await db
    .update(learningPaths)
    .set(data)
    .where(eq(learningPaths.id, id))
    .returning();

  return results[0] || null;
}

/**
 * Delete a learning path
 */
export async function deletePath(id: string): Promise<boolean> {
  const results = await db
    .delete(learningPaths)
    .where(eq(learningPaths.id, id))
    .returning();

  return results.length > 0;
}

/**
 * Activate a learning path
 */
export async function activatePath(id: string): Promise<LearningPath | null> {
  return updatePath(id, { active: true });
}

/**
 * Deactivate a learning path
 */
export async function deactivatePath(id: string): Promise<LearningPath | null> {
  return updatePath(id, { active: false });
}
