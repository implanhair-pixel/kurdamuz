// src/lib/challenges/leaderboard.ts
import { db } from '@/db';
import { challengeLeaderboards, challengeScores, challengeSchedules } from '@/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { logLeaderboardUpdated } from './audit';

export async function calculateLeaderboard(scheduleId: string): Promise<void> {
  try {
    const allScores = await db
      .select()
      .from(challengeScores)
      .where(eq(challengeScores.scheduleId, scheduleId))
      .orderBy(desc(challengeScores.finalScore));

    for (let i = 0; i < allScores.length; i++) {
      const score = allScores[i];
      const rank = i + 1;

      const previousEntry = await db.query.challengeLeaderboards.findFirst({
        where: and(
          eq(challengeLeaderboards.scheduleId, scheduleId),
          eq(challengeLeaderboards.userId, score.userId)
        ),
      });

      const previousRank = previousEntry?.rank;
      const change = previousRank ? previousRank - rank : 0;

      if (previousEntry) {
        await db
          .update(challengeLeaderboards)
          .set({
            score: score.finalScore,
            rank,
            previousRank,
            change,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(challengeLeaderboards.scheduleId, scheduleId),
              eq(challengeLeaderboards.userId, score.userId)
            )
          );

        await logLeaderboardUpdated(previousEntry.id, score.userId, {
          previousRank,
          rank,
          score: score.finalScore,
          change,
        });
      } else {
        const [newEntry] = await db.insert(challengeLeaderboards).values({
          scheduleId,
          userId: score.userId,
          leaderboardType: 'challenge',
          scope: 'global',
          score: score.finalScore,
          rank,
          previousRank,
          change,
        }).returning();

        await logLeaderboardUpdated(newEntry.id, score.userId, {
          previousRank: null,
          rank,
          score: score.finalScore,
          change,
        });
      }
    }
  } catch (error) {
    console.error('Error calculating leaderboard:', error);
    throw error;
  }
}

export async function getLeaderboard(
  scheduleId: string,
  limit: number = 50,
  offset: number = 0
): Promise<any[]> {
  try {
    const leaderboard = await db
      .select({
        entry: challengeLeaderboards,
      })
      .from(challengeLeaderboards)
      .where(eq(challengeLeaderboards.scheduleId, scheduleId))
      .orderBy(asc(challengeLeaderboards.rank))
      .limit(limit)
      .offset(offset);

    return leaderboard.map((l) => l.entry);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
}

export async function getUserLeaderboardPosition(
  scheduleId: string,
  userId: string
): Promise<any> {
  try {
    const position = await db.query.challengeLeaderboards.findFirst({
      where: and(
        eq(challengeLeaderboards.scheduleId, scheduleId),
        eq(challengeLeaderboards.userId, userId)
      ),
    });

    return position;
  } catch (error) {
    console.error('Error fetching user leaderboard position:', error);
    throw error;
  }
}

export async function calculateDailyLeaderboard(): Promise<void> {
  try {
    const activeSchedules = await db.query.challengeSchedules.findMany({
      where: and(
        eq(challengeSchedules.status, 'active'),
      ),
    });

    for (const schedule of activeSchedules) {
      await calculateLeaderboard(schedule.id);
    }
  } catch (error) {
    console.error('Error calculating daily leaderboard:', error);
    throw error;
  }
}

export async function calculateWeeklyLeaderboard(): Promise<void> {
  try {
    const weekSchedules = await db.query.challengeSchedules.findMany({
      where: and(
        eq(challengeSchedules.status, 'completed')
      ),
    });

    for (const schedule of weekSchedules) {
      await calculateLeaderboard(schedule.id);
    }
  } catch (error) {
    console.error('Error calculating weekly leaderboard:', error);
    throw error;
  }
}

export async function calculateMonthlyLeaderboard(): Promise<void> {
  try {
    const monthSchedules = await db.query.challengeSchedules.findMany({
      where: and(
        eq(challengeSchedules.status, 'completed')
      ),
    });

    for (const schedule of monthSchedules) {
      await calculateLeaderboard(schedule.id);
    }
  } catch (error) {
    console.error('Error calculating monthly leaderboard:', error);
    throw error;
  }
}
