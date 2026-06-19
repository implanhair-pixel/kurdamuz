// Simple in-memory rate limiter for serverless functions
// Each Netlify function instance has its own memory — this is acceptable
// for initial launch. Upgrade to Redis when DAU > 10,000.

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  maxRequests: number;       // max requests
  windowMs: number;          // window in milliseconds
}

export function rateLimit(key: string, config: RateLimitConfig): {
  success: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { success: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  const result = rateLimit(identifier, { maxRequests: config.maxRequests, windowMs: config.windowMs });
  return {
    success: result.success,
    remaining: result.remaining,
    resetTime: result.resetAt,
  };
}

export async function getRateLimitHeaders(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }
): Promise<Record<string, string>> {
  const now = Date.now();
  const entry = store.get(identifier);
  
  const currentCount = entry && now <= entry.resetAt ? entry.count : 0;
  const remaining = Math.max(0, config.maxRequests - currentCount);

  return {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': (now + config.windowMs).toString(),
  };
}
