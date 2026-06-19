import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { srsItems, srsSchedules, vocabulary } from '@/db/schema';
import { eq, sql, desc, and } from 'drizzle-orm';

/**
 * GET /api/student/srs/mastery
 * Get mastery breakdown by content type
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from authentication session
    const userId = request.headers.get('x-user-id') || 'placeholder-user-id';

    // Get mastery breakdown by content type
    const masteryByContentType = await db
      .select({
        contentType: srsItems.contentType,
        status: srsItems.status,
        count: sql<number>`count(*)`,
      })
      .from(srsItems)
      .where(eq(srsItems.userId, userId))
      .groupBy(srsItems.contentType, srsItems.status);

    // Group by content type
    const groupedByType = masteryByContentType.reduce((acc, item) => {
      if (!acc[item.contentType]) {
        acc[item.contentType] = {};
      }
      acc[item.contentType][item.status] = item.count;
      return acc;
    }, {} as Record<string, Record<string, number>>);

    // Get vocabulary-specific mastery details
    const vocabularyMastery = await db
      .select({
        vocabularyId: srsItems.contentId,
        kurdishWord: vocabulary.kurdishWord,
        persianTranslation: vocabulary.persianTranslation,
        status: srsItems.status,
        easeFactor: srsSchedules.easeFactor,
        repetitions: srsSchedules.repetitionCount,
        interval: srsSchedules.currentInterval,
      })
      .from(srsItems)
      .innerJoin(srsSchedules, eq(srsItems.id, srsSchedules.srsItemId))
      .innerJoin(vocabulary, eq(srsItems.contentId, vocabulary.id))
      .where(and(eq(srsItems.userId, userId), eq(srsItems.contentType, 'vocabulary')))
      .orderBy(desc(srsSchedules.repetitionCount))
      .limit(50);

    // Calculate mastery levels
    const masteryLevels = {
      learning: 0,
      reinforcement: 0,
      retention: 0,
      mastery: 0,
      archived: 0,
    };

    masteryByContentType.forEach((item) => {
      if (item.status in masteryLevels) {
        (masteryLevels as Record<string, number>)[item.status] += item.count;
      }
    });

    const totalItems = Object.values(masteryLevels).reduce((sum, count) => sum + count, 0);

    return NextResponse.json({
      masteryByContentType: groupedByType,
      vocabularyMastery,
      masteryLevels,
      totalItems,
      masteryDistribution: totalItems > 0
        ? Object.entries(masteryLevels).map(([level, count]) => ({
            level,
            count,
            percentage: (count / totalItems) * 100,
          }))
        : [],
    });
  } catch (error) {
    console.error('Error fetching mastery data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mastery data' },
      { status: 500 }
    );
  }
}
