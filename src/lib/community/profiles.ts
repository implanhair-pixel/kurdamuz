import { db } from '@/db';
import { communityProfiles, communityPosts, communityComments, userLevels } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { createProfileSchema, updateProfileSchema } from './validations';
import { requireCommunityPermission, requireAuth, requireOwnership } from '@/lib/auth';
import { randomUUID } from 'crypto';
import { paginateCommunityPosts } from '@/lib/pagination';
import { cachedFetch, generateCacheKey } from '@/lib/cache';

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export async function createProfile(input: CreateProfileInput) {
  const user = await requireCommunityPermission('update:own_profile');
  
  const validated = createProfileSchema.parse(input);
  
  // Check if profile already exists
  const [existingProfile] = await db
    .select()
    .from(communityProfiles)
    .where(eq(communityProfiles.userId, user.id))
    .limit(1);

  if (existingProfile) {
    throw new Error('Profile already exists');
  }
  
  const [profile] = await db.insert(communityProfiles).values({
    id: randomUUID(),
    userId: user.id,
    displayName: validated.displayName,
    bio: validated.bio || null,
    avatarUrl: validated.avatarUrl || null,
    reputationScore: 0,
    postCount: 0,
    commentCount: 0,
  }).returning();

  return profile;
}

export async function getProfileByUserId(userId: string) {
  await requireCommunityPermission('read:profiles');
  
  const [profile] = await db
    .select()
    .from(communityProfiles)
    .where(eq(communityProfiles.userId, userId))
    .limit(1);

  if (!profile) {
    throw new Error('Profile not found');
  }

  return profile;
}

/**
 * Same lookup as getProfileByUserId, but auto-creates a default profile
 * instead of throwing when one doesn't exist yet. Brand-new signups have
 * no community_profiles row, so any caller (e.g. the dashboard) that needs
 * a profile to always be present should use this instead of
 * getProfileByUserId, which intentionally throws for other call sites that
 * treat "no profile" as an error condition.
 */
export async function getOrCreateProfileByUserId(userId: string, fallbackDisplayName?: string) {
  await requireCommunityPermission('read:profiles');

  const [existing] = await db
    .select()
    .from(communityProfiles)
    .where(eq(communityProfiles.userId, userId))
    .limit(1);

  if (existing) return existing;

  const [created] = await db.insert(communityProfiles).values({
    id: randomUUID(),
    userId,
    displayName: fallbackDisplayName || 'Learner',
    bio: null,
    avatarUrl: null,
    reputationScore: 0,
    postCount: 0,
    commentCount: 0,
  }).returning();

  return created;
}

export async function getProfileById(profileId: string) {
  await requireCommunityPermission('read:profiles');
  
  const [profile] = await db
    .select()
    .from(communityProfiles)
    .where(eq(communityProfiles.id, profileId))
    .limit(1);

  if (!profile) {
    throw new Error('Profile not found');
  }

  return profile;
}

export async function updateProfile(profileId: string, input: UpdateProfileInput) {
  const user = await requireAuth();
  
  const validated = updateProfileSchema.parse(input);
  
  // Check ownership or admin permission
  await requireOwnership('profile', profileId);
  
  const [updatedProfile] = await db
    .update(communityProfiles)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(eq(communityProfiles.id, profileId))
    .returning();

  return updatedProfile;
}

export async function getProfileStats(profileId: string) {
  await requireCommunityPermission('read:profiles');
  
  const [profile] = await db
    .select()
    .from(communityProfiles)
    .where(eq(communityProfiles.id, profileId))
    .limit(1);

  if (!profile) {
    throw new Error('Profile not found');
  }

  // Get user level info
  const [userLevel] = await db
    .select()
    .from(userLevels)
    .where(eq(userLevels.userId, profile.userId))
    .limit(1);

  return {
    profile,
    level: userLevel || null,
  };
}

export async function getUserPosts(userId: string, params: {
  page?: number;
  limit?: number;
  cursor?: string | null;
}) {
  await requireCommunityPermission('read:posts');
  
  const { limit = 20, cursor } = params;

  // Generate cache key
  const cacheKey = generateCacheKey('user_posts', { userId, limit, cursor });

  // Use cached fetch with bounded queries (max 50 items)
  const boundedLimit = Math.min(limit, 50);
  
  return await cachedFetch(
    cacheKey,
    async () => {
      const result = await paginateCommunityPosts({ limit: boundedLimit, cursor }, userId);
      return result.items;
    },
    { ttl: 300, tags: [`user:${userId}`] } // 5 minute cache
  );
}

export async function getUserComments(userId: string, params: {
  page?: number;
  limit?: number;
}) {
  await requireCommunityPermission('read:comments');
  
  const { page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  const comments = await db
    .select()
    .from(communityComments)
    .where(and(
      eq(communityComments.userId, userId),
      eq(communityComments.status, 'published')
    ))
    .orderBy(desc(communityComments.createdAt))
    .limit(limit)
    .offset(offset);

  return comments;
}

export async function incrementPostCount(profileId: string) {
  await db
    .update(communityProfiles)
    .set({ 
      postCount: sql`${communityProfiles.postCount} + 1` 
    })
    .where(eq(communityProfiles.id, profileId));
}

export async function incrementCommentCount(profileId: string) {
  await db
    .update(communityProfiles)
    .set({ 
      commentCount: sql`${communityProfiles.commentCount} + 1` 
    })
    .where(eq(communityProfiles.id, profileId));
}

export async function incrementReputationScore(profileId: string, amount: number = 1) {
  await db
    .update(communityProfiles)
    .set({ 
      reputationScore: sql`${communityProfiles.reputationScore} + ${amount}` 
    })
    .where(eq(communityProfiles.id, profileId));
}

export async function decrementReputationScore(profileId: string, amount: number = 1) {
  await db
    .update(communityProfiles)
    .set({ 
      reputationScore: sql`GREATEST(${communityProfiles.reputationScore} - ${amount}, 0)` 
    })
    .where(eq(communityProfiles.id, profileId));
}
