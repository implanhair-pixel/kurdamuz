import { NextRequest, NextResponse } from 'next/server';
import { scheduleReview } from '@/lib/srs/scheduler';
import { completeQueueItem } from '@/lib/srs/queue-generator';

/**
 * POST /api/student/srs/submit
 * Submit review results
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { srsItemId, reviewQuality, responseTime, queueItemId } = body;

    // Validate input
    if (!srsItemId || reviewQuality === undefined || responseTime === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: srsItemId, reviewQuality, responseTime' },
        { status: 400 }
      );
    }

    // Validate quality rating
    if (reviewQuality < 0 || reviewQuality > 5) {
      return NextResponse.json(
        { error: 'Review quality must be between 0 and 5' },
        { status: 400 }
      );
    }

    // Validate response time
    if (responseTime < 0) {
      return NextResponse.json(
        { error: 'Response time must be non-negative' },
        { status: 400 }
      );
    }

    // Process review and update schedule
    const result = await scheduleReview({
      srsItemId,
      quality: reviewQuality,
      responseTime,
    });

    // Mark queue item as completed if provided
    if (queueItemId) {
      await completeQueueItem(queueItemId);
    }

    return NextResponse.json({
      success: true,
      nextReviewAt: result.nextReviewAt,
      interval: result.interval,
      easeFactor: result.easeFactor,
      repetitions: result.repetitions,
      masteryLevel: result.masteryLevel,
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
