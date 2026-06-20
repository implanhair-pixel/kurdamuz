import { NextRequest, NextResponse } from 'next/server';
import { QuestionBank } from '@/lib/placement/question-bank';
import { getCurrentUser, requireMinRole } from '@/lib/auth';

async function requirePlacementAdmin() {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error('Unauthorized');
  }
  await requireMinRole('admin_super');
  return user;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requirePlacementAdmin();

    const question = await QuestionBank.getById(id);

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ question });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get question';
    const status = message === 'Unauthorized' ? 401 : message.includes('Forbidden') ? 403 : 500;
    console.error('Error getting question:', error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requirePlacementAdmin();
    const body = await request.json();
    const question = await QuestionBank.update(id, body);
    return NextResponse.json({ question });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update question';
    const status = message === 'Unauthorized' ? 401 : message.includes('Forbidden') ? 403 : 500;
    console.error('Error updating question:', error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requirePlacementAdmin();
    await QuestionBank.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete question';
    const status = message === 'Unauthorized' ? 401 : message.includes('Forbidden') ? 403 : 500;
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: message }, { status });
  }
}
