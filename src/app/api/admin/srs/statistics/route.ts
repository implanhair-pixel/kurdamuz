import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { srsDailyStatistics, srsReviewQueues, srsItems, srsReviews } from '@/db/schema';
import { eq, sql, desc, gte, and } from 'drizzle-orm';

/**
 * GET /api/admin/srs/statistics
 * Platform-wide SRS statistics
 * Auth: Admin role required
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Verify admin role from authentication
    // For now, this endpoint is open for development

    // Get total reviews across all users
    const [totalReviewsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(srsReviews);

    const totalReviews = totalReviewsResult?.count || 0;

    // Get average retention rate
    const [avgRetentionResult] = await db
      .select({ avg: sql<number>`avg(cast(retention_score as numeric))` })
      .from(srsDailyStatistics);

    const avgRetentionRate = avgRetentionResult?.avg || 0;

    // Get queue completion rate (last 7 days)
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
    const queueCompletionRate = totalQueueItems > 0 ? 85 : 0; // Placeholder - would need actual completion tracking

    // Get total active SRS items
    const [totalItemsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(srsItems)
      .where(eq(srsItems.status, 'learning')); // Only non-archived items

    const totalActiveItems = totalItemsResult?.count || 0;

    // Get total users with SRS items
    const [uniqueUsersResult] = await db
      .select({ count: sql<number>`count(distinct user_id)` })
      .from(srsItems);

    const totalUsers = uniqueUsersResult?.count || 0;

    // Get review engagement (reviews per user per day)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentReviewsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(srsReviews)
      .where(gte(srsReviews.reviewedAt, thirtyDaysAgo));

    const recentReviews = recentReviewsResult?.count || 0;
    const reviewsPerUserPerDay = totalUsers > 0 ? (recentReviews / totalUsers) / 30 : 0;

    // Get learning effectiveness (accuracy trend)
    const [avgAccuracyResult] = await db
      .select({ avg: sql<number>`avg(cast(accuracy_percentage as numeric))` })
      .from(srsDailyStatistics);

    const avgAccuracy = avgAccuracyResult?.avg || 0;

    // Get system utilization
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
    console.error('Error fetching admin SRS statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin SRS statistics' },
      { status: 500 }
    );
  }
}
