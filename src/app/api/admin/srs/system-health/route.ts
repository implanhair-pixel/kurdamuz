import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { srsReviewQueues, srsEvents } from '@/db/schema';
import { sql, gte, and } from 'drizzle-orm';
import { requireMinRole } from '@/lib/auth';

/**
 * GET /api/admin/srs/system-health
 * SRS system health check
 * Auth: Admin role required
 */
export async function GET(_request: NextRequest) {
  try {
    await requireMinRole('admin_super');

    let databaseStatus: 'healthy' | 'unhealthy' = 'healthy';
    let databaseLatency = 0;

    try {
      const startTime = Date.now();
      await db.select({ count: sql<number>`count(*)` }).from(srsReviewQueues).limit(1);
      databaseLatency = Date.now() - startTime;
    } catch (error) {
      databaseStatus = 'unhealthy';
      console.error('Database connectivity check failed:', error);
    }

    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const [recentQueueResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(srsReviewQueues)
      .where(gte(srsReviewQueues.generatedAt, oneHourAgo));

    const recentQueueCount = recentQueueResult?.count || 0;
    const queueGenerationStatus = recentQueueCount > 0 ? 'healthy' : 'warning';

    const fifteenMinutesAgo = new Date();
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

    const [recentErrorsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(srsEvents)
      .where(
        and(
          gte(srsEvents.createdAt, fifteenMinutesAgo),
          sql<string>`event_type LIKE '%error%' OR event_type LIKE '%fail%'`
        )
      );

    const recentErrorCount = recentErrorsResult?.count || 0;
    const errorStatus = recentErrorCount === 0 ? 'healthy' : recentErrorCount < 5 ? 'warning' : 'unhealthy';

    const overallStatus =
      databaseStatus === 'healthy' &&
      queueGenerationStatus === 'healthy' &&
      errorStatus === 'healthy'
        ? 'healthy'
        : databaseStatus === 'unhealthy' || errorStatus === 'unhealthy'
        ? 'unhealthy'
        : 'warning';

    return NextResponse.json({
      status: overallStatus,
      components: {
        database: {
          status: databaseStatus,
          latency: databaseLatency,
        },
        queueGeneration: {
          status: queueGenerationStatus,
          recentQueues: recentQueueCount,
        },
        errorMonitoring: {
          status: errorStatus,
          recentErrors: recentErrorCount,
        },
      },
      checks: {
        databaseConnectivity: databaseStatus === 'healthy',
        queueGenerationActive: recentQueueCount > 0,
        errorRateAcceptable: recentErrorCount < 5,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const status = error instanceof Error && error.message.includes('Forbidden') ? 403 : error instanceof Error && error.message === 'Unauthorized' ? 401 : 500;
    console.error('Error fetching system health:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Failed to fetch system health',
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }
}
