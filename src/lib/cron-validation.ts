import { headers } from 'next/headers';

/**
 * Validates the x-cron-secret header for cron job security
 * @throws Error if validation fails
 */
export async function validateCronSecret(): Promise<void> {
  const headersList = await headers();
  const cronSecret = headersList.get('x-cron-secret');

  if (!cronSecret) {
    throw new Error('Missing x-cron-secret header');
  }

  if (cronSecret !== process.env.CRON_SECRET) {
    throw new Error('Invalid cron secret');
  }
}

/**
 * Wraps a cron job handler with secret validation and error logging
 */
export function withCronValidation<T extends (...args: any[]) => Promise<Response>>(
  handler: T
): T {
  return (async (...args: Parameters<T>): Promise<Response> => {
    try {
      await validateCronSecret();
      return await handler(...args);
    } catch (error) {
      console.error('Cron job validation error:', error);
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }) as T;
}
