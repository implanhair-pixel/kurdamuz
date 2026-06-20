// src/lib/challenges/scheduler.ts
import { db } from '@/db';
import { challengeSchedules, challengeDefinitions } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { logChallengeSchedulePublished } from './audit';

export async function activateScheduledChallenges(): Promise<number> {
  try {
    const now = new Date();
    
    const schedulesToActivate = await db.query.challengeSchedules.findMany({
      where: and(
        eq(challengeSchedules.status, 'scheduled'),
        eq(challengeSchedules.publicationStatus, 'approved'),
      ),
    });

    let activated = 0;
    for (const schedule of schedulesToActivate) {
      await db
        .update(challengeSchedules)
        .set({ status: 'active' })
        .where(eq(challengeSchedules.id, schedule.id));
      activated++;
    }

    return activated;
  } catch (error) {
    console.error('Error activating scheduled challenges:', error);
    throw error;
  }
}

export async function deactivateExpiredChallenges(): Promise<number> {
  try {
    const now = new Date();

    const schedulesToDeactivate = await db.query.challengeSchedules.findMany({
      where: eq(challengeSchedules.status, 'active'),
    });

    let deactivated = 0;
    for (const schedule of schedulesToDeactivate) {
      if (schedule.endDate && schedule.endDate < now) {
        await db
          .update(challengeSchedules)
          .set({ status: 'completed' })
          .where(eq(challengeSchedules.id, schedule.id));
        deactivated++;
      }
    }

    return deactivated;
  } catch (error) {
    console.error('Error deactivating expired challenges:', error);
    throw error;
  }
}

export async function publishChallenge(scheduleId: string, actorId: string): Promise<void> {
  try {
    await db
      .update(challengeSchedules)
      .set({ publicationStatus: 'approved' })
      .where(eq(challengeSchedules.id, scheduleId));

    await logChallengeSchedulePublished(scheduleId, actorId);
  } catch (error) {
    console.error('Error publishing challenge:', error);
    throw error;
  }
}

export async function scheduleChallenge(
  definitionId: string,
  scheduledDate: Date,
  scheduledTime: Date,
  endDate?: Date,
  timezone: string = 'UTC'
): Promise<any> {
  try {
    const [schedule] = await (db.insert(challengeSchedules) as any).values({
      challengeDefinitionId: definitionId,
      scheduledDate: scheduledDate.toISOString().split('T')[0] as any,
      scheduledTime: scheduledTime.toISOString() as any,
      endDate: endDate?.toISOString() as any,
      timezone,
      status: 'scheduled',
      publicationStatus: 'pending',
    }).returning();

    return schedule;
  } catch (error) {
    console.error('Error scheduling challenge:', error);
    throw error;
  }
}
