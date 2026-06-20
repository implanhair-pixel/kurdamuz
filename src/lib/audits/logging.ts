import { db } from '@/db';
import { learningAuditLogs } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import type { NewLearningAuditLog } from '@/types/learning-paths';

/**
 * Log an audit event for learning paths operations
 */
export async function logAuditEvent(data: NewLearningAuditLog): Promise<void> {
  await db.insert(learningAuditLogs).values({
    actorId: data.actorId,
    actionType: data.actionType,
    targetType: data.targetType,
    targetId: data.targetId,
    oldValue: data.oldValue,
    newValue: data.newValue,
  });
}

/**
 * Get audit logs for a specific target
 */
export async function getAuditLogsForTarget(
  targetType: string,
  targetId: string,
  limit: number = 50
): Promise<any[]> {
  return db
    .select()
    .from(learningAuditLogs)
    .where(
      and(
        eq(learningAuditLogs.targetType, targetType),
        eq(learningAuditLogs.targetId, targetId)
      )
    )
    .orderBy(desc(learningAuditLogs.createdAt))
    .limit(limit);
}

/**
 * Get audit logs for a specific actor
 */
export async function getAuditLogsByActor(
  actorId: string,
  limit: number = 50
): Promise<any[]> {
  return db
    .select()
    .from(learningAuditLogs)
    .where(eq(learningAuditLogs.actorId, actorId))
    .orderBy(desc(learningAuditLogs.createdAt))
    .limit(limit);
}

/**
 * Get all audit logs with optional filters
 */
export async function getAllAuditLogs(options?: {
  actorId?: string;
  targetType?: string;
  actionType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  const { actorId, targetType, actionType, startDate, endDate, limit = 50, offset = 0 } = options || {};

  const conditions = [];

  if (actorId) {
    conditions.push(eq(learningAuditLogs.actorId, actorId));
  }

  if (targetType) {
    conditions.push(eq(learningAuditLogs.targetType, targetType));
  }

  if (actionType) {
    conditions.push(eq(learningAuditLogs.actionType, actionType));
  }

  // Date filtering would need additional SQL date functions
  // Placeholder for now

  return db
    .select()
    .from(learningAuditLogs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(learningAuditLogs.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Log program creation
 */
export async function logProgramCreation(
  actorId: string,
  programId: string,
  programData: any
): Promise<void> {
  await logAuditEvent({
    actorId,
    actionType: 'created',
    targetType: 'program',
    targetId: programId,
    oldValue: null,
    newValue: programData,
  });
}

/**
 * Log program update
 */
export async function logProgramUpdate(
  actorId: string,
  programId: string,
  oldValue: any,
  newValue: any
): Promise<void> {
  await logAuditEvent({
    actorId,
    actionType: 'updated',
    targetType: 'program',
    targetId: programId,
    oldValue,
    newValue,
  });
}

/**
 * Log program deletion
 */
export async function logProgramDeletion(
  actorId: string,
  programId: string,
  programData: any
): Promise<void> {
  await logAuditEvent({
    actorId,
    actionType: 'deleted',
    targetType: 'program',
    targetId: programId,
    oldValue: programData,
    newValue: null,
  });
}

/**
 * Log path creation
 */
export async function logPathCreation(
  actorId: string,
  pathId: string,
  pathData: any
): Promise<void> {
  await logAuditEvent({
    actorId,
    actionType: 'created',
    targetType: 'path',
    targetId: pathId,
    oldValue: null,
    newValue: pathData,
  });
}

/**
 * Log path update
 */
export async function logPathUpdate(
  actorId: string,
  pathId: string,
  oldValue: any,
  newValue: any
): Promise<void> {
  await logAuditEvent({
    actorId,
    actionType: 'updated',
    targetType: 'path',
    targetId: pathId,
    oldValue,
    newValue,
  });
}

/**
 * Log path deletion
 */
export async function logPathDeletion(
  actorId: string,
  pathId: string,
  pathData: any
): Promise<void> {
  await logAuditEvent({
    actorId,
    actionType: 'deleted',
    targetType: 'path',
    targetId: pathId,
    oldValue: pathData,
    newValue: null,
  });
}

/**
 * Log module creation
 */
export async function logModuleCreation(
  actorId: string,
  moduleId: string,
  moduleData: any
): Promise<void> {
  await logAuditEvent({
    actorId,
    actionType: 'created',
    targetType: 'module',
    targetId: moduleId,
    oldValue: null,
    newValue: moduleData,
  });
}

/**
 * Log lesson creation
 */
export async function logLessonCreation(
  actorId: string,
  lessonId: string,
  lessonData: any
): Promise<void> {
  await logAuditEvent({
    actorId,
    actionType: 'created',
    targetType: 'lesson',
    targetId: lessonId,
    oldValue: null,
    newValue: lessonData,
  });
}

/**
 * Log certificate issuance
 */
export async function logCertificateIssuance(
  actorId: string,
  certificateId: string,
  certificateData: any
): Promise<void> {
  await logAuditEvent({
    actorId,
    actionType: 'certified',
    targetType: 'certificate',
    targetId: certificateId,
    oldValue: null,
    newValue: certificateData,
  });
}

/**
 * Log certificate revocation
 */
export async function logCertificateRevocation(
  actorId: string,
  certificateId: string,
  reason: string
): Promise<void> {
  await logAuditEvent({
    actorId,
    actionType: 'deleted',
    targetType: 'certificate',
    targetId: certificateId,
    oldValue: { status: 'issued' },
    newValue: { status: 'revoked', reason },
  });
}
