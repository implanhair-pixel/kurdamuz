import { NextRequest, NextResponse } from 'next/server';
import { getReportById, updateReport } from '@/lib/community/reports';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAuth();
    
    const report = await getReportById(id);

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch report' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Report not found' ? 404 : 500 }
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
    
    const report = await updateReport(id, body);

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update report' },
      { status: error.message === 'Unauthorized' ? 401 : error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}
