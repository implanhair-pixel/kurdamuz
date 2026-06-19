import { NextRequest, NextResponse } from 'next/server';
import { getNotifications, markAllNotificationsAsRead, getUnreadCount } from '@/lib/community/notifications';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const unreadCount = searchParams.get('unreadCount') === 'true';

    if (unreadCount) {
      const count = await getUnreadCount();
      return NextResponse.json({ unreadCount: count });
    }

    const notifications = await getNotifications({
      page,
      limit,
      unreadOnly,
    });

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    const searchParams = request.nextUrl.searchParams;
    const markAllRead = searchParams.get('markAllRead') === 'true';

    if (markAllRead) {
      await markAllNotificationsAsRead();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update notifications' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
