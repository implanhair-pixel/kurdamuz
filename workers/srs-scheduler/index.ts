/**
 * Cloudflare Worker: SRS Daily Queue Generator
 * 
 * This worker runs daily to generate review queues for all users.
 * It should be scheduled using Cloudflare Cron Triggers.
 * 
 * Cron schedule: Run daily at 00:00 UTC
 * 
 * Environment variables required:
 * - DATABASE_URL: PostgreSQL connection string
 * - API_SECRET: Secret key for API authentication
 */

export interface Env {
  DATABASE_URL: string;
  API_SECRET: string;
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('SRS Queue Generator triggered at:', new Date(event.scheduledTime).toISOString());

    try {
      // Get list of users who need queue generation
      const users = await fetchUsersWithSrsItems(env.DATABASE_URL);

      console.log(`Found ${users.length} users with SRS items`);

      let successCount = 0;
      let errorCount = 0;

      for (const userId of users) {
        try {
          // Generate daily queue for each user
          await generateQueueForUser(userId, env.DATABASE_URL, env.API_SECRET);
          successCount++;
          console.log(`Generated queue for user ${userId}`);
        } catch (error) {
          errorCount++;
          console.error(`Error generating queue for user ${userId}:`, error);
        }
      }

      console.log(`Queue generation complete: ${successCount} successful, ${errorCount} errors`);
    } catch (error) {
      console.error('Fatal error in queue generation:', error);
      throw error;
    }
  },
};

async function fetchUsersWithSrsItems(databaseUrl: string): Promise<string[]> {
  // Query to get unique user IDs from srs_items table
  const response = await fetch(`${databaseUrl}/rest/srs_items?select=user_id`, {
    method: 'GET',
    headers: {
      'apikey': process.env.SUPABASE_ANON_KEY || '',
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  const data = await response.json();
  return [...new Set(data.map((item: any) => item.user_id))];
}

async function generateQueueForUser(userId: string, databaseUrl: string, apiSecret: string): Promise<void> {
  // Call the internal API endpoint to generate queue
  const response = await fetch('http://localhost:3000/api/internal/srs/generate-queue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiSecret}`,
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate queue for user ${userId}: ${response.statusText}`);
  }

  return response.json();
}
