// src/app/api/challenges/rewards/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { challengeRewards, challengeScores } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// GET /api/challenges/rewards - List user rewards
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rewardType = searchParams.get('rewardType');
    const isClaimed = searchParams.get('isClaimed');

    const conditions = [eq(challengeRewards.userId, user.id)];
    
    if (rewardType) {
      conditions.push(eq(challengeRewards.rewardType, rewardType));
    }

    if (isClaimed !== null) {
      conditions.push(eq(challengeRewards.isClaimed, isClaimed === 'true'));
    }

    const rewards = await db
      .select({
        reward: challengeRewards,
        score: challengeScores,
      })
      .from(challengeRewards)
      .leftJoin(
        challengeScores,
        eq(challengeRewards.scoreId, challengeScores.id)
      )
      .where(and(...conditions))
      .orderBy(desc(challengeRewards.awardedAt))
      .limit(50);

    return NextResponse.json({ rewards });
  } catch (error) {
    console.error('Error fetching challenge rewards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
