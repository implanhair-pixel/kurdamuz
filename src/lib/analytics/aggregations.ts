import { db } from '@/db';
import { userLearningProgress, learningPaths } from '@/db/schema';
import { eq, and, desc, count, avg, sum } from 'drizzle-orm';

/**
 * Get aggregate statistics for learning paths
 */
export async function getPathAggregateStatistics(pathId: string): Promise<{
  totalEnrollments: number;
  activeLearners: number;
  completedLearners: number;
  averageProgress: number;
  averageTimeSpent: number;
}> {
  const progressRecords = await db
    .select()
    .from(userLearningProgress)
    .where(eq(userLearningProgress.pathId, pathId));

  const totalEnrollments = progressRecords.length;
  const activeLearners = progressRecords.filter(p => p.completionStatus === 'in_progress').length;
  const completedLearners = progressRecords.filter(p => p.completionStatus === 'completed').length;

  const totalProgress = progressRecords.reduce((sum, p) => sum + (p.progressPercentage || 0), 0);
  const averageProgress = totalEnrollments > 0 ? totalProgress / totalEnrollments : 0;

  const totalTimeSpent = progressRecords.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
  const averageTimeSpent = totalEnrollments > 0 ? totalTimeSpent / totalEnrollments : 0;

  return {
    totalEnrollments,
    activeLearners,
    completedLearners,
    averageProgress,
    averageTimeSpent,
  };
}

/**
 * Get aggregate statistics for all paths
 */
export async function getAllPathsAggregateStatistics(): Promise<
  Record<string, {
    totalEnrollments: number;
    activeLearners: number;
    completedLearners: number;
    averageProgress: number;
    averageTimeSpent: number;
  }>
> {
  const paths = await db.select().from(learningPaths);
  const statistics: Record<string, any> = {};

  for (const path of paths) {
    statistics[path.id] = await getPathAggregateStatistics(path.id);
  }

  return statistics;
}

/**
 * Get daily active learners count
 */
export async function getDailyActiveLearners(date: Date = new Date()): Promise<number> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Count users who had activity on this date
  const activeLearners = await db
    .select({ userId: userLearningProgress.userId })
    .from(userLearningProgress)
    .where(
      and(
        // This would need a lastAccessedAt filter - simplified for now
        eq(userLearningProgress.completionStatus, 'in_progress')
      )
    )
    .groupBy(userLearningProgress.userId);

  return activeLearners.length;
}

/**
 * Get weekly active learners count
 */
export async function getWeeklyActiveLearners(): Promise<number> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Placeholder - would need proper activity tracking
  return 0;
}

/**
 * Get monthly active learners count
 */
export async function getMonthlyActiveLearners(): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Placeholder - would need proper activity tracking
  return 0;
}

/**
 * Get completion rate by time period
 */
export async function getCompletionRateByPeriod(
  startDate: Date,
  endDate: Date
): Promise<number> {
  const progressRecords = await db
    .select()
    .from(userLearningProgress)
    .where(
      and(
        // This would need createdAt filtering - simplified for now
        eq(userLearningProgress.completionStatus, 'completed')
      )
    );

  const completedRecords = progressRecords.filter(p => p.completionStatus === 'completed');
  const totalRecords = progressRecords.length;

  return totalRecords > 0 ? (completedRecords.length / totalRecords) * 100 : 0;
}

/**
 * Get average time to complete a path
 */
export async function getAverageTimeToComplete(pathId: string): Promise<number> {
  const completedRecords = await db
    .select()
    .from(userLearningProgress)
    .where(
      and(
        eq(userLearningProgress.pathId, pathId),
        eq(userLearningProgress.completionStatus, 'completed')
      )
    );

  if (completedRecords.length === 0) return 0;

  const totalTime = completedRecords.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
  return totalTime / completedRecords.length;
}

/**
 * Get learner retention rate
 */
export async function getLearnerRetentionRate(days: number = 30): Promise<number> {
  // Placeholder - would need proper retention tracking
  return 0;
}
