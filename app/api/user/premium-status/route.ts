import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyJWT } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { cachedQuery, cacheKeys } from "@/lib/redis";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Check premium status for the currently signed-in user.
 * Cached in Redis for 60s to reduce Convex reads.
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ isPremium: false, premiumUntil: null });
    const payload = await verifyJWT(token);
    if (!payload?.email) {
      return NextResponse.json({ isPremium: false, premiumUntil: null });
    }

    const result = await cachedQuery(
      cacheKeys.premiumStatus(payload.email),
      async () => {
        const user = await convex.query(api.users.getByEmail, {
          email: payload.email,
        });

        if (!user) {
          return { isPremium: false, premiumUntil: null };
        }

        const isPremium = user.isPremium && (!user.premiumUntil || user.premiumUntil > Date.now());

        return {
          isPremium,
          premiumUntil: user.premiumUntil || null,
        };
      },
      60 // 1 minute TTL
    );

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Premium status check failed:", err);
    return NextResponse.json({ isPremium: false, premiumUntil: null });
  }
}
