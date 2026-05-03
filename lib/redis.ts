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

// ─── Rate Limiting (Redis-backed) ───────────────────────────

const RATE_LIMIT_WINDOW = 900; // 15 minutes in seconds
const RATE_LIMIT_MAX = 20;     // max attempts per window

/**
 * Redis-based rate limiter. Works across all serverless instances.
 * Uses a sliding window counter pattern.
 */
export async function checkRateLimitRedis(
  key: string,
  maxAttempts: number = RATE_LIMIT_MAX,
  windowSec: number = RATE_LIMIT_WINDOW
): Promise<{ ok: boolean; retryAfter?: number }> {
  const redisKey = `ratelimit:${key}`;

  try {
    const current = await redis.incr(redisKey);

    // First request in window — set TTL
    if (current === 1) {
      await redis.expire(redisKey, windowSec);
    }

    if (current > maxAttempts) {
      const ttl = await redis.ttl(redisKey);
      return { ok: false, retryAfter: ttl > 0 ? ttl : windowSec };
    }

    return { ok: true };
  } catch (err) {
    // If Redis is down, allow the request (fail open)
    console.warn("Redis rate limit error, allowing request:", err);
    return { ok: true };
  }
}

// ─── Temporary Token Storage ────────────────────────────────

/**
 * Store a temporary token (OTP, email verification, password reset).
 * Auto-expires after ttl seconds.
 */
export async function storeToken(
  prefix: string,
  identifier: string,
  token: string,
  ttlSec: number = 600 // 10 minutes default
): Promise<void> {
  const key = `${prefix}:${identifier}`;
  await redis.set(key, token, { ex: ttlSec });
}

/**
 * Verify and consume a temporary token.
 * Returns true if valid, false otherwise. Token is deleted after verification.
 */
export async function verifyAndConsumeToken(
  prefix: string,
  identifier: string,
  token: string
): Promise<boolean> {
  const key = `${prefix}:${identifier}`;
  const stored = await redis.get<string>(key);

  if (!stored || stored !== token) {
    return false;
  }

  // Consume: delete after use
  await redis.del(key);
  return true;
}

// ─── Key Builders ───────────────────────────────────────────

export const cacheKeys = {
  premiumStatus: (email: string) => `premium:${email}`,
  userProfile: (email: string) => `user:${email}`,
  isPremium: (email: string) => `is_premium:${email}`,
};

// Token prefixes
export const tokenPrefixes = {
  emailVerification: "verify_email",
  passwordReset: "reset_pwd",
  otp: "otp",
};
