import { NextRequest, NextResponse } from 'next/server';
import { getUserXPBalance } from '../../../../lib/xp/xp';

// GET /api/xp/balance - Get user's XP balance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const balance = await getUserXPBalance(userId);

    return NextResponse.json({ userId, balance });
  } catch (error) {
    console.error('Error fetching XP balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch XP balance' },
      { status: 500 }
    );
  }
}
