import { NextResponse } from 'next/server';
import { validateCronSecret } from '@/lib/cron-validation';
import { missionScheduler } from '@/lib/missions/mission-scheduler';
import * as Sentry from '@sentry/nextjs';

const BATCH_SIZE = 100;

export async function GET() {
  const startTime = Date.now();

  try {
    await validateCronSecret();

    Sentry.captureMessage('Daily missions generation started', 'info');

    const candidateUsers = await missionScheduler.getCandidateUserIds(1000);
    let usersProcessed = 0;
    let missionsAssigned = 0;

    for (let i = 0; i < candidateUsers.length; i += BATCH_SIZE) {
      const batch = candidateUsers.slice(i, i + BATCH_SIZE);
      for (const userId of batch) {
        missionsAssigned += await missionScheduler.generateDailyMissionsForUser(userId);
        usersProcessed += 1;
      }
    }

    const duration = Date.now() - startTime;
    Sentry.captureMessage(
      `Daily missions generated for ${usersProcessed} users (${missionsAssigned} missions) in ${duration}ms`,
      'info'
    );

    return NextResponse.json({
      success: true,
      usersProcessed,
      missionsAssigned,
      duration,
    });
  } catch (error) {
    console.error('Daily missions error:', error);
    Sentry.captureException(error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate daily missions' },
      { status: 500 }
    );
  }
}
