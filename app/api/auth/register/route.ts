import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { registerSchema, hashPassword, createJWT, AUTH_COOKIE_NAME, getCookieConfig } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { redis } from "@/lib/redis";
import { cookies } from "next/headers";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { email, name, password } = result.data;

    // Check if user already exists
    const existing = await convex.query(api.users.getByEmail, { email });
    if (existing) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Register user in Convex
    const userId = await convex.mutation(api.users.registerUser, {
      email,
      name,
      hashedPassword,
    });

    // Generate unique session ID to enforce single device login
    const sid = crypto.randomUUID();

    // Store active session in Redis to track device lock
    if (redis) {
      await redis.set(`user:session:${email}`, sid);
    }

    // Create JWT token
    const token = await createJWT({
      sub: userId,
      email,
      name,
      role: "student",
      sid,
    });

    // Set cookie
    const isProd = process.env.NODE_ENV === "production";
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, getCookieConfig(isProd));

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        name,
        role: "student",
        isPremium: false,
      },
    });
  } catch (err: any) {
    console.error("Register API error:", err);
    return NextResponse.json({ error: err.message || "An unexpected error occurred." }, { status: 500 });
  }
}
