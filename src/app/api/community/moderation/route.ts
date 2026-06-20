import { NextRequest, NextResponse } from 'next/server';
import { getModerationActions, createModerationAction, getModerationStats } from '@/lib/community/moderation';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const targetType = searchParams.get('targetType') || undefined;
    const actionType = searchParams.get('actionType') || undefined;
    const stats = searchParams.get('stats') === 'true';

    if (stats) {
      const moderationStats = await getModerationStats();
      return NextResponse.json({ stats: moderationStats });
    }

    const actions = await getModerationActions({
      page,
      limit,
      targetType,
      actionType,
    });

    return NextResponse.json({ actions });
  } catch (error: any) {
    console.error('Error fetching moderation actions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch moderation actions' },
      { status: error.message === 'Unauthorized' ? 401 : error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    const body = await request.json();
    
    const action = await createModerationAction(body);

    return NextResponse.json({ action }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating moderation action:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create moderation action' },
      { status: error.message === 'Unauthorized' || error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}
