import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireMinRole } from '@/lib/auth';
import { getUserXPAnalytics, getPlatformXPAnalytics } from '../../../../lib/xp/analytics';

// GET /api/analytics/xp - Get XP analytics
export async function GET(request: NextRequest) {
  try {
    const requester = await getCurrentUser();
    if (!requester?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const scope = searchParams.get('scope');
    const timeRange = searchParams.get('timeRange');

    if (scope === 'platform') {
      await requireMinRole('admin_super');
      const analytics = await getPlatformXPAnalytics();
      return NextResponse.json({ analytics });
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required for user analytics' },
        { status: 400 }
      );
    }

    if (userId !== requester.id) {
      await requireMinRole('teacher');
    }

    const normalizedTimeRange =
      timeRange === 'daily' || timeRange === 'weekly' || timeRange === 'monthly'
        ? timeRange
        : 'weekly';

    const analytics = await getUserXPAnalytics(userId, normalizedTimeRange);
    return NextResponse.json({ analytics });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.error('Error fetching XP analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch XP analytics' },
      { status: 500 }
    );
  }
}
