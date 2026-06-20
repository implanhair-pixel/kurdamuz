import { db } from '@/db';
import { learningModules, learningPaths } from '@/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import type { LearningModule, NewLearningModule } from '@/types/learning-paths';

/**
 * Get all modules for a specific path
 */
export async function getModulesByPathId(pathId: string): Promise<LearningModule[]> {
  return db
    .select()
    .from(learningModules)
    .where(eq(learningModules.pathId, pathId))
    .orderBy(asc(learningModules.sequenceOrder));
}

/**
 * Get a module by ID
 */
export async function getModuleById(id: string): Promise<LearningModule | null> {
  const results = await db
    .select()
    .from(learningModules)
    .where(eq(learningModules.id, id))
    .limit(1);

  return results[0] || null;
}

/**
 * Create a new module
 */
export async function createModule(data: NewLearningModule): Promise<LearningModule> {
  const results = await db
    .insert(learningModules)
    .values(data)
    .returning();

  return results[0];
}

/**
 * Update a module
 */
export async function updateModule(
  id: string,
  data: Partial<NewLearningModule>
): Promise<LearningModule | null> {
  const results = await db
    .update(learningModules)
    .set(data)
    .where(eq(learningModules.id, id))
    .returning();

  return results[0] || null;
}

/**
 * Delete a module
 */
export async function deleteModule(id: string): Promise<boolean> {
  const results = await db
    .delete(learningModules)
    .where(eq(learningModules.id, id))
    .returning();

  return results.length > 0;
}

/**
 * Reorder modules within a path
 */
export async function reorderModules(pathId: string, moduleIds: string[]): Promise<void> {
  for (let i = 0; i < moduleIds.length; i++) {
    await updateModule(moduleIds[i], { sequenceOrder: i });
  }
}

/**
 * Get module count for a path
 */
export async function getModuleCountByPathId(pathId: string): Promise<number> {
  const results = await db
    .select()
    .from(learningModules)
    .where(eq(learningModules.pathId, pathId));

  return results.length;
}

/**
 * Get total estimated duration for a path (sum of all module durations)
 */
export async function getPathTotalDuration(pathId: string): Promise<number> {
  const modules = await getModulesByPathId(pathId);
  return modules.reduce((total, module) => total + (module.estimatedDuration || 0), 0);
}
