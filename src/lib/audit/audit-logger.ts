import { db } from '@/db';
import { dialectAuditLogs } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { AuditLogEntry, CreateAuditLogRequest } from '@/types/dialects';

/**
 * Audit Logging Service for Dialect Comparison Platform
 */
export class AuditLogger {
  async logEvent(request: CreateAuditLogRequest): Promise<AuditLogEntry> {
    const [log] = await db
      .insert(dialectAuditLogs)
      .values({
        actorId: request.userId,
        actionType: request.actionType,
        targetId: request.entityId,
        oldValue: {
          entityType: request.entityType,
          ipAddress: request.ipAddress ?? null,
          userAgent: request.userAgent ?? null,
          ...(request.changes ?? {}),
        },
        newValue: request.changes ?? null,
      })
      .returning();

    return this.mapLog(log);
  }

  async getEntityLogs(entityType: string, entityId: string): Promise<AuditLogEntry[]> {
    const logs = await db
      .select()
      .from(dialectAuditLogs)
      .orderBy(desc(dialectAuditLogs.createdAt));

    return logs
      .filter(log => {
        const meta = (log.oldValue ?? {}) as { entityType?: string };
        return meta?.entityType === entityType && log.targetId === entityId;
      })
      .map(this.mapLog);
  }

  async getUserLogs(userId: string, limit = 50): Promise<AuditLogEntry[]> {
    const logs = await db
      .select()
      .from(dialectAuditLogs)
      .where(eq(dialectAuditLogs.actorId, userId))
      .orderBy(desc(dialectAuditLogs.createdAt))
      .limit(limit);

    return logs.map(this.mapLog);
  }

  async getRecentLogs(limit = 20): Promise<AuditLogEntry[]> {
    const logs = await db
      .select()
      .from(dialectAuditLogs)
      .orderBy(desc(dialectAuditLogs.createdAt))
      .limit(limit);

    return logs.map(this.mapLog);
  }

  async getLogsByActionType(actionType: string, limit = 50): Promise<AuditLogEntry[]> {
    const logs = await db
      .select()
      .from(dialectAuditLogs)
      .where(eq(dialectAuditLogs.actionType, actionType))
      .orderBy(desc(dialectAuditLogs.createdAt))
      .limit(limit);

    return logs.map(this.mapLog);
  }

  private mapLog(log: typeof dialectAuditLogs.$inferSelect): AuditLogEntry {
    return {
      id: log.id,
      actorId: log.actorId,
      actionType: log.actionType,
      targetId: log.targetId,
      entityType: ((log.oldValue ?? {}) as { entityType?: string }).entityType ?? '',
      entityId: log.targetId,
      oldValue: log.oldValue as Record<string, any> | undefined,
      newValue: log.newValue as Record<string, any> | undefined,
      createdAt: log.createdAt ?? new Date(),
    };
  }

  parseChanges(changes: string | null): Record<string, any> | null {
    if (!changes) return null;
    try {
      return JSON.parse(changes);
    } catch {
      return null;
    }
  }
}

export const auditLogger = new AuditLogger();

export async function logAuditEvent(params: {
  userId: string;
  actionType: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, any>;
  request?: Request;
}) {
  const ipAddress = params.request?.headers.get('x-forwarded-for') || 
                    params.request?.headers.get('x-real-ip') || null;
  const userAgent = params.request?.headers.get('user-agent') || null;

  return await auditLogger.logEvent({
    userId: params.userId,
    actionType: params.actionType,
    entityType: params.entityType,
    entityId: params.entityId,
    changes: params.changes,
    ipAddress,
    userAgent,
  });
}
