import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
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
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ isPremium: false, premiumUntil: null });
    }

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ isPremium: false, premiumUntil: null });
    }

    const result = await cachedQuery(
      cacheKeys.premiumStatus(email),
      async () => {
        const convexUser = await convex.query(api.users.getByEmail, {
          email: email,
        });

        if (!convexUser) {
          return { isPremium: false, premiumUntil: null };
        }

        const isPremium = convexUser.isPremium && (!convexUser.premiumUntil || convexUser.premiumUntil > Date.now());

        return {
          isPremium,
          premiumUntil: convexUser.premiumUntil || null,
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
