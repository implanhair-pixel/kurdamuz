import type { Config } from '@netlify/functions';
import * as Sentry from '@sentry/nextjs';
import { missionScheduler } from '@/lib/missions/mission-scheduler';

const BATCH_SIZE = 100;

export const config: Config = {
  schedule: '10 0 * * *',
};

export default async function handler() {
  const startTime = Date.now();

  try {
    Sentry.captureMessage('Daily missions generation started', 'info');
    console.log('Daily missions generation started');

    const candidateUsers = await missionScheduler.getCandidateUserIds(1000);
    let usersProcessed = 0;
    let missionsGenerated = 0;

    for (let i = 0; i < candidateUsers.length; i += BATCH_SIZE) {
      const batch = candidateUsers.slice(i, i + BATCH_SIZE);
      for (const userId of batch) {
        missionsGenerated += await missionScheduler.generateDailyMissionsForUser(userId);
        usersProcessed += 1;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`Daily missions generated. ${missionsGenerated} missions in ${duration}ms`);
    Sentry.captureMessage(`Daily missions generated: ${missionsGenerated} missions in ${duration}ms`, 'info');

    return {
      success: true,
      message: 'Daily missions generated',
      usersProcessed,
      missionsGenerated,
      duration,
    };
  } catch (error) {
    console.error('Daily missions error:', error);
    Sentry.captureException(error);
    throw error;
  }
}
