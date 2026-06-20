import { db } from '@/db';
import { userLearningProgress, learningPaths, learningModules, learningLessons } from '@/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import type { UserLearningProgress, NewUserLearningProgress, ProgressMetrics, ModuleProgress, LessonProgress } from '@/types/learning-paths';

/**
 * Get user progress for a specific path
 */
export async function getUserPathProgress(userId: string, pathId: string): Promise<UserLearningProgress[]> {
  return db
    .select()
    .from(userLearningProgress)
    .where(
      and(
        eq(userLearningProgress.userId, userId),
        eq(userLearningProgress.pathId, pathId)
      )
    )
    .orderBy(desc(userLearningProgress.updatedAt));
}

/**
 * Get user progress for a specific module
 */
export async function getUserModuleProgress(userId: string, moduleId: string): Promise<UserLearningProgress[]> {
  return db
    .select()
    .from(userLearningProgress)
    .where(
      and(
        eq(userLearningProgress.userId, userId),
        eq(userLearningProgress.moduleId, moduleId)
      )
    )
    .orderBy(desc(userLearningProgress.updatedAt));
}

/**
 * Get user progress for a specific lesson
 */
export async function getUserLessonProgress(userId: string, lessonId: string): Promise<UserLearningProgress | null> {
  const results = await db
    .select()
    .from(userLearningProgress)
    .where(
      and(
        eq(userLearningProgress.userId, userId),
        eq(userLearningProgress.lessonId, lessonId)
      )
    )
    .limit(1);

  return results[0] || null;
}

/**
 * Get all user progress across all paths
 */
export async function getAllUserProgress(userId: string): Promise<UserLearningProgress[]> {
  return db
    .select()
    .from(userLearningProgress)
    .where(eq(userLearningProgress.userId, userId))
    .orderBy(desc(userLearningProgress.updatedAt));
}

/**
 * Create or update user progress
 */
export async function updateProgress(data: NewUserLearningProgress): Promise<UserLearningProgress> {
  const existing = await db
    .select()
    .from(userLearningProgress)
    .where(
      and(
        eq(userLearningProgress.userId, data.userId),
        eq(userLearningProgress.pathId, data.pathId),
        data.moduleId ? eq(userLearningProgress.moduleId, data.moduleId) : undefined,
        data.lessonId ? eq(userLearningProgress.lessonId, data.lessonId) : undefined
      )
    )
    .limit(1);

  if (existing[0]) {
    const results = await db
      .update(userLearningProgress)
      .set({
        ...data,
        updatedAt: new Date(),
        lastAccessedAt: new Date(),
      })
      .where(eq(userLearningProgress.id, existing[0].id))
      .returning();

    return results[0];
  }

  const results = await db
    .insert(userLearningProgress)
    .values({
      ...data,
      lastAccessedAt: new Date(),
    })
    .returning();

  return results[0];
}

/**
 * Mark a lesson as completed
 */
export async function completeLesson(
  userId: string,
  pathId: string,
  moduleId: string,
  lessonId: string,
  timeSpent: number
): Promise<UserLearningProgress> {
  return updateProgress({
    userId,
    pathId,
    moduleId,
    lessonId,
    progressPercentage: 100,
    completionStatus: 'completed',
    completedAt: new Date(),
    timeSpent,
  });
}

/**
 * Calculate overall progress metrics for a path
 */
export async function getPathProgressMetrics(userId: string, pathId: string): Promise<ProgressMetrics> {
  const progressRecords = await getUserPathProgress(userId, pathId);
  
  // Get all modules and lessons for the path
  const modules = await db
    .select()
    .from(learningModules)
    .where(eq(learningModules.pathId, pathId))
    .orderBy(asc(learningModules.sequenceOrder));

  let totalLessons = 0;
  let completedLessons = 0;
  let totalTimeSpent = 0;
  const moduleProgress: ModuleProgress[] = [];

  for (const module of modules) {
    const lessons = await db
      .select()
      .from(learningLessons)
      .where(eq(learningLessons.unitId, module.id))
      .orderBy(asc(learningLessons.sequenceOrder));

    const moduleLessonIds = lessons.map(l => l.id);
    const moduleProgressRecords = progressRecords.filter(
      p => p.moduleId === module.id && p.lessonId && moduleLessonIds.includes(p.lessonId)
    );

    const completedInModule = moduleProgressRecords.filter(p => p.completionStatus === 'completed').length;
    const timeInModule = moduleProgressRecords.reduce((sum, p) => sum + (p.timeSpent || 0), 0);

    totalLessons += lessons.length;
    completedLessons += completedInModule;
    totalTimeSpent += timeInModule;

    moduleProgress.push({
      moduleId: module.id,
      moduleName: module.title,
      progress: lessons.length > 0 ? (completedInModule / lessons.length) * 100 : 0,
      completedLessons: completedInModule,
      totalLessons: lessons.length,
      timeSpent: timeInModule,
    });
  }

  const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const lastAccessed = progressRecords.length > 0 
    ? new Date(Math.max(...progressRecords.map(p => new Date(p.lastAccessedAt || p.createdAt || new Date()).getTime())))
    : new Date();

  const completionStatus: 'not_started' | 'in_progress' | 'completed' = 
    overallProgress === 0 ? 'not_started' :
    overallProgress === 100 ? 'completed' : 'in_progress';

  return {
    overallProgress,
    moduleProgress,
    lessonProgress: [], // Can be populated if needed
    timeSpent: totalTimeSpent,
    lastAccessedAt: lastAccessed,
    completionStatus,
  };
}

/**
 * Get lesson progress details
 */
export async function getLessonProgressDetails(userId: string, lessonId: string): Promise<LessonProgress | null> {
  const progress = await getUserLessonProgress(userId, lessonId);
  
  if (!progress) {
    return {
      lessonId,
      lessonTitle: '',
      progress: 0,
      completionStatus: 'not_started',
      timeSpent: 0,
    };
  }

  const lesson = await db
    .select()
    .from(learningLessons)
    .where(eq(learningLessons.id, lessonId))
    .limit(1);

  return {
    lessonId,
    lessonTitle: lesson[0]?.title || '',
    progress: progress.progressPercentage ?? 0,
    completionStatus: progress.completionStatus as 'not_started' | 'in_progress' | 'completed',
    timeSpent: progress.timeSpent ?? 0,
    completedAt: progress.completedAt || undefined,
  };
}

/**
 * Delete user progress (for testing or admin purposes)
 */
export async function deleteUserProgress(userId: string, pathId?: string): Promise<boolean> {
  const conditions = [eq(userLearningProgress.userId, userId)];
  
  if (pathId) {
    conditions.push(eq(userLearningProgress.pathId, pathId));
  }

  const results = await db
    .delete(userLearningProgress)
    .where(and(...conditions))
    .returning();

  return results.length > 0;
}
