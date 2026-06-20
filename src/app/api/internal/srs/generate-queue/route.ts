import { NextRequest, NextResponse } from 'next/server';
import { generateDailyQueue } from '@/lib/srs/queue-generator';

/**
 * POST /api/internal/srs/generate-queue
 * Internal API endpoint for Cloudflare Worker to generate daily queues
 * Auth: API secret required
 */
export async function POST(request: NextRequest) {
  try {
    // Verify API secret
    const authHeader = request.headers.get('authorization');
    const apiSecret = process.env.API_SECRET;

    if (!apiSecret) {
      return NextResponse.json(
        { error: 'API secret not configured' },
        { status: 500 }
      );
    }

    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.slice(7) !== apiSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Generate daily queue for the user
    const queue = await generateDailyQueue(userId);

    return NextResponse.json({
      success: true,
      queueId: queue.queueId,
      totalItems: queue.totalItems,
    });
  } catch (error) {
    console.error('Error generating queue:', error);
    return NextResponse.json(
      { error: 'Failed to generate queue' },
      { status: 500 }
    );
  }
}
