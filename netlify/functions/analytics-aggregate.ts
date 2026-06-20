import type { Config } from '@netlify/functions';
import * as Sentry from '@sentry/nextjs';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

const BATCH_SIZE = 1000; // Process 1000 events per batch

export const config: Config = {
  schedule: '0 * * * *', // Every 1 hour
};

export default async function handler() {
  const startTime = Date.now();
  
  try {
    Sentry.captureMessage('Analytics aggregation started', 'info');
    console.log('Analytics aggregation started');
    
    // Aggregate analytics events by event type and date
    const aggregatedEvents = await db.execute(sql`
      INSERT INTO analytics_daily_summary (date, event_type, event_count, unique_users, metadata)
      SELECT 
        DATE(created_at) as date,
        event_type,
        COUNT(*) as event_count,
        COUNT(DISTINCT user_id) as unique_users,
        jsonb_build_object(
          'avg_session_duration', AVG(CAST(metadata->>'session_duration' AS FLOAT)),
          'avg_page_load_time', AVG(CAST(metadata->>'page_load_time' AS FLOAT))
        ) as metadata
      FROM analytics_events
      WHERE created_at >= NOW() - INTERVAL '7 days'
        AND processed = false
      GROUP BY DATE(created_at), event_type
      ON CONFLICT (date, event_type) 
      DO UPDATE SET
        event_count = analytics_daily_summary.event_count + EXCLUDED.event_count,
        unique_users = analytics_daily_summary.unique_users + EXCLUDED.unique_users,
        metadata = analytics_daily_summary.metadata
      RETURNING event_type, COUNT(*) as count
    `);
    
    // Mark events as processed
    await db.execute(sql`
      UPDATE analytics_events
      SET processed = true
      WHERE created_at >= NOW() - INTERVAL '7 days' AND processed = false
    `);
    
    const processedCount = Array.isArray(aggregatedEvents) ? aggregatedEvents.length : 0;
    
    console.log(`Analytics aggregation completed. Processed ${processedCount} event types in ${Date.now() - startTime}ms`);
    Sentry.captureMessage(`Analytics aggregation completed: ${processedCount} event types in ${Date.now() - startTime}ms`, 'info');
    
    return {
      success: true,
      message: 'Analytics aggregation completed',
      processedCount,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Analytics aggregation error:', error);
    Sentry.captureException(error);
    throw error;
  }
}
