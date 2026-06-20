import { NextRequest, NextResponse } from 'next/server';
import { generateDailyQueue } from '@/lib/srs/queue-generator';
import { getSrsItemContent } from '@/lib/srs/scheduler';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/student/srs/daily
 * Get daily review queue for authenticated user
 */
export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const queue = await generateDailyQueue(user.id);

    const enrichedItems = await Promise.all(
      queue.items.map(async (item) => {
        try {
          const content = await getSrsItemContent(item.srsItemId);
          return { ...item, content };
        } catch (error) {
          console.error(`Error fetching content for item ${item.srsItemId}:`, error);
          return { ...item, content: null };
        }
      })
    );

    return NextResponse.json({
      queueId: queue.queueId,
      queueDate: queue.queueDate,
      totalItems: queue.totalItems,
      items: enrichedItems,
    });
  } catch (error) {
    console.error('Error fetching daily queue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily review queue' },
      { status: 500 }
    );
  }
}
