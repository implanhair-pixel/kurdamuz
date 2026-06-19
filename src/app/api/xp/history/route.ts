import { NextRequest, NextResponse } from 'next/server';
import { getXPTransactions } from '../../../../lib/xp/xp';

// GET /api/xp/history - Get user's XP transaction history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const transactions = await getXPTransactions(userId, {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching XP history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch XP history' },
      { status: 500 }
    );
  }
}
