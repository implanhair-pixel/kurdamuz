import { NextRequest, NextResponse } from 'next/server';
import { AssessmentManager } from '@/lib/placement/assessments';
import { getCurrentUser, requireMinRole } from '@/lib/auth';

async function requirePlacementAdmin() {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error('Unauthorized');
  }
  await requireMinRole('admin_super');
  return user;
}

export async function GET(_request: NextRequest) {
  try {
    await requirePlacementAdmin();
    const assessments = await AssessmentManager.getActive();
    return NextResponse.json({ assessments });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get tests';
    const status = message === 'Unauthorized' ? 401 : message.includes('Forbidden') ? 403 : 500;
    console.error('Error getting tests:', error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePlacementAdmin();
    const body = await request.json();
    const assessment = await AssessmentManager.create(body);
    return NextResponse.json({ assessment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create test';
    const status = message === 'Unauthorized' ? 401 : message.includes('Forbidden') ? 403 : 500;
    console.error('Error creating test:', error);
    return NextResponse.json({ error: message }, { status });
  }
}
