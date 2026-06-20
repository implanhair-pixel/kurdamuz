import { eq, desc, and, sql } from 'drizzle-orm';
import { db } from '@/db';
import { communityPosts, communityNotifications } from '@/db/schema';

export interface CursorPaginationOptions {
  limit?: number;
  cursor?: string | null;
}

export interface CursorPaginationResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Decode a cursor to extract the timestamp and ID
 */
export function decodeCursor(cursor: string): { timestamp: number; id: string } {
  const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
  const [timestamp, id] = decoded.split(':');
  return { timestamp: parseInt(timestamp, 10), id };
}

/**
 * Encode a cursor from timestamp and ID
 */
export function encodeCursor(timestamp: number, id: string): string {
  return Buffer.from(`${timestamp}:${id}`).toString('base64');
}

/**
 * Cursor-based pagination specifically for community posts
 */
export async function paginateCommunityPosts(
  options: CursorPaginationOptions,
  userId?: string
): Promise<CursorPaginationResult<any>> {
  const { limit = 20, cursor } = options;
  
  const conditions = [eq(communityPosts.status, 'published')];
  if (userId) {
    conditions.push(eq(communityPosts.userId, userId));
  }
  
  if (cursor) {
    const { timestamp, id } = decodeCursor(cursor);
    conditions.push(
      sql`(${communityPosts.createdAt} < ${new Date(timestamp)} OR (${communityPosts.createdAt} = ${new Date(timestamp)} AND ${communityPosts.id} < ${id}))`
    );
  }
  
  const items = await db
    .select()
    .from(communityPosts)
    .where(and(...conditions))
    .orderBy(desc(communityPosts.createdAt), desc(communityPosts.id))
    .limit(limit + 1);
  
  const hasMore = items.length > limit;
  const paginatedItems = hasMore ? items.slice(0, limit) : items;
  
  const lastItem = paginatedItems[paginatedItems.length - 1];
  const nextCursor = hasMore && lastItem?.createdAt && lastItem?.id 
    ? encodeCursor(new Date(lastItem.createdAt).getTime(), lastItem.id)
    : null;
  
  return {
    items: paginatedItems,
    nextCursor,
    hasMore,
  };
}

/**
 * Cursor-based pagination specifically for notifications
 */
export async function paginateNotifications(
  options: CursorPaginationOptions,
  userId: string,
  unreadOnly?: boolean
): Promise<CursorPaginationResult<any>> {
  const { limit = 20, cursor } = options;
  
  const conditions = [eq(communityNotifications.userId, userId)];
  if (unreadOnly) {
    conditions.push(eq(communityNotifications.readStatus, false));
  }
  
  if (cursor) {
    const { timestamp, id } = decodeCursor(cursor);
    conditions.push(
      sql`(${communityNotifications.createdAt} < ${new Date(timestamp)} OR (${communityNotifications.createdAt} = ${new Date(timestamp)} AND ${communityNotifications.id} < ${id}))`
    );
  }
  
  const items = await db
    .select()
    .from(communityNotifications)
    .where(and(...conditions))
    .orderBy(desc(communityNotifications.createdAt), desc(communityNotifications.id))
    .limit(limit + 1);
  
  const hasMore = items.length > limit;
  const paginatedItems = hasMore ? items.slice(0, limit) : items;
  
  const lastItem = paginatedItems[paginatedItems.length - 1];
  const nextCursor = hasMore && lastItem?.createdAt && lastItem?.id 
    ? encodeCursor(new Date(lastItem.createdAt).getTime(), lastItem.id)
    : null;
  
  return {
    items: paginatedItems,
    nextCursor,
    hasMore,
  };
}
