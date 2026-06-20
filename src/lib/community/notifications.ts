import { db } from '@/db';
import { communityNotifications, communityProfiles } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { updateNotificationSchema } from './validations';
import { requireCommunityPermission, requireAuth } from '@/lib/auth';
import { randomUUID } from 'crypto';
import { paginateNotifications } from '@/lib/pagination';
import { cachedFetch, generateCacheKey } from '@/lib/cache';
import { queueNotification } from '@/lib/notification-queue';

export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;

export async function createNotification(userId: string, notificationType: string, payload: any) {
  // Queue notification for async delivery
  await queueNotification(userId, notificationType, payload);

  // Also insert into community_notifications for immediate display
  const [notification] = await db.insert(communityNotifications).values({
    id: randomUUID(),
    userId,
    notificationType,
    payload,
    readStatus: false,
  }).returning();

  return notification;
}

export async function getNotificationById(notificationId: string) {
  const user = await requireAuth();
  
  const [notification] = await db
    .select()
    .from(communityNotifications)
    .where(and(
      eq(communityNotifications.id, notificationId),
      eq(communityNotifications.userId, user.id)
    ))
    .limit(1);

  if (!notification) {
    throw new Error('Notification not found');
  }

  return notification;
}

export async function getNotifications(params: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  cursor?: string | null;
}) {
  const user = await requireAuth();
  
  const { limit = 20, unreadOnly = false, cursor } = params;

  // Generate cache key
  const cacheKey = generateCacheKey('notifications', { userId: user.id, limit, unreadOnly, cursor });

  // Use cached fetch with bounded queries (max 50 items)
  const boundedLimit = Math.min(limit, 50);
  
  return await cachedFetch(
    cacheKey,
    async () => {
      const result = await paginateNotifications({ limit: boundedLimit, cursor }, user.id, unreadOnly);
      return result.items;
    },
    { ttl: 60, tags: [`user:${user.id}`] } // 1 minute cache for notifications
  );
}

export async function markNotificationAsRead(notificationId: string) {
  const user = await requireAuth();
  
  const [notification] = await db
    .select()
    .from(communityNotifications)
    .where(and(
      eq(communityNotifications.id, notificationId),
      eq(communityNotifications.userId, user.id)
    ))
    .limit(1);

  if (!notification) {
    throw new Error('Notification not found');
  }

  const [updatedNotification] = await db
    .update(communityNotifications)
    .set({ readStatus: true })
    .where(eq(communityNotifications.id, notificationId))
    .returning();

  return updatedNotification;
}

export async function markAllNotificationsAsRead() {
  const user = await requireAuth();
  
  await db
    .update(communityNotifications)
    .set({ readStatus: true })
    .where(and(
      eq(communityNotifications.userId, user.id),
      eq(communityNotifications.readStatus, false)
    ));

  return { success: true };
}

export async function deleteNotification(notificationId: string) {
  const user = await requireAuth();
  
  const [notification] = await db
    .select()
    .from(communityNotifications)
    .where(and(
      eq(communityNotifications.id, notificationId),
      eq(communityNotifications.userId, user.id)
    ))
    .limit(1);

  if (!notification) {
    throw new Error('Notification not found');
  }

  await db.delete(communityNotifications).where(eq(communityNotifications.id, notificationId));

  return { success: true };
}

export async function getUnreadCount() {
  const user = await requireAuth();
  
  const [result] = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(communityNotifications)
    .where(and(
      eq(communityNotifications.userId, user.id),
      eq(communityNotifications.readStatus, false)
    ));

  return result.count;
}

export async function notifyPostReaction(postId: string, postAuthorId: string, reactorId: string, reactionType: string) {
  await createNotification(postAuthorId, 'post_reaction', {
    postId,
    reactorId,
    reactionType,
  });
}

export async function notifyCommentReply(commentId: string, commentAuthorId: string, replierId: string, postId: string) {
  await createNotification(commentAuthorId, 'comment_reply', {
    commentId,
    replierId,
    postId,
  });
}

export async function notifyMention(userId: string, targetType: string, targetId: string, mentionerId: string) {
  await createNotification(userId, 'mention', {
    targetType,
    targetId,
    mentionerId,
  });
}

export async function notifyModerationAction(userId: string, targetType: string, targetId: string, actionType: string) {
  await createNotification(userId, 'moderation_action', {
    targetType,
    targetId,
    actionType,
  });
}

export async function notifyReportUpdate(reporterId: string, reportId: string, status: string) {
  await createNotification(reporterId, 'report_update', {
    reportId,
    status,
  });
}

export async function notifyAchievementUnlock(userId: string, achievementId: string, achievementName: string) {
  await createNotification(userId, 'achievement_unlock', {
    achievementId,
    achievementName,
  });
}

export async function notifyAnnouncement(userId: string, announcementId: string, title: string, content: string) {
  await createNotification(userId, 'announcement', {
    announcementId,
    title,
    content,
  });
}
