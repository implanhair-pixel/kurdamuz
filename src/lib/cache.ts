import { unstable_cache, revalidateTag } from 'next/cache';

export { unstable_cache as cache, revalidateTag };

export interface CacheOptions {
  ttl?: number; // Time to live in seconds (for reference only, Next.js handles revalidation)
  tags?: string[]; // Cache tags for revalidation
}

/**
 * Get cached value using Next.js unstable_cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  // Next.js unstable_cache handles caching internally
  // This function is kept for API compatibility
  return null;
}

/**
 * Set cached value using Next.js unstable_cache
 */
export async function setCache<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
  // Next.js unstable_cache handles caching internally
  // This function is kept for API compatibility
}

/**
 * Delete cached value
 */
export async function deleteCache(key: string, options?: CacheOptions): Promise<void> {
  // Use revalidateTag for cache invalidation
  if (options?.tags) {
    for (const tag of options.tags) {
      (revalidateTag as any)(tag);
    }
  }
}

/**
 * Invalidate cache by tag
 */
export async function invalidateCacheByTag(tag: string): Promise<void> {
  (revalidateTag as any)(tag);
}

/**
 * Cache wrapper function using Next.js unstable_cache
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  // Use Next.js unstable_cache for caching
  const cachedFetcher = unstable_cache(
    fetcher,
    [key],
    {
      revalidate: options?.ttl || 3600, // Default 1 hour
      tags: options?.tags,
    }
  );
  
  return await cachedFetcher();
}

/**
 * Generate cache key with parameters
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const paramString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join('&');
  
  return paramString ? `${prefix}:${paramString}` : prefix;
}
