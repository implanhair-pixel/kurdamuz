import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { srsReviewQueues, srsEvents } from '@/db/schema';
import { eq, sql, desc, gte, and } from 'drizzle-orm';

/**
 * GET /api/admin/srs/system-health
 * SRS system health check
 * Auth: Admin role required
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Verify admin role from authentication
    // For now, this endpoint is open for development

    // Check database connectivity
    let databaseStatus = 'healthy';
    let databaseLatency = 0;

    try {
      const startTime = Date.now();
      await db.select({ count: sql<number>`count(*)` }).from(srsReviewQueues).limit(1);
      databaseLatency = Date.now() - startTime;
    } catch (error) {
      databaseStatus = 'unhealthy';
      console.error('Database connectivity check failed:', error);
    }

    // Check queue generation status
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const [recentQueueResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(srsReviewQueues)
      .where(gte(srsReviewQueues.generatedAt, oneHourAgo));

    const recentQueueCount = recentQueueResult?.count || 0;
    const queueGenerationStatus = recentQueueCount > 0 ? 'healthy' : 'warning';

    // Get recent errors from events
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

    // Overall health status
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
          latency: databaseLatency, // in milliseconds
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
    console.error('Error fetching system health:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Failed to fetch system health',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
