// src/app/api/challenges/rewards/[id]/claim/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { challengeRewards } from '@/db/schema';
import { claimRewardSchema } from '@/lib/validations/challenges';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// POST /api/challenges/rewards/:id/claim - Claim reward
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [reward] = await db.update(challengeRewards)
      .set({ 
        isClaimed: true, 
        claimedAt: new Date() 
      })
      .where(and(
        eq(challengeRewards.id, id),
        eq(challengeRewards.userId, user.id),
        eq(challengeRewards.isClaimed, false)
      ))
      .returning();

    if (!reward) {
      return NextResponse.json(
        { error: 'Reward not found or already claimed' },
        { status: 404 }
      );
    }

    // Apply reward to user (this would integrate with XP/Achievements systems)
    // TODO: Implement reward application logic

    return NextResponse.json({ reward });
  } catch (error) {
    console.error('Error claiming reward:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
