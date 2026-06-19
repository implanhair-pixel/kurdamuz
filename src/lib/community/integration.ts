import { db } from '@/db';
import { communityProfiles, userRewards, userWallets } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { 
  incrementPostCount, 
  incrementCommentCount, 
  incrementReputationScore,
  decrementReputationScore 
} from './profiles';
import { notifyAchievementUnlock } from './notifications';
import { awardXP } from '@/lib/xp/xp';

// ============================================================================
// XP INTEGRATION
// ============================================================================

export async function awardXPForPost(userId: string) {
  try {
    await awardXP(userId, 10, 'community_post');
    
    const profile = await getProfileByUserId(userId);
    if (profile) {
      await incrementPostCount(profile.id);
    }
  } catch (error) {
    console.error('Error awarding XP for post:', error);
  }
}

export async function awardXPForComment(userId: string) {
  try {
    await awardXP(userId, 5, 'community_comment');
    
    const profile = await getProfileByUserId(userId);
    if (profile) {
      await incrementCommentCount(profile.id);
    }
  } catch (error) {
    console.error('Error awarding XP for comment:', error);
  }
}

export async function awardXPForHelpfulContent(userId: string) {
  try {
    await awardXP(userId, 15, 'helpful_content');
    
    const profile = await getProfileByUserId(userId);
    if (profile) {
      await incrementReputationScore(profile.id, 5);
    }
  } catch (error) {
    console.error('Error awarding XP for helpful content:', error);
  }
}

// ============================================================================
// ACHIEVEMENT INTEGRATION
// ============================================================================

export async function checkAndAwardAchievement(userId: string, achievementType: string) {
  try {
    const [profile] = await db
      .select()
      .from(communityProfiles)
      .where(eq(communityProfiles.userId, userId))
      .limit(1);

    if (!profile) return;

    let achievementId: string | null = null;
    let achievementName: string | null = null;

    switch (achievementType) {
      case 'first_post':
        if (profile.postCount === 1) {
          achievementId = 'first_post';
          achievementName = 'First Post';
        }
        break;
      case 'first_comment':
        if (profile.commentCount === 1) {
          achievementId = 'first_comment';
          achievementName = 'First Comment';
        }
        break;
      case 'helpful_contributor':
        if ((profile.reputationScore ?? 0) >= 50) {
          achievementId = 'helpful_contributor';
          achievementName = 'Helpful Contributor';
        }
        break;
      case 'community_leader':
        if ((profile.reputationScore ?? 0) >= 100) {
          achievementId = 'community_leader';
          achievementName = 'Community Leader';
        }
        break;
      case 'active_member':
        if ((profile.postCount ?? 0) >= 10 && (profile.commentCount ?? 0) >= 20) {
          achievementId = 'active_member';
          achievementName = 'Active Member';
        }
        break;
    }

    if (achievementId && achievementName) {
      const [existingReward] = await db
        .select()
        .from(userRewards)
        .where(eq(userRewards.userId, userId))
        .limit(1);

      if (!existingReward) {
        await db.insert(userRewards).values({
          userId,
          rewardId: achievementId,
        });

        await notifyAchievementUnlock(userId, achievementId, achievementName);
      }
    }
  } catch (error) {
    console.error('Error checking/awarding achievement:', error);
  }
}

// ============================================================================
// COIN ECONOMY INTEGRATION
// ============================================================================

export async function awardCoinsForPost(userId: string) {
  try {
    await db
      .update(userWallets)
      .set({ 
        currentBalance: sql`${userWallets.currentBalance} + 5`,
        lifetimeEarned: sql`${userWallets.lifetimeEarned} + 5`,
        updatedAt: new Date(),
      })
      .where(eq(userWallets.userId, userId));
  } catch (error) {
    console.error('Error awarding coins for post:', error);
  }
}

export async function awardCoinsForHelpfulContent(userId: string) {
  try {
    await db
      .update(userWallets)
      .set({ 
        currentBalance: sql`${userWallets.currentBalance} + 3`,
        lifetimeEarned: sql`${userWallets.lifetimeEarned} + 3`,
        updatedAt: new Date(),
      })
      .where(eq(userWallets.userId, userId));
  } catch (error) {
    console.error('Error awarding coins for helpful content:', error);
  }
}

// ============================================================================
// LEARNING PATHS INTEGRATION
// ============================================================================

export async function linkPostToLearningPath(postId: string, learningPathId: string) {
  try {
    console.log(`Linking post ${postId} to learning path ${learningPathId}`);
  } catch (error) {
    console.error('Error linking post to learning path:', error);
  }
}

export async function getCommunityProgressForLearningPath(userId: string, learningPathId: string) {
  try {
    return {
      posts: 0,
      comments: 0,
      helpfulVotes: 0,
    };
  } catch (error) {
    console.error('Error getting community progress for learning path:', error);
    return {
      posts: 0,
      comments: 0,
      helpfulVotes: 0,
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getProfileByUserId(userId: string) {
  const [profile] = await db
    .select()
    .from(communityProfiles)
    .where(eq(communityProfiles.userId, userId))
    .limit(1);

  return profile || null;
}
