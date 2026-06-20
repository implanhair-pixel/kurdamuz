import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { 
  getUserAchievements, 
  getUserAchievementDetails,
  claimAchievementReward 
} from '@/lib/achievements';
import type { ClaimAchievementRewardInput } from '@/types/achievement';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;
    const details = searchParams.get('details') === 'true';

    if (details) {
      const achievementDetails = await getUserAchievementDetails(user.id);
      return NextResponse.json(achievementDetails);
    }

    const achievements = await getUserAchievements(user.id, status);
    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action;

    if (action === 'claim') {
      const input: ClaimAchievementRewardInput = {
        userId: user.id,
        achievementId: body.achievementId,
      };

      const result = await claimAchievementReward(input);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error processing achievement action:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process achievement action' },
      { status: 400 }
    );
  }
}
