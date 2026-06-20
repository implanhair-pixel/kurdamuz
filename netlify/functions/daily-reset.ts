import type { Config } from '@netlify/functions';
import * as Sentry from '@sentry/nextjs';
import { missionScheduler } from '@/lib/missions/mission-scheduler';
import { cleanupOldNotifications } from '@/lib/notification-queue';

export const config: Config = {
  schedule: '15 0 * * *',
};

export default async function handler() {
  const startTime = Date.now();

  try {
    Sentry.captureMessage('Daily reset operations started', 'info');
    console.log('Daily reset operations started');

    const missionResult = await missionScheduler.performDailyReset();
    const notificationsCleaned = await cleanupOldNotifications();

    const duration = Date.now() - startTime;
    console.log(`Daily reset completed in ${duration}ms`);
    Sentry.captureMessage(`Daily reset completed in ${duration}ms`, 'info');

    return {
      success: true,
      missionResult,
      notificationsCleaned,
      duration,
    };
  } catch (error) {
    console.error('Daily reset error:', error);
    Sentry.captureException(error);
    throw error;
  }
}
