import { supabaseAdmin } from './supabase';

export interface AuditLogEntry {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAuditEntry(entry: AuditLogEntry) {
  try {
    const { error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resource_id: entry.resourceId,
        details: entry.details,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to log audit entry:', error);
    }
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

export async function logUserAction(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, any>
) {
  await logAuditEntry({
    userId,
    action,
    resource,
    resourceId,
    details,
  });
}

export async function logAdminAction(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, any>
) {
  await logAuditEntry({
    userId,
    action: `ADMIN_${action}`,
    resource,
    resourceId,
    details,
  });
}

export async function logSecurityEvent(
  userId: string | null,
  event: string,
  details?: Record<string, any>
) {
  await logAuditEntry({
    userId: userId || 'anonymous',
    action: `SECURITY_${event}`,
    resource: 'system',
    details,
  });
}

// Common audit actions
export const AuditActions = {
  // Course actions
  COURSE_CREATED: 'COURSE_CREATED',
  COURSE_UPDATED: 'COURSE_UPDATED',
  COURSE_DELETED: 'COURSE_DELETED',
  COURSE_PUBLISHED: 'COURSE_PUBLISHED',
  COURSE_UNPUBLISHED: 'COURSE_UNPUBLISHED',

  // Lesson actions
  LESSON_CREATED: 'LESSON_CREATED',
  LESSON_UPDATED: 'LESSON_UPDATED',
  LESSON_DELETED: 'LESSON_DELETED',
  LESSON_COMPLETED: 'LESSON_COMPLETED',

  // Progress actions
  PROGRESS_UPDATED: 'PROGRESS_UPDATED',
  XP_AWARDED: 'XP_AWARDED',
  CERTIFICATE_ISSUED: 'CERTIFICATE_ISSUED',

  // Auth actions
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  PASSWORD_RESET: 'PASSWORD_RESET',

  // Admin actions
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  ROLE_ASSIGNED: 'ROLE_ASSIGNED',
  ROLE_REVOKED: 'ROLE_REVOKED',
} as const;
