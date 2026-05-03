import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { loginSchema, verifyPassword, createJWT, checkRateLimit, GENERIC_ERROR, AUTH_COOKIE_NAME, getCookieConfig } from "@/lib/auth";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rateLimit = checkRateLimit(`login:${ip}`);
    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${rateLimit.retryAfter}s` },
        { status: 429 }
      );
    }

    // Parse body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const result = loginSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.errors[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, password } = result.data;
    const sanitizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await convex.query(api.users.getByEmail, {
      email: sanitizedEmail,
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: GENERIC_ERROR },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: GENERIC_ERROR },
        { status: 401 }
      );
    }

    // Create JWT
    const token = await createJWT({
      sub: user._id,
      email: user.email,
      name: user.name,
      role: user.role || "student",
    });

    // Set HTTP-only cookie
    const isProd = process.env.NODE_ENV === "production";
    const cookieConfig = getCookieConfig(isProd);

    const response = NextResponse.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: cookieConfig.httpOnly,
      secure: cookieConfig.secure,
      sameSite: cookieConfig.sameSite,
      path: cookieConfig.path,
      maxAge: cookieConfig.maxAge,
    });

    return response;
  } catch (err: any) {
    console.error("Login failed:", err);
    return NextResponse.json(
      { error: GENERIC_ERROR },
      { status: 500 }
    );
  }
}
