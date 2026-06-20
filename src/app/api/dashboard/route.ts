import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getOrCreateProfileByUserId, getUserPosts, getUserComments } from '@/lib/community/profiles';
import { getNotifications, getUnreadCount } from '@/lib/community/notifications';
import { db } from '@/db';
import { userLevels, userStreaks, userMissions, achievements, userAchievements, xpTransactions } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getLeaderboardWithUserPosition } from '@/lib/xp/analytics';

// Small helper so a single failing subsystem (e.g. missions table empty,
// notifications service down) can't 500 the entire dashboard. Each data
// source degrades to a safe fallback instead.
async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    console.error('Dashboard data source failed, using fallback:', err);
    return fallback;
  }
}

type CommunityProfile = Awaited<ReturnType<typeof getOrCreateProfileByUserId>>;
type UserPosts = Awaited<ReturnType<typeof getUserPosts>>;
type UserComments = Awaited<ReturnType<typeof getUserComments>>;
type Notifications = Awaited<ReturnType<typeof getNotifications>>;
type UserLevelRow = typeof userLevels.$inferSelect;
type UserStreakRow = typeof userStreaks.$inferSelect;
type UserMissionRow = typeof userMissions.$inferSelect;
type XPTransactionRow = typeof xpTransactions.$inferSelect;
type UserAchievementRow = typeof userAchievements.$inferSelect;

export async function GET() {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Learner';

  // Fetch all dashboard data in parallel. Each source is wrapped so a
  // failure in one (e.g. brand-new user with no posts/missions yet)
  // never breaks the whole dashboard response.
  const [
    profile,
    posts,
    comments,
    notifications,
    unreadCount,
    userLevel,
    userStreak,
    activeMissions,
  ] = await Promise.all([
    safe(getOrCreateProfileByUserId(user.id, userName), {
      displayName: userName,
      avatarUrl: null,
      bio: null,
      postCount: 0,
      commentCount: 0,
      reputationScore: 0,
    } as CommunityProfile),
    safe(getUserPosts(user.id, { page: 1, limit: 5 }), [] as UserPosts),
    safe(getUserComments(user.id, { page: 1, limit: 5 }), [] as UserComments),
    safe(getNotifications({ page: 1, limit: 5 }), [] as Notifications),
    safe(getUnreadCount(), 0),
    safe(db.select().from(userLevels).where(eq(userLevels.userId, user.id)).limit(1), [] as UserLevelRow[]),
    safe(db.select().from(userStreaks).where(eq(userStreaks.userId, user.id)).limit(1), [] as UserStreakRow[]),
    safe(
      db.select().from(userMissions).where(
        and(
          eq(userMissions.userId, user.id),
          eq(userMissions.completionStatus, 'in_progress')
        )
      ).limit(3),
      [] as UserMissionRow[]
    ),
  ]);

  const level = userLevel[0] || null;
  const streak = userStreak[0] || null;

  // Fetch leaderboard position (weekly timeframe)
  const leaderboardPosition = await safe(
    getLeaderboardWithUserPosition(user.id, 'weekly', 50),
    null
  );

  // Fetch active daily challenge for user
  const activeDailyMissions = await safe(
    db.select().from(userMissions)
      .where(and(
        eq(userMissions.userId, user.id),
        eq(userMissions.completionStatus, 'in_progress')
      ))
      .limit(1),
    [] as UserMissionRow[]
  );

  const dailyChallenge = activeDailyMissions.length > 0
    ? {
        id: activeDailyMissions[0].id,
        missionId: activeDailyMissions[0].missionId,
        progressValue: activeDailyMissions[0].progressValue,
        targetValue: activeDailyMissions[0].targetValue || 1,
        completionStatus: activeDailyMissions[0].completionStatus,
      }
    : null;

  // Fetch achievement summary
  const achievementSummary = await safe(
    Promise.all([
      db.select().from(achievements),
      db.select().from(userAchievements).where(eq(userAchievements.userId, user.id)),
    ]).then(([allAchievements, userAchievs]) => {
      const typedUserAchievements = userAchievs as UserAchievementRow[];
      const recentAchievs = typedUserAchievements
        .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
        .slice(0, 3)
        .map((ua) => {
          const ach = allAchievements.find((a) => a.id === ua.achievementId);
          return {
            id: ua.id,
            title: ach?.name || 'Unknown',
            unlockedAt: ua.unlockedAt,
          };
        });
      return {
        totalAchievements: allAchievements.length,
        earnedAchievements: typedUserAchievements.length,
        recentAchievements: recentAchievs,
      };
    }),
    {
      totalAchievements: 0,
      earnedAchievements: 0,
      recentAchievements: [],
    }
  );

  return NextResponse.json({
    profile: {
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      postCount: profile.postCount,
      commentCount: profile.commentCount,
      reputationScore: profile.reputationScore,
    },
    // null here means "no level record yet" — the UI must render a
    // sensible zero-state (Level 1 / 0 XP) rather than crash or show
    // hardcoded placeholder numbers.
    xpAndLevel: level ? {
      currentLevel: level.currentLevel,
      currentXP: level.currentXP,
      xpToNextLevel: level.xpToNextLevel,
      totalXP: level.totalXP,
    } : null,
    currentStreak: streak ? {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActivityDate: streak.lastActivityDate,
    } : null,
    activeMissions: activeMissions.map((mission) => ({
      id: mission.id,
      missionId: mission.missionId,
      progressValue: mission.progressValue,
      completionStatus: mission.completionStatus,
      xpAwarded: mission.xpAwarded,
      coinAwarded: mission.coinAwarded,
    })),
    achievementSummary,
    leaderboardPosition,
    dailyChallenge,
    recentPosts: posts,
    recentComments: comments,
    notifications,
    unreadCount,
  });
}
