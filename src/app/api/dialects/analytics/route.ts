import { NextRequest, NextResponse } from 'next/server';
import { dialectAnalyticsService } from '@/lib/analytics/dialect-analytics';

// GET /api/dialects/analytics - Get analytics report
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'report';
    const dialectId = searchParams.get('dialectId');

    if (type === 'report') {
      const report = await dialectAnalyticsService.generateAnalyticsReport();
      return NextResponse.json(report, { status: 200 });
    }

    if (type === 'dialect' && dialectId) {
      const analytics = await dialectAnalyticsService.getDialectAnalytics(dialectId);
      if (!analytics) {
        return NextResponse.json(
          { error: 'Dialect not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(analytics, { status: 200 });
    }

    if (type === 'system') {
      const stats = await dialectAnalyticsService.getSystemStatistics();
      return NextResponse.json(stats, { status: 200 });
    }

    if (type === 'audit') {
      const auditStats = await dialectAnalyticsService.getAuditLogStatistics();
      return NextResponse.json(auditStats, { status: 200 });
    }

    return NextResponse.json(
      { error: 'Invalid analytics type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
