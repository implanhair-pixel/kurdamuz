import { NextRequest, NextResponse } from 'next/server';
import { auditLogger } from '@/lib/audit/audit-logger';

// GET /api/dialects/audit - Get audit logs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'recent';
    const userId = searchParams.get('userId');
    const actionType = searchParams.get('actionType');
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const limit = parseInt(searchParams.get('limit') || '20');

    let logs;

    if (type === 'recent') {
      logs = await auditLogger.getRecentLogs(limit);
    } else if (type === 'user' && userId) {
      logs = await auditLogger.getUserLogs(userId, limit);
    } else if (type === 'action' && actionType) {
      logs = await auditLogger.getLogsByActionType(actionType, limit);
    } else if (type === 'entity' && entityType && entityId) {
      logs = await auditLogger.getEntityLogs(entityType, entityId);
    } else {
      return NextResponse.json(
        { error: 'Invalid audit log type or missing required parameters' },
        { status: 400 }
      );
    }

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
