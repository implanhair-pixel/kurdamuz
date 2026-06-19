import { db } from '@/db';
import { communityPosts, communityProfiles, communityAuditLogs } from '@/db/schema';
import { eq, desc, and, sql, or } from 'drizzle-orm';
import { z } from 'zod';
import { createPostSchema, updatePostSchema } from './validations';
import { requireCommunityPermission, requireAuth } from '@/lib/auth';
import { randomUUID } from 'crypto';
import { awardXPForPost, awardCoinsForPost, checkAndAwardAchievement } from './integration';

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

export async function createPost(input: CreatePostInput) {
  const user = await requireCommunityPermission('create:posts');
  
  const validated = createPostSchema.parse(input);
  
  const postId = randomUUID();
  
  // Create the post
  const [post] = await db.insert(communityPosts).values({
    id: postId,
    userId: user.id,
    title: validated.title,
    content: validated.content,
    postType: validated.postType,
    visibility: validated.visibility,
    status: 'published',
  }).returning();

  // Create audit log
  await db.insert(communityAuditLogs).values({
    id: randomUUID(),
    actorId: user.id,
    actionType: 'post_created',
    targetId: postId,
    oldValue: null,
    newValue: { post },
  });

  // Award XP and coins for creating a post
  await awardXPForPost(user.id);
  await awardCoinsForPost(user.id);
  
  // Check for achievements
  await checkAndAwardAchievement(user.id, 'first_post');
  await checkAndAwardAchievement(user.id, 'active_member');

  return post;
}

export async function getPostById(postId: string) {
  await requireCommunityPermission('read:posts');
  
  const [post] = await db
    .select({
      post: communityPosts,
      author: {
        id: communityProfiles.id,
        displayName: communityProfiles.displayName,
        avatarUrl: communityProfiles.avatarUrl,
        reputationScore: communityProfiles.reputationScore,
      },
    })
    .from(communityPosts)
    .innerJoin(communityProfiles, eq(communityPosts.userId, communityProfiles.userId))
    .where(eq(communityPosts.id, postId))
    .limit(1);

  if (!post) {
    throw new Error('Post not found');
  }

  // Increment view count
  await db
    .update(communityPosts)
    .set({ 
      viewCount: sql`${communityPosts.viewCount} + 1` 
    })
    .where(eq(communityPosts.id, postId));

  return post;
}

export async function getPosts(params: {
  page?: number;
  limit?: number;
  userId?: string;
  postType?: string;
  status?: string;
  sortBy?: 'recent' | 'popular' | 'trending';
}) {
  await requireCommunityPermission('read:posts');
  
  const { page = 1, limit = 20, userId, postType, status, sortBy = 'recent' } = params;
  const offset = (page - 1) * limit;

  let orderBy;
  switch (sortBy) {
    case 'popular':
      orderBy = desc(communityPosts.reactionCount);
      break;
    case 'trending':
      orderBy = desc(sql`${communityPosts.reactionCount} / EXTRACT(EPOCH FROM (NOW() - ${communityPosts.createdAt}))`);
      break;
    default:
      orderBy = desc(communityPosts.createdAt);
  }

  const conditions = [];
  if (userId) {
    conditions.push(eq(communityPosts.userId, userId));
  }
  if (postType) {
    conditions.push(eq(communityPosts.postType, postType));
  }
  if (status) {
    conditions.push(eq(communityPosts.status, status));
  } else {
    // Default to showing published posts
    conditions.push(eq(communityPosts.status, 'published'));
  }

  const posts = await db
    .select({
      post: communityPosts,
      author: {
        id: communityProfiles.id,
        displayName: communityProfiles.displayName,
        avatarUrl: communityProfiles.avatarUrl,
        reputationScore: communityProfiles.reputationScore,
      },
    })
    .from(communityPosts)
    .innerJoin(communityProfiles, eq(communityPosts.userId, communityProfiles.userId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  return posts;
}

export async function updatePost(postId: string, input: UpdatePostInput) {
  const user = await requireAuth();
  
  const validated = updatePostSchema.parse(input);
  
  // Check ownership or admin permission
  const [existingPost] = await db
    .select()
    .from(communityPosts)
    .where(eq(communityPosts.id, postId))
    .limit(1);

  if (!existingPost) {
    throw new Error('Post not found');
  }

  const isOwner = existingPost.userId === user.id;
  const isAdmin = user.user_metadata?.role === 'admin' || 
                  user.user_metadata?.role === 'super_admin' || 
                  user.user_metadata?.role === 'owner';

  if (!isOwner && !isAdmin) {
    await requireCommunityPermission('update:posts');
  }

  if (isOwner && !isAdmin) {
    await requireCommunityPermission('update:own_posts');
  }

  const oldValue = { ...existingPost };
  
  const [updatedPost] = await db
    .update(communityPosts)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(eq(communityPosts.id, postId))
    .returning();

  // Create audit log
  await db.insert(communityAuditLogs).values({
    id: randomUUID(),
    actorId: user.id,
    actionType: 'post_updated',
    targetId: postId,
    oldValue,
    newValue: { post: updatedPost },
  });

  return updatedPost;
}

export async function deletePost(postId: string) {
  const user = await requireAuth();
  
  // Check ownership or admin permission
  const [existingPost] = await db
    .select()
    .from(communityPosts)
    .where(eq(communityPosts.id, postId))
    .limit(1);

  if (!existingPost) {
    throw new Error('Post not found');
  }

  const isOwner = existingPost.userId === user.id;
  const isAdmin = user.user_metadata?.role === 'admin' || 
                  user.user_metadata?.role === 'super_admin' || 
                  user.user_metadata?.role === 'owner';

  if (!isOwner && !isAdmin) {
    await requireCommunityPermission('delete:posts');
  }

  await db.delete(communityPosts).where(eq(communityPosts.id, postId));

  // Create audit log
  await db.insert(communityAuditLogs).values({
    id: randomUUID(),
    actorId: user.id,
    actionType: 'post_deleted',
    targetId: postId,
    oldValue: { post: existingPost },
    newValue: null,
  });

  return { success: true };
}

export async function incrementPostReactionCount(postId: string) {
  await db
    .update(communityPosts)
    .set({ 
      reactionCount: sql`${communityPosts.reactionCount} + 1` 
    })
    .where(eq(communityPosts.id, postId));
}

export async function decrementPostReactionCount(postId: string) {
  await db
    .update(communityPosts)
    .set({ 
      reactionCount: sql`${communityPosts.reactionCount} - 1` 
    })
    .where(eq(communityPosts.id, postId));
}

export async function incrementPostCommentCount(postId: string) {
  await db
    .update(communityPosts)
    .set({ 
      commentCount: sql`${communityPosts.commentCount} + 1` 
    })
    .where(eq(communityPosts.id, postId));
}

export async function decrementPostCommentCount(postId: string) {
  await db
    .update(communityPosts)
    .set({ 
      commentCount: sql`${communityPosts.commentCount} - 1` 
    })
    .where(eq(communityPosts.id, postId));
}
