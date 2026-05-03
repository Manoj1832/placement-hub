import { redis } from "@/lib/redis";

export async function GET() {
  try {
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
