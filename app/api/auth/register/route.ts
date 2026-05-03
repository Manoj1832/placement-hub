import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { registerSchema, sanitize, hashPassword, checkRateLimit, GENERIC_ERROR } from "@/lib/auth";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rateLimit = checkRateLimit(`register:${ip}`);
    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${rateLimit.retryAfter}s` },
        { status: 429 }
      );
    }

    // Parse and validate body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.errors[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, password } = result.data;

    // Sanitize inputs
    const sanitizedName = sanitize(name);
    const sanitizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await convex.query(api.users.getByEmail, {
      email: sanitizedEmail,
    });

    if (existing) {
      return NextResponse.json(
        { error: GENERIC_ERROR },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user in Convex
    await convex.mutation(api.users.registerUser, {
      name: sanitizedName,
      email: sanitizedEmail,
      hashedPassword,
    });

    return NextResponse.json(
      { success: true, message: "Account created successfully" },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Registration failed:", err);
    return NextResponse.json(
      { error: GENERIC_ERROR },
      { status: 500 }
    );
  }
}
