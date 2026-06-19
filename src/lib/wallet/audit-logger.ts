import { db } from '@/db';
import { walletAuditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface AuditLogRecord {
  actorId: string;
  targetUserId: string;
  actionType: 'wallet_created' | 'balance_updated' | 'transaction_recorded' | 'status_changed' | 'policy_modified';
  oldValue: any;
  newValue: any;
}

export class AuditLogger {
  /**
   * Log a wallet-related action for audit purposes
   * This creates an immutable audit trail for all wallet operations
   */
  async log(record: AuditLogRecord): Promise<void> {
    await db.insert(walletAuditLogs).values({
      actorId: record.actorId,
      targetUserId: record.targetUserId,
      actionType: record.actionType,
      oldValue: record.oldValue,
      newValue: record.newValue,
    });
  }

  /**
   * Get audit logs for a target user
   */
  async getAuditLogsForUser(targetUserId: string, limit = 50, offset = 0) {
    const logs = await db
      .select()
      .from(walletAuditLogs)
      .where(eq(walletAuditLogs.targetUserId, targetUserId))
      .orderBy(walletAuditLogs.createdAt)
      .limit(limit)
      .offset(offset);

    return logs;
  }

  /**
   * Get audit logs by action type
   */
  async getAuditLogsByAction(actionType: string, limit = 50, offset = 0) {
    const logs = await db
      .select()
      .from(walletAuditLogs)
      .where(eq(walletAuditLogs.actionType, actionType))
      .orderBy(walletAuditLogs.createdAt)
      .limit(limit)
      .offset(offset);

    return logs;
  }

  /**
   * Get audit logs by actor
   */
  async getAuditLogsByActor(actorId: string, limit = 50, offset = 0) {
    const logs = await db
      .select()
      .from(walletAuditLogs)
      .where(eq(walletAuditLogs.actorId, actorId))
      .orderBy(walletAuditLogs.createdAt)
      .limit(limit)
      .offset(offset);

    return logs;
  }
}

export const auditLogger = new AuditLogger();
