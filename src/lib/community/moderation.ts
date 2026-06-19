import { db } from '@/db';
import { moderationActions, communityProfiles, communityAuditLogs, communityPosts, communityComments } from '@/db/schema';
import { eq, desc, and, count } from 'drizzle-orm';
import { z } from 'zod';
import { createModerationActionSchema } from './validations';
import { requireCommunityPermission, requireAuth } from '@/lib/auth';
import { randomUUID } from 'crypto';

export type CreateModerationActionInput = z.infer<typeof createModerationActionSchema>;

export async function createModerationAction(input: CreateModerationActionInput) {
  await requireCommunityPermission('moderate:content');

  const [action] = await db
    .insert(moderationActions)
    .values({
      id: randomUUID(),
      ...input,
    } as any)
    .returning();

  return action;
}

export async function getModerationActionById(actionId: string) {
  await requireCommunityPermission('read:posts');

  const [action] = await db
    .select()
    .from(moderationActions)
    .where(eq(moderationActions.id, actionId));

  return action || null;
}

export async function getModerationActions(params: {
  page?: number;
  limit?: number;
  targetType?: string;
  actionType?: string;
}) {
  await requireCommunityPermission('read:posts');

  const { page = 1, limit = 20, targetType, actionType } = params;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (targetType) conditions.push(eq(moderationActions.targetType, targetType));
  if (actionType) conditions.push(eq(moderationActions.actionType, actionType));

  const query = db
    .select()
    .from(moderationActions)
    .orderBy(desc(moderationActions.createdAt))
    .limit(limit)
    .offset(offset);

  const actions = conditions.length > 0
    ? await query.where(and(...conditions))
    : await query;

  return actions;
}

export async function getActionsByTarget(targetType: string, targetId: string) {
  await requireCommunityPermission('read:posts');

  const actions = await db
    .select()
    .from(moderationActions)
    .where(
      and(
        eq(moderationActions.targetType, targetType),
        eq(moderationActions.targetId, targetId)
      )
    )
    .orderBy(desc(moderationActions.createdAt));

  return actions;
}

export async function getModerationStats() {
  await requireCommunityPermission('view:analytics');

  const stats = await db
    .select({
      actionType: moderationActions.actionType,
      count: count(moderationActions.id),
    })
    .from(moderationActions)
    .groupBy(moderationActions.actionType);

  return stats.reduce((acc, stat) => {
    acc[stat.actionType] = stat.count;
    return acc;
  }, {} as Record<string, number>);
}
