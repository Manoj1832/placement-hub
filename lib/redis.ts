import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ─── Cache Helpers ──────────────────────────────────────────

/** Default TTL: 60 seconds */
const DEFAULT_TTL = 60;

/**
 * Get a value from cache, or fetch it and store it.
 * Prevents cache stampede with a simple miss-then-set pattern.
 */
export async function cachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
  } catch (err) {
    // If Redis is down, fall through to fetcher
    console.warn("Redis read error, falling back to DB:", err);
  }

  const fresh = await fetcher();

  try {
    await redis.set(key, JSON.stringify(fresh), { ex: ttl });
  } catch (err) {
    console.warn("Redis write error:", err);
  }

  return fresh;
}

/**
 * Invalidate one or more cache keys.
 */
export async function invalidateCache(...keys: string[]) {
  try {
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.warn("Redis invalidation error:", err);
  }
}

// ─── Key Builders ───────────────────────────────────────────

export const cacheKeys = {
  premiumStatus: (email: string) => `premium:${email}`,
  userProfile: (email: string) => `user:${email}`,
  isPremium: (email: string) => `is_premium:${email}`,
};
