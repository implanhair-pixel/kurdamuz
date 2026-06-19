import { NextRequest, NextResponse } from 'next/server';
import { getReports, createReport, getReportStats, updateReport } from '@/lib/community/reports';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || undefined;
    const targetType = searchParams.get('targetType') || undefined;
    const stats = searchParams.get('stats') === 'true';

    if (stats) {
      const reportStats = await getReportStats();
      return NextResponse.json({ stats: reportStats });
    }

    const reports = await getReports({
      page,
      limit,
      status,
      targetType,
    });

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reports' },
      { status: error.message === 'Unauthorized' ? 401 : error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    const body = await request.json();
    
    const report = await createReport(body);

    return NextResponse.json({ report }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create report' },
      { status: error.message === 'Unauthorized' || error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}


export async function PUT(request: NextRequest) {
  try {
    await requireAuth();

    const reportId = request.nextUrl.searchParams.get('reportId');
    if (!reportId) {
      return NextResponse.json(
        { error: 'reportId is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const report = await updateReport(reportId, body);

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update report' },
      { status: error.message === 'Unauthorized' ? 401 : error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}
