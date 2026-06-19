import { db } from '../../db/index';
import { xpAuditLogs } from '../../db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import type { XPAuditLog, XPAuditLogInput, XPActionType } from '../../types/xp';

/**
 * Log an XP transaction to the audit log
 */
export async function logXPTransaction(
  actorId: string,
  actionType: XPActionType,
  details: Record<string, any>
): Promise<void> {
  await db.insert(xpAuditLogs).values({
    actorId,
    targetUserId: details.targetUserId || actorId,
    actionType,
    oldValue: details.oldValue || details.oldData,
    newValue: details.newValue || details.newData,
    reason: details.reason,
  });
}

/**
 * Log a level up event
 */
export async function logLevelUp(
  userId: string,
  oldLevel: number,
  newLevel: number,
  xpAtLevelUp: number
): Promise<void> {
  await db.insert(xpAuditLogs).values({
    actorId: userId,
    targetUserId: userId,
    actionType: 'level_up',
    oldValue: { level: oldLevel },
    newValue: { level: newLevel, xpAtLevelUp },
    reason: 'User leveled up',
  });
}

/**
 * Log a reward issuance
 */
export async function logRewardIssued(
  actorId: string,
  targetUserId: string,
  rewardId: string
): Promise<void> {
  await db.insert(xpAuditLogs).values({
    actorId,
    targetUserId,
    actionType: 'reward_issued',
    newValue: { rewardId },
    reason: 'Reward issued to user',
  });
}

/**
 * Log a reward claim
 */
export async function logRewardClaimed(
  userId: string,
  rewardId: string
): Promise<void> {
  await db.insert(xpAuditLogs).values({
    actorId: userId,
    targetUserId: userId,
    actionType: 'reward_claimed',
    newValue: { rewardId },
    reason: 'Reward claimed by user',
  });
}

/**
 * Log a policy modification
 */
export async function logPolicyModified(
  actorId: string,
  details: Record<string, any>
): Promise<void> {
  await db.insert(xpAuditLogs).values({
    actorId,
    targetUserId: actorId,
    actionType: 'policy_modified',
    oldValue: details.oldData,
    newValue: details.newData,
    reason: details.reason || 'Policy modified',
  });
}

/**
 * Get XP audit logs with optional filters
 */
export async function getXPAuditLogs(filters?: {
  actorId?: string;
  targetUserId?: string;
  actionType?: XPActionType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<XPAuditLog[]> {
  const conditions = [];

  if (filters?.actorId) {
    conditions.push(eq(xpAuditLogs.actorId, filters.actorId));
  }

  if (filters?.targetUserId) {
    conditions.push(eq(xpAuditLogs.targetUserId, filters.targetUserId));
  }

  if (filters?.actionType) {
    conditions.push(eq(xpAuditLogs.actionType, filters.actionType));
  }

  if (filters?.startDate) {
    conditions.push(gte(xpAuditLogs.createdAt, filters.startDate));
  }

  if (filters?.endDate) {
    conditions.push(lte(xpAuditLogs.createdAt, filters.endDate));
  }

  const query = db
    .select()
    .from(xpAuditLogs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(xpAuditLogs.createdAt));

  if (filters?.limit) {
    query.limit(filters.limit);
  }

  if (filters?.offset) {
    query.offset(filters.offset);
  }

  return await query;
}

/**
 * Get audit logs for a specific user (both as actor and target)
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50
): Promise<XPAuditLog[]> {
  return await db
    .select()
    .from(xpAuditLogs)
    .where(
      and(
        eq(xpAuditLogs.actorId, userId),
        eq(xpAuditLogs.targetUserId, userId)
      )
    )
    .orderBy(desc(xpAuditLogs.createdAt))
    .limit(limit);
}

/**
 * Get recent audit logs for admin dashboard
 */
export async function getRecentAuditLogs(limit: number = 20): Promise<XPAuditLog[]> {
  return await db
    .select()
    .from(xpAuditLogs)
    .orderBy(desc(xpAuditLogs.createdAt))
    .limit(limit);
}
