// src/app/api/challenges/leaderboards/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { challengeLeaderboards, challengeSchedules } from '@/db/schema';
import { getLeaderboardSchema } from '@/lib/validations/challenges';
import { eq, and, desc, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// GET /api/challenges/leaderboards - Get leaderboard
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scheduleId = searchParams.get('scheduleId');
    const leaderboardType = searchParams.get('leaderboardType') || 'daily';
    const scope = searchParams.get('scope') || 'global';
    const scopeId = searchParams.get('scopeId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const conditions = [];
    
    if (scheduleId) {
      conditions.push(eq(challengeLeaderboards.scheduleId, scheduleId));
    }

    if (leaderboardType) {
      conditions.push(eq(challengeLeaderboards.leaderboardType, leaderboardType));
    }

    if (scope) {
      conditions.push(eq(challengeLeaderboards.scope, scope));
    }

    if (scopeId) {
      conditions.push(eq(challengeLeaderboards.scopeId, scopeId));
    }

    const leaderboard = await db
      .select({
        entry: challengeLeaderboards,
      })
      .from(challengeLeaderboards)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(challengeLeaderboards.rank))
      .limit(limit)
      .offset(offset);

    // Get current user's position
    const userPosition = await db.query.challengeLeaderboards.findFirst({
      where: and(
        eq(challengeLeaderboards.userId, user.id),
        ...(conditions.length > 0 ? conditions : [])
      ),
    });

    return NextResponse.json({ 
      leaderboard: leaderboard.map(l => l.entry),
      userPosition 
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
