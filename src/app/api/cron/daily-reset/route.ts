import { NextResponse } from 'next/server';
import { validateCronSecret } from '@/lib/cron-validation';
import { missionScheduler } from '@/lib/missions/mission-scheduler';
import { cleanupOldNotifications } from '@/lib/notification-queue';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  const startTime = Date.now();

  try {
    await validateCronSecret();

    Sentry.captureMessage('Daily reset operations started', 'info');

    const missionResult = await missionScheduler.performDailyReset();
    const notificationsCleaned = await cleanupOldNotifications();

    const duration = Date.now() - startTime;
    Sentry.captureMessage(`Daily reset completed in ${duration}ms`, 'info');

    return NextResponse.json({
      success: true,
      missionResult,
      notificationsCleaned,
      duration,
    });
  } catch (error) {
    console.error('Daily reset error:', error);
    Sentry.captureException(error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to perform daily reset' },
      { status: 500 }
    );
  }
}
