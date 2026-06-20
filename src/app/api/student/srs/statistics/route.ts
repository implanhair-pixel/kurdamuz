import { NextRequest, NextResponse } from 'next/server';
import { getUserRetentionScore } from '@/lib/srs/scheduler';
import { db } from '@/db';
import { srsDailyStatistics, srsReviews, srsItems } from '@/db/schema';
import { eq, and, desc, gte, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/student/srs/statistics
 * Get SRS statistics for user
 */
export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const retentionScore = await getUserRetentionScore(userId);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await db
      .select()
      .from(srsDailyStatistics)
      .where(
        and(
          eq(srsDailyStatistics.userId, userId),
          gte(srsDailyStatistics.reviewDate, thirtyDaysAgo.toISOString().split('T')[0] as any)
        )
      )
      .orderBy(desc(srsDailyStatistics.reviewDate));

    const totalReviews = dailyStats.reduce((sum, stat) => sum + stat.reviewsCompleted, 0);
    const totalStudyTime = dailyStats.reduce((sum, stat) => sum + stat.studyTime, 0);
    const avgAccuracy = dailyStats.length > 0
      ? dailyStats.reduce((sum, stat) => sum + parseFloat(stat.accuracyPercentage), 0) / dailyStats.length
      : 0;

    const [totalItemsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(srsItems)
      .where(eq(srsItems.userId, userId));

    const totalItems = totalItemsResult?.count || 0;

    const masteryBreakdown = await db
      .select({ status: srsItems.status, count: sql<number>`count(*)` })
      .from(srsItems)
      .where(eq(srsItems.userId, userId))
      .groupBy(srsItems.status);

    const masteryByStatus = masteryBreakdown.reduce((acc, item) => {
      acc[item.status] = item.count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      retentionScore,
      totalReviews,
      totalStudyTime,
      avgAccuracy,
      totalItems,
      masteryByStatus,
      dailyStats,
    });
  } catch (error) {
    console.error('Error fetching SRS statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SRS statistics' },
      { status: 500 }
    );
  }
}
