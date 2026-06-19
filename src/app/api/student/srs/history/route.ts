import { NextRequest, NextResponse } from 'next/server';
import { getReviewHistory } from '@/lib/srs/scheduler';

/**
 * GET /api/student/srs/history
 * Get review history for user
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from authentication session
    const userId = request.headers.get('x-user-id') || 'placeholder-user-id';

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: 'Offset must be non-negative' },
        { status: 400 }
      );
    }

    // Get review history
    const reviews = await getReviewHistory(userId, limit, offset);

    return NextResponse.json({
      reviews,
      pagination: {
        limit,
        offset,
        hasMore: reviews.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching review history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review history' },
      { status: 500 }
    );
  }
}
