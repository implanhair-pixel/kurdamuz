import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { processNotificationQueue, cleanupOldNotifications } from '@/lib/notification-queue';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[notification-dispatch] Starting at', new Date(startTime).toISOString());

  try {
    const cronSecret = request.headers.get('x-cron-secret') || request.headers.get('authorization');
    if (cronSecret !== process.env.CRON_SECRET) {
      console.error('[notification-dispatch] Invalid cron secret');
      Sentry.captureMessage('[notification-dispatch] Invalid cron secret', 'warning');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    Sentry.captureMessage('[notification-dispatch] Starting notification dispatch', 'info');

    const processed = await processNotificationQueue(100);
    const cleaned = await cleanupOldNotifications();

    const duration = Date.now() - startTime;
    console.log(`[notification-dispatch] Completed in ${duration}ms`);
    Sentry.captureMessage(`[notification-dispatch] Completed in ${duration}ms`, 'info');

    return NextResponse.json({ success: true, processed, cleaned, duration });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[notification-dispatch] Error after', duration, 'ms:', error);
    Sentry.captureException(error);
    return NextResponse.json({ success: false, error: String(error), duration }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Notification dispatch endpoint is running',
  });
}
