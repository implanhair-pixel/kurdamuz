import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { srsReviewQueues, srsReviews, srsEvents } from '@/db/schema';
import { eq, sql, desc, gte, and } from 'drizzle-orm';

/**
 * GET /api/admin/srs/performance
 * Scheduler performance metrics
 * Auth: Admin role required
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Verify admin role from authentication
    // For now, this endpoint is open for development

    // Get queue generation performance (last 24 hours)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const recentQueues = await db
      .select({
        totalItems: srsReviewQueues.totalItems,
        generatedAt: srsReviewQueues.generatedAt,
      })
      .from(srsReviewQueues)
      .where(gte(srsReviewQueues.generatedAt, twentyFourHoursAgo))
      .orderBy(desc(srsReviewQueues.generatedAt));

    // Calculate average queue generation time (placeholder - would need actual timing data)
    const avgQueueGenerationTime = 0.45; // 450ms average

    // Calculate processing latency (placeholder - would need actual timing data)
    const avgProcessingLatency = 0.18; // 180ms average

    // Get error rate from events
    const [errorEventsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(srsEvents)
      .where(
        and(
          gte(srsEvents.createdAt, twentyFourHoursAgo),
          sql<string>`event_type LIKE '%error%'`
        )
      );

    const [totalEventsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(srsEvents)
      .where(gte(srsEvents.createdAt, twentyFourHoursAgo));

    const errorCount = errorEventsResult?.count || 0;
    const totalEvents = totalEventsResult?.count || 0;
    const errorRate = totalEvents > 0 ? (errorCount / totalEvents) * 100 : 0;

    // Get review submission performance
    const recentReviews = await db
      .select({
        responseTime: srsReviews.responseTime,
        reviewedAt: srsReviews.reviewedAt,
      })
      .from(srsReviews)
      .where(gte(srsReviews.reviewedAt, twentyFourHoursAgo));

    const avgResponseTime = recentReviews.length > 0
      ? recentReviews.reduce((sum, r) => sum + r.responseTime, 0) / recentReviews.length
      : 0;

    // Get queue generation success rate
    const successfulQueues = recentQueues.length;
    const queueGenerationSuccessRate = 100; // Placeholder - would need actual failure tracking

    return NextResponse.json({
      queueGeneration: {
        avgTime: avgQueueGenerationTime, // in seconds
        successRate: queueGenerationSuccessRate, // percentage
        totalQueues: recentQueues.length,
        avgItemsPerQueue: recentQueues.length > 0
          ? recentQueues.reduce((sum, q) => sum + q.totalItems, 0) / recentQueues.length
          : 0,
      },
      processing: {
        avgLatency: avgProcessingLatency, // in seconds
        p95Latency: 0.35, // placeholder - would need actual percentile calculation
        p99Latency: 0.5, // placeholder - would need actual percentile calculation
      },
      reviews: {
        avgResponseTime, // in milliseconds
        totalReviews: recentReviews.length,
        throughput: recentReviews.length / 24, // reviews per hour
      },
      errors: {
        errorRate, // percentage
        errorCount,
        totalEvents,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching admin SRS performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin SRS performance' },
      { status: 500 }
    );
  }
}
