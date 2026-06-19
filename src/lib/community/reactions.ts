import { db } from '@/db';
import { communityReactions, communityPosts, communityComments, communityProfiles } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { createReactionSchema } from './validations';
import { requireCommunityPermission, requireAuth } from '@/lib/auth';
import { randomUUID } from 'crypto';
import { incrementPostReactionCount, decrementPostReactionCount } from './posts';
import { incrementCommentReactionCount, decrementCommentReactionCount } from './comments';
import { awardXPForHelpfulContent, awardCoinsForHelpfulContent, checkAndAwardAchievement } from './integration';

export type CreateReactionInput = z.infer<typeof createReactionSchema>;

export async function createReaction(input: CreateReactionInput) {
  const user = await requireCommunityPermission('react:content');
  
  const validated = createReactionSchema.parse(input);
  
  // Check if user already reacted to this content
  const [existingReaction] = await db
    .select()
    .from(communityReactions)
    .where(and(
      eq(communityReactions.userId, user.id),
      eq(communityReactions.targetType, validated.targetType),
      eq(communityReactions.targetId, validated.targetId)
    ))
    .limit(1);

  if (existingReaction) {
    // If same reaction type, remove it (toggle)
    if (existingReaction.reactionType === validated.reactionType) {
      await db.delete(communityReactions).where(eq(communityReactions.id, existingReaction.id));
      
      // Decrement reaction count
      if (validated.targetType === 'post') {
        await decrementPostReactionCount(validated.targetId);
      } else if (validated.targetType === 'comment') {
        await decrementCommentReactionCount(validated.targetId);
      }
      
      return { action: 'removed', reaction: existingReaction };
    }
    
    // If different reaction type, update it
    const [updatedReaction] = await db
      .update(communityReactions)
      .set({ reactionType: validated.reactionType })
      .where(eq(communityReactions.id, existingReaction.id))
      .returning();
    
    return { action: 'updated', reaction: updatedReaction };
  }
  
  // Create new reaction
  const [reaction] = await db.insert(communityReactions).values({
    id: randomUUID(),
    userId: user.id,
    targetType: validated.targetType,
    targetId: validated.targetId,
    reactionType: validated.reactionType,
  }).returning();

  // Increment reaction count
  if (validated.targetType === 'post') {
    await incrementPostReactionCount(validated.targetId);
  } else if (validated.targetType === 'comment') {
    await incrementCommentReactionCount(validated.targetId);
  }

  // Award XP and coins for helpful reactions
  if (validated.reactionType === 'helpful' || validated.reactionType === 'insightful') {
    // Get the author of the content
    let contentAuthorId: string | null = null;
    
    if (validated.targetType === 'post') {
      const [post] = await db
        .select()
        .from(communityPosts)
        .where(eq(communityPosts.id, validated.targetId))
        .limit(1);
      contentAuthorId = post?.userId || null;
    } else if (validated.targetType === 'comment') {
      const [comment] = await db
        .select()
        .from(communityComments)
        .where(eq(communityComments.id, validated.targetId))
        .limit(1);
      contentAuthorId = comment?.userId || null;
    }

    if (contentAuthorId) {
      await awardXPForHelpfulContent(contentAuthorId);
      await awardCoinsForHelpfulContent(contentAuthorId);
      await checkAndAwardAchievement(contentAuthorId, 'helpful_contributor');
      await checkAndAwardAchievement(contentAuthorId, 'community_leader');
    }
  }

  return { action: 'created', reaction };
}

export async function deleteReaction(reactionId: string) {
  const user = await requireAuth();
  
  const [existingReaction] = await db
    .select()
    .from(communityReactions)
    .where(eq(communityReactions.id, reactionId))
    .limit(1);

  if (!existingReaction) {
    throw new Error('Reaction not found');
  }

  if (existingReaction.userId !== user.id) {
    await requireCommunityPermission('moderate:content');
  }

  await db.delete(communityReactions).where(eq(communityReactions.id, reactionId));

  // Decrement reaction count
  if (existingReaction.targetType === 'post') {
    await decrementPostReactionCount(existingReaction.targetId);
  } else if (existingReaction.targetType === 'comment') {
    await decrementCommentReactionCount(existingReaction.targetId);
  }

  return { success: true };
}

export async function getReactionsByTarget(targetType: string, targetId: string) {
  await requireCommunityPermission('read:posts');
  
  const reactions = await db
    .select({
      reaction: communityReactions,
      user: {
        id: communityProfiles.id,
        displayName: communityProfiles.displayName,
        avatarUrl: communityProfiles.avatarUrl,
      },
    })
    .from(communityReactions)
    .innerJoin(communityProfiles, eq(communityReactions.userId, communityProfiles.userId))
    .where(and(
      eq(communityReactions.targetType, targetType as any),
      eq(communityReactions.targetId, targetId)
    ))
    .orderBy(desc(communityReactions.createdAt));

  return reactions;
}

export async function getUserReaction(targetType: string, targetId: string, userId: string) {
  const [reaction] = await db
    .select()
    .from(communityReactions)
    .where(and(
      eq(communityReactions.userId, userId),
      eq(communityReactions.targetType, targetType as any),
      eq(communityReactions.targetId, targetId)
    ))
    .limit(1);

  return reaction || null;
}

export async function getReactionStats(targetType: string, targetId: string) {
  await requireCommunityPermission('read:posts');
  
  const reactions = await db
    .select()
    .from(communityReactions)
    .where(and(
      eq(communityReactions.targetType, targetType as any),
      eq(communityReactions.targetId, targetId)
    ));

  const stats = reactions.reduce((acc, reaction) => {
    acc[reaction.reactionType] = (acc[reaction.reactionType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: reactions.length,
    byType: stats,
  };
}
