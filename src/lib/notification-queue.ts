import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

/**
 * Add notification to queue for async delivery
 */
export async function queueNotification(
  userId: string,
  notificationType: string,
  payload: any,
  scheduledAt?: Date
): Promise<void> {
  await db.execute(sql`
    INSERT INTO notification_queue (id, user_id, notification_type, payload, status, attempts, max_attempts, scheduled_at)
    VALUES (${randomUUID()}, ${userId}, ${notificationType}, ${JSON.stringify(payload)}, 'pending', 0, 3, ${scheduledAt || new Date()})
  `);
}

/**
 * Process pending notifications from queue
 */
export async function processNotificationQueue(batchSize: number = 50): Promise<number> {
  const now = new Date();
  
  // Get pending notifications that are ready to be sent
  const pendingNotifications = await db.execute(sql`
    SELECT id, user_id, notification_type, payload, attempts, max_attempts
    FROM notification_queue
    WHERE status = 'pending' AND scheduled_at <= ${now}
    LIMIT ${batchSize}
  `);

  let processedCount = 0;

  for (const notification of pendingNotifications) {
    try {
      // Mark as processing
      await db.execute(sql`
        UPDATE notification_queue
        SET status = 'processing'
        WHERE id = ${notification.id}
      `);

      // TODO: Actually send the notification (email, push, in-app, etc.)
      // This would integrate with email service, push notification service, etc.
      console.log(`Sending notification ${notification.id} to user ${notification.user_id}`);

      // Mark as sent
      await db.execute(sql`
        UPDATE notification_queue
        SET status = 'sent', sent_at = NOW()
        WHERE id = ${notification.id}
      `);

      processedCount++;
    } catch (error) {
      console.error(`Failed to send notification ${notification.id}:`, error);

      // Increment attempts and mark as failed if max attempts reached
      const attempts = Number(notification.attempts) || 0;
      const maxAttempts = Number(notification.max_attempts) || 3;
      const newAttempts = attempts + 1;
      if (newAttempts >= maxAttempts) {
        await db.execute(sql`
          UPDATE notification_queue
          SET status = 'failed', attempts = ${newAttempts}, error_message = ${error instanceof Error ? error.message : 'Unknown error'}
          WHERE id = ${notification.id}
        `);
      } else {
        // Retry later with exponential backoff
        const backoffMs = Math.pow(2, newAttempts) * 1000; // 2s, 4s, 8s
        const retryAt = new Date(Date.now() + backoffMs);
        
        await db.execute(sql`
          UPDATE notification_queue
          SET status = 'pending', attempts = ${newAttempts}, scheduled_at = ${retryAt}
          WHERE id = ${notification.id}
        `);
      }
    }
  }

  return processedCount;
}

/**
 * Clean up old sent notifications (older than 30 days)
 */
export async function cleanupOldNotifications(): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await db.execute(sql`
    DELETE FROM notification_queue
    WHERE status = 'sent' AND sent_at < ${thirtyDaysAgo}
  `);

  // Return estimated count (actual count would require a separate query)
  return 0;
}
