import { db } from '@/db/index';
import { assessmentAuditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Audit logging for placement test operations
 */
export type AuditAction = 
  | 'test_started'
  | 'test_completed'
  | 'test_abandoned'
  | 'question_created'
  | 'question_updated'
  | 'question_deleted'
  | 'assessment_created'
  | 'assessment_updated'
  | 'assessment_deleted'
  | 'response_submitted'
  | 'placement_determined'
  | 'xp_awarded'
  | 'achievement_triggered';

export interface AuditLogEntry {
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

export class PlacementAuditLogger {
  /**
   * Log an audit entry
   */
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      await db.insert(assessmentAuditLogs).values({
        actorId: entry.userId,
        actionType: entry.action as any,
        targetId: entry.entityId,
        oldValue: entry.oldValue || null,
        newValue: entry.newValue || null,
      });
    } catch (error) {
      console.error('Error logging audit entry:', error);
      // Audit logging failure should not break the main operation
    }
  }

  /**
   * Log test start
   */
  static async logTestStart(
    userId: string,
    attemptId: string,
    testId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'test_started',
      entityType: 'attempt',
      entityId: attemptId,
      newValue: { testId },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log test completion
   */
  static async logTestCompletion(
    userId: string,
    attemptId: string,
    overallScore: number,
    placementLevel: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'test_completed',
      entityType: 'attempt',
      entityId: attemptId,
      newValue: { overallScore, placementLevel },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log question creation
   */
  static async logQuestionCreation(
    userId: string,
    questionId: string,
    questionData: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'question_created',
      entityType: 'question',
      entityId: questionId,
      newValue: questionData,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log question update
   */
  static async logQuestionUpdate(
    userId: string,
    questionId: string,
    oldValue: any,
    newValue: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'question_updated',
      entityType: 'question',
      entityId: questionId,
      oldValue,
      newValue,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log question deletion
   */
  static async logQuestionDeletion(
    userId: string,
    questionId: string,
    oldValue: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'question_deleted',
      entityType: 'question',
      entityId: questionId,
      oldValue,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log XP award
   */
  static async logXPAward(
    userId: string,
    attemptId: string,
    xpAmount: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'xp_awarded',
      entityType: 'xp_transaction',
      entityId: attemptId,
      newValue: { xpAmount },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log achievement trigger
   */
  static async logAchievementTrigger(
    userId: string,
    attemptId: string,
    achievementCode: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'achievement_triggered',
      entityType: 'user_achievement',
      entityId: attemptId,
      newValue: { achievementCode },
      ipAddress,
      userAgent,
    });
  }
}
