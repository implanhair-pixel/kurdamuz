import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export interface QueuedNotification {
  id: string;
  user_id: string;
  notification_type: string;
  payload: any;
  attempts: number;
  max_attempts: number;
}

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

export async function processNotificationQueue(batchSize: number = 50): Promise<number> {
  const now = new Date();

  const pendingNotifications = (await db.execute(sql`
    SELECT id, user_id, notification_type, payload, attempts, max_attempts
    FROM notification_queue
    WHERE status = 'pending' AND scheduled_at <= ${now}
    ORDER BY scheduled_at ASC
    LIMIT ${batchSize}
  `)) as unknown as QueuedNotification[];

  let processedCount = 0;

  for (const notification of pendingNotifications) {
    try {
      await db.execute(sql`
        UPDATE notification_queue
        SET status = 'processing'
        WHERE id = ${notification.id}
      `);

      console.log(
        `Delivering notification ${notification.id} (${notification.notification_type}) to user ${notification.user_id}`
      );

      await db.execute(sql`
        UPDATE notification_queue
        SET status = 'sent', sent_at = NOW(), error_message = NULL
        WHERE id = ${notification.id}
      `);

      processedCount += 1;
    } catch (error) {
      console.error(`Failed to send notification ${notification.id}:`, error);

      const attempts = Number(notification.attempts) || 0;
      const maxAttempts = Number(notification.max_attempts) || 3;
      const newAttempts = attempts + 1;

      if (newAttempts >= maxAttempts) {
        await db.execute(sql`
          UPDATE notification_queue
          SET status = 'failed',
              attempts = ${newAttempts},
              error_message = ${error instanceof Error ? error.message : 'Unknown error'}
          WHERE id = ${notification.id}
        `);
      } else {
        const backoffMs = Math.pow(2, newAttempts) * 1000;
        const retryAt = new Date(Date.now() + backoffMs);

        await db.execute(sql`
          UPDATE notification_queue
          SET status = 'pending',
              attempts = ${newAttempts},
              scheduled_at = ${retryAt},
              error_message = ${error instanceof Error ? error.message : 'Unknown error'}
          WHERE id = ${notification.id}
        `);
      }
    }
  }

  return processedCount;
}

export async function cleanupOldNotifications(): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const deleted = (await db.execute(sql`
    DELETE FROM notification_queue
    WHERE status = 'sent' AND sent_at < ${thirtyDaysAgo}
    RETURNING id
  `)) as unknown as Array<{ id: string }>;

  return deleted.length;
}
