import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { srsItems, srsSchedules, vocabulary } from '@/db/schema';
import { eq, sql, desc, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/student/srs/mastery
 * Get mastery breakdown by content type
 */
export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    const masteryByContentType = await db
      .select({
        contentType: srsItems.contentType,
        status: srsItems.status,
        count: sql<number>`count(*)`,
      })
      .from(srsItems)
      .where(eq(srsItems.userId, userId))
      .groupBy(srsItems.contentType, srsItems.status);

    const groupedByType = masteryByContentType.reduce((acc, item) => {
      if (!acc[item.contentType]) {
        acc[item.contentType] = {};
      }
      acc[item.contentType][item.status] = item.count;
      return acc;
    }, {} as Record<string, Record<string, number>>);

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

    const masteryLevels = {
      learning: 0,
      reinforcement: 0,
      retention: 0,
      mastery: 0,
      archived: 0,
    };

    for (const item of masteryByContentType) {
      if (item.status in masteryLevels) {
        masteryLevels[item.status as keyof typeof masteryLevels] += item.count;
      }
    }

    const totalItems = Object.values(masteryLevels).reduce((sum, value) => sum + value, 0);
    const masteryPercentage = totalItems > 0
      ? ((masteryLevels.mastery + masteryLevels.retention) / totalItems) * 100
      : 0;

    return NextResponse.json({
      masteryLevels,
      groupedByType,
      vocabularyMastery,
      masteryPercentage,
    });
  } catch (error) {
    console.error('Error fetching mastery breakdown:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mastery breakdown' },
      { status: 500 }
    );
  }
}
