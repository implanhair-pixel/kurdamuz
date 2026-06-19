// src/lib/challenges/audit.ts
import { db } from '@/db';
import { challengeAuditLogs } from '@/db/schema';
import { headers } from 'next/headers';

interface AuditLogInput {
  entityType: string;
  entityId: string;
  action: string;
  userId: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}

export async function auditLog(input: AuditLogInput): Promise<void> {
  try {
    const headersList = await headers();
    
    await db.insert(challengeAuditLogs).values({
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      userId: input.userId,
      ipAddress: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined,
      userAgent: headersList.get('user-agent') || undefined,
      changes: input.changes,
      metadata: input.metadata,
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error - audit logging should not break the main flow
  }
}

export async function logChallengeDefinitionCreated(
  definitionId: string,
  userId: string,
  data: Record<string, any>
): Promise<void> {
  await auditLog({
    entityType: 'definition',
    entityId: definitionId,
    action: 'created',
    userId,
    changes: { before: null, after: data },
    metadata: { title: data.title },
  });
}

export async function logChallengeDefinitionUpdated(
  definitionId: string,
  userId: string,
  before: Record<string, any>,
  after: Record<string, any>
): Promise<void> {
  await auditLog({
    entityType: 'definition',
    entityId: definitionId,
    action: 'updated',
    userId,
    changes: { before, after },
    metadata: { title: after.title },
  });
}

export async function logChallengeDefinitionDeleted(
  definitionId: string,
  userId: string,
  data: Record<string, any>
): Promise<void> {
  await auditLog({
    entityType: 'definition',
    entityId: definitionId,
    action: 'deleted',
    userId,
    changes: { before: data, after: null },
    metadata: { title: data.title },
  });
}

export async function logChallengeScheduleCreated(
  scheduleId: string,
  userId: string,
  data: Record<string, any>
): Promise<void> {
  await auditLog({
    entityType: 'schedule',
    entityId: scheduleId,
    action: 'created',
    userId,
    changes: { before: null, after: data },
    metadata: { title: data.title, scheduledDate: data.scheduledDate },
  });
}

export async function logChallengeSchedulePublished(
  scheduleId: string,
  userId: string
): Promise<void> {
  await auditLog({
    entityType: 'schedule',
    entityId: scheduleId,
    action: 'published',
    userId,
    metadata: { timestamp: new Date().toISOString() },
  });
}

export async function logChallengeScheduleApproved(
  scheduleId: string,
  userId: string,
  approved: boolean
): Promise<void> {
  await auditLog({
    entityType: 'schedule',
    entityId: scheduleId,
    action: approved ? 'approved' : 'rejected',
    userId,
    metadata: { approved, timestamp: new Date().toISOString() },
  });
}

export async function logChallengeSubmissionCreated(
  submissionId: string,
  userId: string,
  data: Record<string, any>
): Promise<void> {
  await auditLog({
    entityType: 'submission',
    entityId: submissionId,
    action: 'submitted',
    userId,
    changes: { before: null, after: { scheduleId: data.scheduleId } },
    metadata: { 
      timeTaken: data.timeTaken,
      fraudScore: data.fraudScore,
    },
  });
}

export async function logChallengeSubmissionReviewed(
  submissionId: string,
  userId: string,
  action: 'approve' | 'reject' | 'flag',
  notes?: string
): Promise<void> {
  await auditLog({
    entityType: 'submission',
    entityId: submissionId,
    action: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged',
    userId,
    metadata: { reviewNotes: notes, timestamp: new Date().toISOString() },
  });
}

export async function logChallengeScoreCreated(
  scoreId: string,
  userId: string,
  data: Record<string, any>
): Promise<void> {
  await auditLog({
    entityType: 'score',
    entityId: scoreId,
    action: 'created',
    userId,
    changes: { before: null, after: data },
    metadata: { 
      finalScore: data.finalScore,
      rank: data.rank,
    },
  });
}

export async function logChallengeRewardClaimed(
  rewardId: string,
  userId: string,
  data: Record<string, any>
): Promise<void> {
  await auditLog({
    entityType: 'reward',
    entityId: rewardId,
    action: 'claimed',
    userId,
    changes: { before: { isClaimed: false }, after: { isClaimed: true } },
    metadata: { 
      rewardType: data.rewardType,
      claimedAt: new Date().toISOString(),
    },
  });
}

export async function logLeaderboardUpdated(
  leaderboardId: string,
  userId: string,
  data: Record<string, any>
): Promise<void> {
  await auditLog({
    entityType: 'leaderboard',
    entityId: leaderboardId,
    action: 'updated',
    userId,
    changes: { before: { rank: data.previousRank }, after: { rank: data.rank, score: data.score } },
    metadata: { 
      change: data.change,
      timestamp: new Date().toISOString(),
    },
  });
}
