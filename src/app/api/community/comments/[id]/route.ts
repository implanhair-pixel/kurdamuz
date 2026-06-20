import { NextRequest, NextResponse } from 'next/server';
import { getCommentById, updateComment, deleteComment } from '@/lib/community/comments';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAuth();
    
    const comment = await getCommentById(id);

    return NextResponse.json({ comment });
  } catch (error: any) {
    console.error('Error fetching comment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comment' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Comment not found' ? 404 : 500 }
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
    
    const body = await request.json();
    
    const comment = await updateComment(id, body);

    return NextResponse.json({ comment });
  } catch (error: any) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update comment' },
      { status: error.message === 'Unauthorized' ? 401 : error.message.includes('Forbidden') ? 403 : 500 }
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
    
    await deleteComment(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete comment' },
      { status: error.message === 'Unauthorized' ? 401 : error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}
