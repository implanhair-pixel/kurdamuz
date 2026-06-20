import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { claimReward } from '@/lib/challenges/rewards';

// POST /api/challenges/rewards/:id/claim - Claim reward
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reward = await claimReward(id, user.id);
    return NextResponse.json({ reward });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('already claimed') || message.includes('not found') ? 404 : 500;

    console.error('Error claiming reward:', error);
    return NextResponse.json({ error: message }, { status });
  }
}
