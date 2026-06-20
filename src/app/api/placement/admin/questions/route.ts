import { NextRequest, NextResponse } from 'next/server';
import { QuestionBank } from '@/lib/placement/question-bank';
import { getCurrentUser, requireMinRole } from '@/lib/auth';
import type { QuestionFilter } from '@/lib/placement/question-bank/types';

async function requirePlacementAdmin() {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error('Unauthorized');
  }
  await requireMinRole('admin_super');
  return user;
}

export async function GET(request: NextRequest) {
  try {
    await requirePlacementAdmin();

    const { searchParams } = new URL(request.url);
    const filter: QuestionFilter = {};

    const skillDomain = searchParams.get('skillDomain');
    const difficultyLevel = searchParams.get('difficultyLevel');
    const questionType = searchParams.get('questionType');
    const status = searchParams.get('status');

    if (skillDomain) filter.skillDomain = skillDomain as QuestionFilter['skillDomain'];
    if (difficultyLevel) filter.difficultyLevel = difficultyLevel as QuestionFilter['difficultyLevel'];
    if (questionType) filter.questionType = questionType as QuestionFilter['questionType'];
    if (status) filter.status = status as QuestionFilter['status'];

    const questions = await QuestionBank.getByFilter(filter);

    return NextResponse.json({ questions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get questions';
    const status = message === 'Unauthorized' ? 401 : message.includes('Forbidden') ? 403 : 500;
    console.error('Error getting questions:', error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePlacementAdmin();
    const body = await request.json();
    const question = await QuestionBank.create(body);
    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create question';
    const status = message === 'Unauthorized' ? 401 : message.includes('Forbidden') ? 403 : 500;
    console.error('Error creating question:', error);
    return NextResponse.json({ error: message }, { status });
  }
}
