import { Redis } from "@upstash/redis";

// Initialize Upstash Redis Client
// We use fallback dummy values to prevent crashing during build if env vars are missing
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "https://dummy-url.upstash.io",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "dummy-token",
});

/**
 * Generic cached wrapper for Prisma queries.
 * @param key The unique string key for the cache.
 * @param fetcher A function that fetches the fresh data from the database.
 * @param ttlSeconds The cache expiration time in seconds.
 * @returns The cached or freshly fetched data.
 */
export async function cachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300, // default 5 minutes
): Promise<T> {
  // 1. Try to get data from Redis
  try {
    const cachedData = await redis.get<T>(key);
    if (cachedData) {
      return cachedData;
    }
  } catch (error) {
    console.error(`[Redis] Error fetching key "${key}":`, error);
    // If Redis fails, gracefully fallback to DB below
  }

  // 2. Fetch fresh data
  const freshData = await fetcher();

  // 3. Save to Redis in background
  try {
    await redis.set(key, freshData, { ex: ttlSeconds });
  } catch (error) {
    console.error(`[Redis] Error setting key "${key}":`, error);
  }

  return freshData;
}

/**
 * Delete one or more keys from Redis to invalidate cache.
 * Use this when mutations occur (create, update, delete).
 */
export async function invalidateCache(...keys: string[]) {
  if (keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch (error) {
    console.error(`[Redis] Error invalidating keys ${keys.join(", ")}:`, error);
  }
}
