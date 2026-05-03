
redis
🔌 STEP 5: Create Redis client

Create file:

// lib/redis.ts
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
🧠 STEP 6: First test (IMPORTANT)

Create test API:

// app/api/test-redis/route.ts
import { redis } from "@/lib/redis";

export async function GET() {
  await redis.set("test", "working", { ex: 60 });
  const value = await redis.get("test");

  return Response.json({ value });
}

👉 Open:

http://localhost:3000/api/test-redis

✅ Expected:

{ "value": "working" }
🚀 STEP 7: Add caching to your app
Example: caching Convex query
import { redis } from "@/lib/redis";
import { convex } from "@/lib/convex";

export async function getUser(id: string) {
  const key = `user:${id}`;

  // 1. check cache
  const cached = await redis.get(key);
  if (cached) return cached;

  // 2. fetch from DB
  const user = await convex.query(api.users.get, { id });

  // 3. store in cache
  await redis.set(key, user, { ex: 60 });

  return user;
}
🧹 STEP 8: Cache invalidation (CRITICAL)

Whenever data changes:

await redis.del(`user:${id}`);

👉 If you skip this → users see outdated data

📊 STEP 9: What YOU should cache

Start with:

✅ High impact
Dashboard stats
User profile
Public resources
Listings / feeds
❌ Don’t cache
Auth/session data
Payment state (real-time)
Sensitive info
⚡ STEP 10: Smart patterns (VERY IMPORTANT)
1. Use short TTL
{ ex: 60 } // 1 minute
2. Use structured keys
user:123
dashboard:123
posts:page:1
3. Prevent cache stampede (basic)
if (!cached) {
  // fetch + set
}

(advanced locking later)

🧠 Real-world tip (important for YOU)

Since you're using Convex:

👉 Convex = real-time writes
👉 Redis = fast reads

Perfect combo when used like this:

Request → Redis → (miss) →  Convex → Redis → Response
✅ DONE CHECKLIST

✔ Redis connected
✔ API test working
✔ Cache implemented
✔ Invalidation added
Cache session (later with Redis)
