import { db } from '@/db';
import { missionDefinitions, missionSchedules, userMissions, userLevels } from '@/db/schema';
import { eq, and, gte, lte, lt, desc } from 'drizzle-orm';
import { missionEngine } from './mission-engine';

export class MissionScheduler {
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

  async activateMission(scheduleId: string): Promise<void> {
    await db
      .update(missionSchedules)
      .set({ status: 'active' })
      .where(eq(missionSchedules.id, scheduleId));
  }

  async deactivateMission(scheduleId: string): Promise<void> {
    await db
      .update(missionSchedules)
      .set({ status: 'completed' })
      .where(eq(missionSchedules.id, scheduleId));
  }

  async getActiveMissions(): Promise<any[]> {
    const now = new Date();

    return await db
      .select({
        definition: missionDefinitions,
        schedule: missionSchedules,
      })
      .from(missionSchedules)
      .innerJoin(missionDefinitions, eq(missionSchedules.missionId, missionDefinitions.id))
      .where(
        and(
          eq(missionSchedules.status, 'active'),
          eq(missionDefinitions.active, true),
          lte(missionSchedules.startAt, now),
          gte(missionSchedules.endAt, now)
        )
      )
      .orderBy(desc(missionSchedules.createdAt));
  }

  async performDailyReset(): Promise<{
    deactivated: number;
    activated: number;
    resetMissions: number;
  }> {
    const now = new Date();

    const deactivated = await db
      .update(missionSchedules)
      .set({ status: 'completed' })
      .where(
        and(
          eq(missionSchedules.status, 'active'),
          lt(missionSchedules.endAt, now)
        )
      )
      .returning({ id: missionSchedules.id });

    const activated = await db
      .update(missionSchedules)
      .set({ status: 'active' })
      .where(
        and(
          eq(missionSchedules.status, 'scheduled'),
          lte(missionSchedules.startAt, now),
          gte(missionSchedules.endAt, now)
        )
      )
      .returning({ id: missionSchedules.id });

    const dailySchedules = await db
      .select()
      .from(missionSchedules)
      .where(
        and(
          eq(missionSchedules.status, 'active'),
          eq(missionSchedules.resetPolicy, 'daily')
        )
      );

    let resetMissions = 0;

    for (const schedule of dailySchedules) {
      const updated = await db
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
        )
        .returning({ id: userMissions.id });

      resetMissions += updated.length;
    }

    return {
      deactivated: deactivated.length,
      activated: activated.length,
      resetMissions,
    };
  }

  async generateDailyMissionsForUser(userId: string): Promise<number> {
    const availableMissions = await missionEngine.getAvailableMissions(userId);
    let assignedCount = 0;

    for (const mission of availableMissions) {
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
        assignedCount += 1;
      }
    }

    return assignedCount;
  }

  async getCandidateUserIds(limit = 500): Promise<string[]> {
    const rows = await db
      .select({ userId: userLevels.userId })
      .from(userLevels)
      .orderBy(desc(userLevels.updatedAt))
      .limit(limit);

    return rows.map((row) => row.userId);
  }
}

export const missionScheduler = new MissionScheduler();
