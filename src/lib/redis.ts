import { Redis } from "@upstash/redis";

// Lazy initialization — tidak diinisialisasi saat module di-load,
// hanya saat pertama kali dipakai
let _redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return _redis;
}

export async function cachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300,
): Promise<T> {
  const redis = getRedisClient();

  // Kalau Redis tidak tersedia (build time atau env missing),
  // langsung fetch dari DB tanpa caching
  if (!redis) {
    return fetcher();
  }

  try {
    const cachedData = await redis.get<T>(key);
    if (cachedData) return cachedData;
  } catch (error) {
    console.error(`[Redis] Error fetching key "${key}":`, error);
  }

  const freshData = await fetcher();

  try {
    await redis.set(key, freshData, { ex: ttlSeconds });
  } catch (error) {
    console.error(`[Redis] Error setting key "${key}":`, error);
  }

  return freshData;
}

export async function invalidateCache(...keys: string[]) {
  const redis = getRedisClient();
  if (!redis || keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch (error) {
    console.error(`[Redis] Error invalidating keys ${keys.join(", ")}:`, error);
  }
}
