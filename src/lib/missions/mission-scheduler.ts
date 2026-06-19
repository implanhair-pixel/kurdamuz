import { db } from '@/db';
import { missionDefinitions, missionSchedules, userMissions } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { missionEngine } from './mission-engine';

export class MissionScheduler {
  /**
   * Schedule a mission for publication
   */
  async scheduleMission(
    missionId: string,
    startAt: Date,
    endAt: Date,
    resetPolicy: 'daily' | 'weekly' | 'custom'
  ): Promise<string> {
    const schedule = await db
      .insert(missionSchedules)
      .values({
        missionId,
        startAt,
        endAt,
        resetPolicy,
        status: 'scheduled',
      })
      .returning();

    return schedule[0].id;
  }

  /**
   * Activate a scheduled mission
   */
  async activateMission(scheduleId: string): Promise<void> {
    await db
      .update(missionSchedules)
      .set({ status: 'active' })
      .where(eq(missionSchedules.id, scheduleId));
  }

  /**
   * Deactivate a mission
   */
  async deactivateMission(scheduleId: string): Promise<void> {
    await db
      .update(missionSchedules)
      .set({ status: 'completed' })
      .where(eq(missionSchedules.id, scheduleId));
  }

  /**
   * Get active missions
   */
  async getActiveMissions(): Promise<any[]> {
    const now = new Date();
    
    const active = await db
      .select({
        definition: missionDefinitions,
        schedule: missionSchedules,
      })
      .from(missionSchedules)
      .innerJoin(missionDefinitions, eq(missionSchedules.missionId, missionDefinitions.id))
      .where(
        and(
          eq(missionSchedules.status, 'active'),
          gte(missionSchedules.startAt, now),
          lte(missionSchedules.endAt, now)
        )
      );

    return active;
  }

  /**
   * Perform daily reset for missions
   * This is called by the Supabase Edge Function cron job
   */
  async performDailyReset(): Promise<void> {
    console.log('Performing daily mission reset...');

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Deactivate missions that ended yesterday
    await db
      .update(missionSchedules)
      .set({ status: 'completed' })
      .where(
        and(
          eq(missionSchedules.status, 'active'),
          lte(missionSchedules.endAt, yesterday)
        )
      );

    // Activate missions scheduled for today
    await db
      .update(missionSchedules)
      .set({ status: 'active' })
      .where(
        and(
          eq(missionSchedules.status, 'scheduled'),
          gte(missionSchedules.startAt, now),
          lte(missionSchedules.endAt, now)
        )
      );

    // Reset user missions for daily missions
    const dailySchedules = await db
      .select()
      .from(missionSchedules)
      .where(
        and(
          eq(missionSchedules.status, 'active'),
          eq(missionSchedules.resetPolicy, 'daily')
        )
      );

    for (const schedule of dailySchedules) {
      // Reset progress for all users who have this mission
      await db
        .update(userMissions)
        .set({
          progressValue: 0,
          completionStatus: 'not_started',
          xpAwarded: 0,
          coinAwarded: 0,
          completedAt: null,
        })
        .where(
          and(
            eq(userMissions.missionId, schedule.missionId),
            eq(userMissions.completionStatus, 'completed')
          )
        );
    }

    console.log('Daily mission reset completed successfully!');
  }

  /**
   * Generate daily missions for a user
   */
  async generateDailyMissionsForUser(userId: string): Promise<void> {
    const availableMissions = await missionEngine.getAvailableMissions(userId);
    
    for (const mission of availableMissions) {
      // Only assign missions that the user doesn't already have
      const existing = await db
        .select()
        .from(userMissions)
        .where(
          and(
            eq(userMissions.userId, userId),
            eq(userMissions.missionId, mission.id)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        await missionEngine.assignMission(userId, mission.id);
      }
    }
  }
}

export const missionScheduler = new MissionScheduler();
