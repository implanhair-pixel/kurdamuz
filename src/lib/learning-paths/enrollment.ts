import { db } from '@/db';
import { userLearningProgress, learningAuditLogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import type { NewUserLearningProgress, NewLearningAuditLog } from '@/types/learning-paths';

/**
 * Enroll a user in a learning path
 * This creates an initial progress record for the path
 */
export async function enrollUserInPath(
  userId: string,
  pathId: string,
  actorId?: string
): Promise<void> {
  // Check if user is already enrolled
  const existing = await db
    .select()
    .from(userLearningProgress)
    .where(
      and(
        eq(userLearningProgress.userId, userId),
        eq(userLearningProgress.pathId, pathId),
        // Check for path-level enrollment (no module or lesson specified)
        // This is a simplified check - in production you might want a separate enrollments table
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return; // Already enrolled
  }

  // Create initial progress record
  await db.insert(userLearningProgress).values({
    userId,
    pathId,
    progressPercentage: 0,
    completionStatus: 'not_started',
    timeSpent: 0,
  });

  // Log the enrollment action if actorId is provided
  if (actorId) {
    await logAuditEvent({
      actorId,
      actionType: 'enrolled',
      targetType: 'path',
      targetId: pathId,
      oldValue: null,
      newValue: { userId, pathId, enrolledAt: new Date() },
    });
  }
}

/**
 * Unenroll a user from a learning path
 * This removes all progress records for the path
 */
export async function unenrollUserFromPath(
  userId: string,
  pathId: string,
  actorId?: string
): Promise<void> {
  // Get existing progress before deletion for audit log
  const existing = await db
    .select()
    .from(userLearningProgress)
    .where(
      and(
        eq(userLearningProgress.userId, userId),
        eq(userLearningProgress.pathId, pathId)
      )
    );

  // Delete all progress records for this path
  await db
    .delete(userLearningProgress)
    .where(
      and(
        eq(userLearningProgress.userId, userId),
        eq(userLearningProgress.pathId, pathId)
      )
    );

  // Log the unenrollment action if actorId is provided
  if (actorId) {
    await logAuditEvent({
      actorId,
      actionType: 'deleted', // Using 'deleted' as action type for unenrollment
      targetType: 'progress',
      targetId: pathId,
      oldValue: { userId, pathId, progressRecords: existing },
      newValue: null,
    });
  }
}

/**
 * Check if a user is enrolled in a path
 */
export async function isUserEnrolledInPath(userId: string, pathId: string): Promise<boolean> {
  const results = await db
    .select()
    .from(userLearningProgress)
    .where(
      and(
        eq(userLearningProgress.userId, userId),
        eq(userLearningProgress.pathId, pathId)
      )
    )
    .limit(1);

  return results.length > 0;
}

/**
 * Get all paths a user is enrolled in
 */
export async function getUserEnrolledPaths(userId: string): Promise<string[]> {
  const results = await db
    .select({ pathId: userLearningProgress.pathId })
    .from(userLearningProgress)
    .where(eq(userLearningProgress.userId, userId))
    .groupBy(userLearningProgress.pathId);

  return results.map(r => r.pathId);
}

/**
 * Get enrollment count for a path
 */
export async function getPathEnrollmentCount(pathId: string): Promise<number> {
  const results = await db
    .select({ userId: userLearningProgress.userId })
    .from(userLearningProgress)
    .where(eq(userLearningProgress.pathId, pathId))
    .groupBy(userLearningProgress.userId);

  return results.length;
}

/**
 * Log an audit event for learning paths operations
 */
async function logAuditEvent(data: NewLearningAuditLog): Promise<void> {
  await db.insert(learningAuditLogs).values({
    actorId: data.actorId,
    actionType: data.actionType,
    targetType: data.targetType,
    targetId: data.targetId,
    oldValue: data.oldValue,
    newValue: data.newValue,
  });
}
