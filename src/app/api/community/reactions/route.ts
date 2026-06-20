import { NextRequest, NextResponse } from 'next/server';
import { createReaction, deleteReaction, getReactionsByTarget, getReactionStats, getUserReaction } from '@/lib/community/reactions';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const searchParams = request.nextUrl.searchParams;
    const targetType = searchParams.get('targetType');
    const targetId = searchParams.get('targetId');
    const userId = searchParams.get('userId');
    const stats = searchParams.get('stats') === 'true';

    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: 'targetType and targetId are required' },
        { status: 400 }
      );
    }

    if (stats) {
      const reactionStats = await getReactionStats(targetType, targetId);
      return NextResponse.json({ stats: reactionStats });
    }

    if (userId) {
      const reaction = await getUserReaction(targetType, targetId, userId);
      return NextResponse.json({ reaction });
    }

    const reactions = await getReactionsByTarget(targetType, targetId);

    return NextResponse.json({ reactions });
  } catch (error: any) {
    console.error('Error fetching reactions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reactions' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    const body = await request.json();
    
    const result = await createReaction(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error creating reaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create reaction' },
      { status: error.message === 'Unauthorized' || error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAuth();
    
    const searchParams = request.nextUrl.searchParams;
    const reactionId = searchParams.get('reactionId');

    if (!reactionId) {
      return NextResponse.json(
        { error: 'reactionId is required' },
        { status: 400 }
      );
    }

    const result = await deleteReaction(reactionId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error deleting reaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete reaction' },
      { status: error.message === 'Unauthorized' ? 401 : error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}
