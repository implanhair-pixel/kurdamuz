import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { srsDailyStatistics, srsReviewQueues, srsItems, srsReviews } from '@/db/schema';
import { eq, sql, gte } from 'drizzle-orm';
import { requireMinRole } from '@/lib/auth';

/**
 * GET /api/admin/srs/statistics
 * Platform-wide SRS statistics
 * Auth: Admin role required
 */
export async function GET(_request: NextRequest) {
  try {
    await requireMinRole('admin_super');

    const [totalReviewsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(srsReviews);

    const totalReviews = totalReviewsResult?.count || 0;

    const [avgRetentionResult] = await db
      .select({ avg: sql<number>`avg(cast(retention_score as numeric))` })
      .from(srsDailyStatistics);

    const avgRetentionRate = avgRetentionResult?.avg || 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentQueues = await db
      .select({
        totalItems: srsReviewQueues.totalItems,
        generatedAt: srsReviewQueues.generatedAt,
      })
      .from(srsReviewQueues)
      .where(gte(srsReviewQueues.generatedAt, sevenDaysAgo));

    const totalQueueItems = recentQueues.reduce((sum, q) => sum + q.totalItems, 0);
    const queueCompletionRate = recentQueues.length > 0 ? 100 : 0;

    const [totalItemsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(srsItems)
      .where(eq(srsItems.status, 'learning'));

    const totalActiveItems = totalItemsResult?.count || 0;

    const [uniqueUsersResult] = await db
      .select({ count: sql<number>`count(distinct user_id)` })
      .from(srsItems);

    const totalUsers = uniqueUsersResult?.count || 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentReviewsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(srsReviews)
      .where(gte(srsReviews.reviewedAt, thirtyDaysAgo));

    const recentReviews = recentReviewsResult?.count || 0;
    const reviewsPerUserPerDay = totalUsers > 0 ? (recentReviews / totalUsers) / 30 : 0;

    const [avgAccuracyResult] = await db
      .select({ avg: sql<number>`avg(cast(accuracy_percentage as numeric))` })
      .from(srsDailyStatistics);

    const avgAccuracy = avgAccuracyResult?.avg || 0;

    const systemUtilization = totalUsers > 0 ? (totalActiveItems / totalUsers) : 0;

    return NextResponse.json({
      totalReviews,
      avgRetentionRate,
      queueCompletionRate,
      totalActiveItems,
      totalUsers,
      reviewsPerUserPerDay,
      avgAccuracy,
      systemUtilization,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const status = error instanceof Error && error.message.includes('Forbidden') ? 403 : error instanceof Error && error.message === 'Unauthorized' ? 401 : 500;
    console.error('Error fetching admin SRS statistics:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch admin SRS statistics' },
      { status }
    );
  }
}
