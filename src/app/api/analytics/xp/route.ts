import { NextRequest, NextResponse } from 'next/server';
import { getUserXPAnalytics, getPlatformXPAnalytics } from '../../../../lib/xp/analytics';

// GET /api/analytics/xp - Get XP analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const scope = searchParams.get('scope'); // 'user' or 'platform'
    const timeRange = searchParams.get('timeRange') as 'daily' | 'weekly' | 'monthly';

    if (scope === 'platform') {
      // TODO: Add RBAC check for admin role
      const analytics = await getPlatformXPAnalytics();
      return NextResponse.json({ analytics });
    }

    if (userId) {
      const analytics = await getUserXPAnalytics(userId, timeRange || 'weekly');
      return NextResponse.json({ analytics });
    }

    return NextResponse.json(
      { error: 'userId is required for user analytics' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching XP analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch XP analytics' },
      { status: 500 }
    );
  }
}
