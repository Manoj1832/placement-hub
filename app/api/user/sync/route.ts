import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { cachedQuery, cacheKeys } from "@/lib/redis";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Ensures user details are synced and returns the authenticated user data.
 */
export async function POST(req: NextRequest) {
  try {
    const userPayload = await getServerUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Retrieve full user record from Convex DB
    const user = await convex.query(api.users.getByEmail, { email: userPayload.email });
    if (!user) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      userId: user._id,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isPremium: user.isPremium,
      },
    });
  } catch (err: any) {
    console.error("User sync failed:", err);
    return NextResponse.json({ error: err.message || "An unexpected error occurred." }, { status: 500 });
  }
}

/**
 * Check premium status and get profile for the current session user.
 * Cached in Redis for 60s.
 */
export async function GET(req: NextRequest) {
  try {
    const userPayload = await getServerUser();
    if (!userPayload) {
      return NextResponse.json({ isPremium: false, user: null });
    }

    const email = userPayload.email;

    const isPremium = await cachedQuery(
      cacheKeys.isPremium(email),
      async () => {
        return await convex.query(api.users.isPremiumByEmail, {
          email: email,
        });
      },
      60 // 1 minute TTL
    );

    // Fetch live user info (e.g. role, name)
    const userRecord = await convex.query(api.users.getByEmail, { email });

    return NextResponse.json({
      isPremium,
      user: userRecord ? {
        id: userRecord._id,
        email: userRecord.email,
        name: userRecord.name,
        role: userRecord.role,
      } : null,
    });
  } catch (err: any) {
    console.error("Premium check failed:", err);
    return NextResponse.json({ isPremium: false, user: null });
  }
}
