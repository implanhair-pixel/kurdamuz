import { NextRequest, NextResponse } from 'next/server';
import { AssessmentManager } from '@/lib/placement/assessments';
import { getCurrentUser, requireMinRole } from '@/lib/auth';
import { z } from 'zod';

async function requirePlacementAdmin() {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error('Unauthorized');
  }
  await requireMinRole('admin_super');
  return user;
}

const updateAssessmentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  assessmentType: z.enum(['placement', 'diagnostic', 'proficiency']).optional(),
  status: z.enum(['active', 'archived', 'draft']).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requirePlacementAdmin();

    const assessment = await AssessmentManager.getById(id);

    if (!assessment) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    const sections = await AssessmentManager.getSections(id);

    return NextResponse.json({ assessment, sections });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get test';
    const status = message === 'Unauthorized' ? 401 : message.includes('Forbidden') ? 403 : 500;
    console.error('Error getting test:', error);
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
    const validated = updateAssessmentSchema.parse(body);
    const assessment = await AssessmentManager.update(id, validated);

    return NextResponse.json({ assessment });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update test';
    const status =
      message === 'Unauthorized'
        ? 401
        : message.includes('Forbidden')
          ? 403
          : error instanceof z.ZodError
            ? 400
            : 500;

    console.error('Error updating test:', error);
    return NextResponse.json(
      error instanceof z.ZodError
        ? { error: 'Invalid request data', details: error.flatten() }
        : { error: message },
      { status }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requirePlacementAdmin();
    await AssessmentManager.update(id, { status: 'archived' });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete test';
    const status = message === 'Unauthorized' ? 401 : message.includes('Forbidden') ? 403 : 500;
    console.error('Error deleting test:', error);
    return NextResponse.json({ error: message }, { status });
  }
}
