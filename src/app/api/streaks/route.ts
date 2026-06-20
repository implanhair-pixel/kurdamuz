import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { 
  getOrCreateUserStreak, 
  getStreakHistory, 
  getStreakStatistics,
  isStreakAtRisk,
  getStreakHealthStatus 
} from '@/lib/streaks';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const streak = await getOrCreateUserStreak(user.id);
    const history = await getStreakHistory(user.id, 30);
    const statistics = await getStreakStatistics(user.id);
    const atRisk = await isStreakAtRisk(user.id);
    const healthStatus = await getStreakHealthStatus(user.id);

    return NextResponse.json({
      streak,
      history,
      statistics,
      atRisk,
      healthStatus,
    });
  } catch (error) {
    console.error('Error fetching streak data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streak data' },
      { status: 500 }
    );
  }
}
