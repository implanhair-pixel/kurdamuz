import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireMinRole } from '@/lib/auth';
import { getRewardStatistics } from '@/lib/achievements';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Require admin or higher role
    await requireMinRole('admin');

    const rewardStats = await getRewardStatistics();

    const analytics = {
      totalRewardsClaimed: rewardStats.totalRewardsClaimed,
      uniqueUsers: rewardStats.uniqueUsers,
      averageRewardsPerUser: rewardStats.averageRewardsPerUser,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('Error fetching achievement analytics:', error);
    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch achievement analytics' },
      { status: 500 }
    );
  }
}
