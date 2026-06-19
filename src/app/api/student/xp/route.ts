import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { awardXP, getUserProgress } from '@/lib/progression';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Get user's total XP from metadata
    const totalXP = user?.user_metadata?.total_xp || 0;

    return NextResponse.json({ totalXP });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('XP fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { xp, lessonId } = body;

    if (!xp || typeof xp !== 'number') {
      return NextResponse.json(
        { error: 'Invalid XP value' },
        { status: 400 }
      );
    }

    await awardXP(user.id, xp);

    return NextResponse.json({ success: true, xp });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('XP award error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
