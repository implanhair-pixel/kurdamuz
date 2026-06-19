import { NextRequest, NextResponse } from 'next/server';
import { getNotificationById, markNotificationAsRead, deleteNotification } from '@/lib/community/notifications';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAuth();
    
    const notification = await getNotificationById(id);

    return NextResponse.json({ notification });
  } catch (error: any) {
    console.error('Error fetching notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notification' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Notification not found' ? 404 : 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await requireAuth();
    
    const notification = await markNotificationAsRead(id);

    return NextResponse.json({ notification });
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update notification' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAuth();
    
    await deleteNotification(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete notification' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
