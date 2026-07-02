import { redis } from "@/lib/redis";

export async function GET() {
  try {
    if (!redis) {
      return Response.json({ status: "error", message: "Redis is not configured in environment variables" }, { status: 400 });
    }
    await redis.set("test", "working", { ex: 60 });
    const value = await redis.get("test");

    return Response.json({ status: "ok", value, timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error("Redis test failed:", err);
    return Response.json(
      { status: "error", message: err?.message || "Redis connection failed" },
      { status: 500 }
    );
  }
}
