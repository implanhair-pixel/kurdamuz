import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireMinRole } from '@/lib/auth';
import { getPendingRecoveryRequests } from '@/lib/streaks';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Require admin or higher role
    await requireMinRole('admin_super');

    const pendingRecoveries = await getPendingRecoveryRequests();

    // Calculate analytics
    const analytics = {
      pendingRecoveryRequests: pendingRecoveries.length,
      recoveryRequestsByType: groupByType(pendingRecoveries),
      recentRequests: pendingRecoveries.slice(0, 10),
    };

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('Error fetching streak analytics:', error);
    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch streak analytics' },
      { status: 500 }
    );
  }
}

function groupByType(requests: any[]) {
  const grouped: Record<string, number> = {};
  requests.forEach(req => {
    grouped[req.recoveryType] = (grouped[req.recoveryType] || 0) + 1;
  });
  return grouped;
}
