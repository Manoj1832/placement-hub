import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { loginSchema, verifyPassword, createJWT, AUTH_COOKIE_NAME, getCookieConfig } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { redis } from "@/lib/redis";
import { cookies } from "next/headers";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { email, password } = result.data;

    // Retrieve user from Convex
    const user = await convex.query(api.users.getByEmail, { email });
    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Verify Password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Generate unique session ID to enforce single device login
    const sid = crypto.randomUUID();

    // Store active session in Redis to track device lock
    if (redis) {
      await redis.set(`user:session:${email}`, sid);
    }

    // Create JWT token
    const token = await createJWT({
      sub: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      sid,
    });

    // Set cookie
    const isProd = process.env.NODE_ENV === "production";
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, getCookieConfig(isProd));

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isPremium: user.isPremium,
      },
    });
  } catch (err: any) {
    console.error("Login API error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
