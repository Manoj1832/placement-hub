import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyJWT } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Called after NextAuth sign-in to ensure user exists in Convex DB.
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const payload = await verifyJWT(token);
    if (!payload?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = await convex.mutation(api.users.getOrCreateByEmail, {
      email: payload.email,
      name: payload.name || "PSG Student",
    });

    return NextResponse.json({ userId });
  } catch (err: any) {
    console.error("User sync failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Check premium status for the current session user.
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ isPremium: false });
    const payload = await verifyJWT(token);
    if (!payload?.email) {
      return NextResponse.json({ isPremium: false });
    }

    const isPremium = await convex.query(api.users.isPremiumByEmail, {
      email: payload.email,
    });

    return NextResponse.json({ isPremium });
  } catch (err: any) {
    console.error("Premium check failed:", err);
    return NextResponse.json({ isPremium: false });
  }
}
