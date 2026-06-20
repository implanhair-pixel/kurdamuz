import type { Config } from '@netlify/functions';
import * as Sentry from '@sentry/nextjs';
import { db } from '@/db';
import { communityProfiles, userLevels, userStreaks } from '@/db/schema';
import { desc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const BATCH_SIZE = 100; // Process 100 users per batch to stay under 60s timeout
const TOP_N = 100; // Only store top 100 users per leaderboard

export const config: Config = {
  schedule: '0 * * * *', // Every 1 hour
};

export default async function handler() {
  const startTime = Date.now();
  
  try {
    Sentry.captureMessage('Leaderboard refresh started', 'info');
    console.log('Leaderboard refresh started');
    
    // XP Leaderboard (all time)
    const xpLeaderboard = await db
      .select({
        userId: userLevels.userId,
        totalXP: userLevels.totalXP,
      })
      .from(userLevels)
      .orderBy(desc(userLevels.totalXP))
      .limit(TOP_N);
    
    // Insert XP leaderboard
    for (let i = 0; i < xpLeaderboard.length; i++) {
      const entry = xpLeaderboard[i];
      await db.execute(sql`
        INSERT INTO precomputed_leaderboards (id, leaderboard_type, time_period, rank, user_id, score, computed_at, valid_until)
        VALUES (${randomUUID()}, 'xp', 'all_time', ${i + 1}, ${entry.userId}, ${entry.totalXP}, NOW(), NOW() + INTERVAL '1 hour')
        ON CONFLICT DO NOTHING
      `);
    }
    
    // Streak Leaderboard (all time)
    const streakLeaderboard = await db
      .select({
        userId: userStreaks.userId,
        longestStreak: userStreaks.longestStreak,
      })
      .from(userStreaks)
      .orderBy(desc(userStreaks.longestStreak))
      .limit(TOP_N);
    
    // Insert Streak leaderboard
    for (let i = 0; i < streakLeaderboard.length; i++) {
      const entry = streakLeaderboard[i];
      await db.execute(sql`
        INSERT INTO precomputed_leaderboards (id, leaderboard_type, time_period, rank, user_id, score, computed_at, valid_until)
        VALUES (${randomUUID()}, 'streak', 'all_time', ${i + 1}, ${entry.userId}, ${entry.longestStreak}, NOW(), NOW() + INTERVAL '1 hour')
        ON CONFLICT DO NOTHING
      `);
    }
    
    // Reputation Leaderboard (all time)
    const reputationLeaderboard = await db
      .select({
        userId: communityProfiles.userId,
        reputationScore: communityProfiles.reputationScore,
      })
      .from(communityProfiles)
      .orderBy(desc(communityProfiles.reputationScore))
      .limit(TOP_N);
    
    // Insert Reputation leaderboard
    for (let i = 0; i < reputationLeaderboard.length; i++) {
      const entry = reputationLeaderboard[i];
      await db.execute(sql`
        INSERT INTO precomputed_leaderboards (id, leaderboard_type, time_period, rank, user_id, score, computed_at, valid_until)
        VALUES (${randomUUID()}, 'reputation', 'all_time', ${i + 1}, ${entry.userId}, ${entry.reputationScore}, NOW(), NOW() + INTERVAL '1 hour')
        ON CONFLICT DO NOTHING
      `);
    }
    
    // Clean up expired entries
    await db.execute(sql`
      DELETE FROM precomputed_leaderboards WHERE valid_until < NOW()
    `);
    
    const processedCount = xpLeaderboard.length + streakLeaderboard.length + reputationLeaderboard.length;
    
    console.log(`Leaderboard refresh completed. Processed ${processedCount} entries in ${Date.now() - startTime}ms`);
    Sentry.captureMessage(`Leaderboard refresh completed: ${processedCount} entries in ${Date.now() - startTime}ms`, 'info');
    
    return {
      success: true,
      message: 'Leaderboard refresh completed',
      processedCount,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Leaderboard refresh error:', error);
    Sentry.captureException(error);
    throw error;
  }
}
