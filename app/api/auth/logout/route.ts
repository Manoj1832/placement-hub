import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getCookieConfig, verifyJWT } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (token) {
      const payload = await verifyJWT(token);
      if (payload && redis) {
        // Delete session from Redis to ensure logout on this device
        await redis.del(`user:session:${payload.email}`);
      }
    }

    // Clear authentication cookie
    const isProd = process.env.NODE_ENV === "production";
    const cookieConfig = getCookieConfig(isProd);
    cookieStore.set(AUTH_COOKIE_NAME, "", {
      ...cookieConfig,
      maxAge: 0,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Logout API error:", err);
    return NextResponse.json({ error: "An unexpected error occurred during logout." }, { status: 500 });
  }
}
