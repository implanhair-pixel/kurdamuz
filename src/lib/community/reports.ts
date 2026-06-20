import { db } from '@/db';
import { communityReports, communityProfiles, communityAuditLogs } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { createReportSchema, updateReportSchema } from './validations';
import { requireCommunityPermission, requireAuth } from '@/lib/auth';
import { randomUUID } from 'crypto';

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;

export async function createReport(input: CreateReportInput) {
  const user = await requireCommunityPermission('report:content');
  
  const validated = createReportSchema.parse(input);
  
  // Check if user already reported this content
  const [existingReport] = await db
    .select()
    .from(communityReports)
    .where(and(
      eq(communityReports.reporterId, user.id),
      eq(communityReports.targetType, validated.targetType),
      eq(communityReports.targetId, validated.targetId),
      eq(communityReports.status, 'pending')
    ))
    .limit(1);

  if (existingReport) {
    throw new Error('You have already reported this content');
  }
  
  const [report] = await db.insert(communityReports).values({
    id: randomUUID(),
    reporterId: user.id,
    targetType: validated.targetType,
    targetId: validated.targetId,
    reportReason: validated.reportReason,
    reportDetails: validated.reportDetails || null,
    status: 'pending',
  }).returning();

  // Create audit log
  await db.insert(communityAuditLogs).values({
    id: randomUUID(),
    actorId: user.id,
    actionType: 'report_created',
    targetId: report.id,
    oldValue: null,
    newValue: { report },
  });

  return report;
}

export async function getReportById(reportId: string) {
  await requireCommunityPermission('moderate:content');
  
  const [report] = await db
    .select({
      report: communityReports,
      reporter: {
        id: communityProfiles.id,
        displayName: communityProfiles.displayName,
        avatarUrl: communityProfiles.avatarUrl,
      },
    })
    .from(communityReports)
    .innerJoin(communityProfiles, eq(communityReports.reporterId, communityProfiles.userId))
    .where(eq(communityReports.id, reportId))
    .limit(1);

  if (!report) {
    throw new Error('Report not found');
  }

  return report;
}

export async function getReports(params: {
  page?: number;
  limit?: number;
  status?: string;
  targetType?: string;
}) {
  await requireCommunityPermission('moderate:content');
  
  const { page = 1, limit = 20, status, targetType } = params;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status) {
    conditions.push(eq(communityReports.status, status));
  }
  if (targetType) {
    conditions.push(eq(communityReports.targetType, targetType));
  }

  const reports = await db
    .select({
      report: communityReports,
      reporter: {
        id: communityProfiles.id,
        displayName: communityProfiles.displayName,
        avatarUrl: communityProfiles.avatarUrl,
      },
    })
    .from(communityReports)
    .innerJoin(communityProfiles, eq(communityReports.reporterId, communityProfiles.userId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(communityReports.createdAt))
    .limit(limit)
    .offset(offset);

  return reports;
}

export async function updateReport(reportId: string, input: UpdateReportInput) {
  const user = await requireCommunityPermission('moderate:content');
  
  const validated = updateReportSchema.parse(input);
  
  const [existingReport] = await db
    .select()
    .from(communityReports)
    .where(eq(communityReports.id, reportId))
    .limit(1);

  if (!existingReport) {
    throw new Error('Report not found');
  }

  const oldValue = { ...existingReport };
  
  const [updatedReport] = await db
    .update(communityReports)
    .set({
      ...validated,
      reviewedBy: user.id,
      reviewedAt: new Date(),
    })
    .where(eq(communityReports.id, reportId))
    .returning();

  // Create audit log
  await db.insert(communityAuditLogs).values({
    id: randomUUID(),
    actorId: user.id,
    actionType: 'report_updated',
    targetId: reportId,
    oldValue,
    newValue: { report: updatedReport },
  });

  return updatedReport;
}

export async function getReportsByTarget(targetType: string, targetId: string) {
  await requireCommunityPermission('moderate:content');
  
  const reports = await db
    .select({
      report: communityReports,
      reporter: {
        id: communityProfiles.id,
        displayName: communityProfiles.displayName,
        avatarUrl: communityProfiles.avatarUrl,
      },
    })
    .from(communityReports)
    .innerJoin(communityProfiles, eq(communityReports.reporterId, communityProfiles.userId))
    .where(and(
      eq(communityReports.targetType, targetType as any),
      eq(communityReports.targetId, targetId)
    ))
    .orderBy(desc(communityReports.createdAt));

  return reports;
}

export async function getReportStats() {
  await requireCommunityPermission('view:analytics');
  
  const stats = await db
    .select({
      status: communityReports.status,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(communityReports)
    .groupBy(communityReports.status);

  return stats.reduce((acc, stat) => {
    acc[stat.status] = stat.count;
    return acc;
  }, {} as Record<string, number>);
}
