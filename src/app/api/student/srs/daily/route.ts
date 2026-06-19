import { NextRequest, NextResponse } from 'next/server';
import { generateDailyQueue } from '@/lib/srs/queue-generator';
import { getSrsItemContent } from '@/lib/srs/scheduler';

/**
 * GET /api/student/srs/daily
 * Get daily review queue for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from authentication session
    // For now, using a placeholder - this should be replaced with actual auth
    const userId = request.headers.get('x-user-id') || 'placeholder-user-id';

    // Generate or retrieve daily queue
    const queue = await generateDailyQueue(userId);

    // Enrich queue items with content details
    const enrichedItems = await Promise.all(
      queue.items.map(async (item) => {
        try {
          const content = await getSrsItemContent(item.srsItemId);
          return {
            ...item,
            content,
          };
        } catch (error) {
          console.error(`Error fetching content for item ${item.srsItemId}:`, error);
          return {
            ...item,
            content: null,
          };
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
