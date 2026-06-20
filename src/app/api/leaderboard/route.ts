import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard, getLeaderboardWithUserPosition } from '../../../lib/xp/analytics';

// GET /api/leaderboard - Get leaderboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') as 'daily' | 'weekly' | 'monthly' | 'all_time';
    const limit = searchParams.get('limit');
    const userId = searchParams.get('userId');

    const leaderboard = userId
      ? await getLeaderboardWithUserPosition(
          userId,
          timeframe || 'weekly',
          limit ? parseInt(limit) : 50
        )
      : await getLeaderboard(timeframe || 'weekly', limit ? parseInt(limit) : 50);

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
