import { NextRequest, NextResponse } from 'next/server';
import { getCurrentLevel, getXPToNextLevel } from '../../../../lib/xp/progression';

// GET /api/xp/level - Get user's current level and progress
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

    const currentLevel = await getCurrentLevel(userId);
    const levelProgress = await getXPToNextLevel(userId);

    return NextResponse.json({
      userId,
      currentLevel,
      levelProgress,
    });
  } catch (error) {
    console.error('Error fetching user level:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user level' },
      { status: 500 }
    );
  }
}
