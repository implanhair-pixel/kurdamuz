import { db } from '@/db';
import { communityComments, communityPosts, communityProfiles, communityAuditLogs } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { createCommentSchema, updateCommentSchema } from './validations';
import { requireCommunityPermission, requireAuth, getCurrentUserRole } from '@/lib/auth';
import { randomUUID } from 'crypto';
import { awardXPForComment, checkAndAwardAchievement } from './integration';

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;

export async function createComment(input: CreateCommentInput) {
  const user = await requireCommunityPermission('create:comments');
  
  const validated = createCommentSchema.parse(input);
  
  const commentId = randomUUID();
  
  // Verify the post exists
  const [post] = await db
    .select()
    .from(communityPosts)
    .where(eq(communityPosts.id, validated.postId))
    .limit(1);

  if (!post) {
    throw new Error('Post not found');
  }

  // If parent comment exists, verify it belongs to the same post
  if (validated.parentCommentId) {
    const [parentComment] = await db
      .select()
      .from(communityComments)
      .where(eq(communityComments.id, validated.parentCommentId))
      .limit(1);

    if (!parentComment || parentComment.postId !== validated.postId) {
      throw new Error('Invalid parent comment');
    }
  }
  
  // Create the comment
  const [comment] = await db.insert(communityComments).values({
    id: commentId,
    postId: validated.postId,
    userId: user.id,
    parentCommentId: validated.parentCommentId || null,
    content: validated.content,
    status: 'published',
  }).returning();

  // Increment post comment count
  await db
    .update(communityPosts)
    .set({ 
      commentCount: sql`${communityPosts.commentCount} + 1` 
    })
    .where(eq(communityPosts.id, validated.postId));

  // Create audit log
  await db.insert(communityAuditLogs).values({
    id: randomUUID(),
    actorId: user.id,
    actionType: 'comment_created',
    targetId: commentId,
    oldValue: null,
    newValue: { comment },
  });

  // Award XP for creating a comment
  await awardXPForComment(user.id);
  
  // Check for achievements
  await checkAndAwardAchievement(user.id, 'first_comment');
  await checkAndAwardAchievement(user.id, 'active_member');

  return comment;
}

export async function getCommentById(commentId: string) {
  await requireCommunityPermission('read:comments');
  
  const [comment] = await db
    .select({
      comment: communityComments,
      author: {
        id: communityProfiles.id,
        displayName: communityProfiles.displayName,
        avatarUrl: communityProfiles.avatarUrl,
        reputationScore: communityProfiles.reputationScore,
      },
    })
    .from(communityComments)
    .innerJoin(communityProfiles, eq(communityComments.userId, communityProfiles.userId))
    .where(eq(communityComments.id, commentId))
    .limit(1);

  if (!comment) {
    throw new Error('Comment not found');
  }

  return comment;
}

export async function getCommentsByPostId(postId: string, params: {
  page?: number;
  limit?: number;
}) {
  await requireCommunityPermission('read:comments');
  
  const { page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  const comments = await db
    .select({
      comment: communityComments,
      author: {
        id: communityProfiles.id,
        displayName: communityProfiles.displayName,
        avatarUrl: communityProfiles.avatarUrl,
        reputationScore: communityProfiles.reputationScore,
      },
    })
    .from(communityComments)
    .innerJoin(communityProfiles, eq(communityComments.userId, communityProfiles.userId))
    .where(and(
      eq(communityComments.postId, postId),
      eq(communityComments.status, 'published')
    ))
    .orderBy(desc(communityComments.createdAt))
    .limit(limit)
    .offset(offset);

  return comments;
}

export async function getRepliesByCommentId(parentCommentId: string, params: {
  page?: number;
  limit?: number;
}) {
  await requireCommunityPermission('read:comments');
  
  const { page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  const replies = await db
    .select({
      comment: communityComments,
      author: {
        id: communityProfiles.id,
        displayName: communityProfiles.displayName,
        avatarUrl: communityProfiles.avatarUrl,
        reputationScore: communityProfiles.reputationScore,
      },
    })
    .from(communityComments)
    .innerJoin(communityProfiles, eq(communityComments.userId, communityProfiles.userId))
    .where(and(
      eq(communityComments.parentCommentId, parentCommentId),
      eq(communityComments.status, 'published')
    ))
    .orderBy(desc(communityComments.createdAt))
    .limit(limit)
    .offset(offset);

  return replies;
}

export async function updateComment(commentId: string, input: UpdateCommentInput) {
  const user = await requireAuth();
  
  const validated = updateCommentSchema.parse(input);
  
  // Check ownership or admin permission
  const [existingComment] = await db
    .select()
    .from(communityComments)
    .where(eq(communityComments.id, commentId))
    .limit(1);

  if (!existingComment) {
    throw new Error('Comment not found');
  }

  const isOwner = existingComment.userId === user.id;
  const userRole = (await getCurrentUserRole()) || 'student';
  const isAdmin = ['admin_super', 'owner'].includes(userRole);

  if (!isOwner && !isAdmin) {
    await requireCommunityPermission('update:comments');
  }

  if (isOwner && !isAdmin) {
    await requireCommunityPermission('update:own_comments');
  }

  const oldValue = { ...existingComment };
  
  const [updatedComment] = await db
    .update(communityComments)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(eq(communityComments.id, commentId))
    .returning();

  // Create audit log
  await db.insert(communityAuditLogs).values({
    id: randomUUID(),
    actorId: user.id,
    actionType: 'comment_updated',
    targetId: commentId,
    oldValue,
    newValue: { comment: updatedComment },
  });

  return updatedComment;
}

export async function deleteComment(commentId: string) {
  const user = await requireAuth();
  
  // Check ownership or admin permission
  const [existingComment] = await db
    .select()
    .from(communityComments)
    .where(eq(communityComments.id, commentId))
    .limit(1);

  if (!existingComment) {
    throw new Error('Comment not found');
  }

  const isOwner = existingComment.userId === user.id;
  const userRole = (await getCurrentUserRole()) || 'student';
  const isAdmin = ['admin_super', 'owner'].includes(userRole);

  if (!isOwner && !isAdmin) {
    await requireCommunityPermission('delete:comments');
  }

  await db.delete(communityComments).where(eq(communityComments.id, commentId));

  // Decrement post comment count
  await db
    .update(communityPosts)
    .set({ 
      commentCount: sql`${communityPosts.commentCount} - 1` 
    })
    .where(eq(communityPosts.id, existingComment.postId));

  // Create audit log
  await db.insert(communityAuditLogs).values({
    id: randomUUID(),
    actorId: user.id,
    actionType: 'comment_deleted',
    targetId: commentId,
    oldValue: { comment: existingComment },
    newValue: null,
  });

  return { success: true };
}

export async function incrementCommentReactionCount(commentId: string) {
  await db
    .update(communityComments)
    .set({ 
      reactionCount: sql`${communityComments.reactionCount} + 1` 
    })
    .where(eq(communityComments.id, commentId));
}

export async function decrementCommentReactionCount(commentId: string) {
  await db
    .update(communityComments)
    .set({ 
      reactionCount: sql`${communityComments.reactionCount} - 1` 
    })
    .where(eq(communityComments.id, commentId));
}
