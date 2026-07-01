import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { cachedQuery, cacheKeys } from "@/lib/redis";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Called after sign-in to ensure user exists in Convex DB.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "No email address found" }, { status: 400 });
    }

    const name = user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "PSG Student";

    // Use createOrUpdate with the actual Clerk user ID so Convex can verify user identity correctly
    const userId = await convex.mutation(api.users.createOrUpdate, {
      clerkId: clerkUserId,
      email: email,
      name: name,
    });

    return NextResponse.json({ userId });
  } catch (err: any) {
    console.error("User sync failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Check premium status for the current session user.
 * Cached in Redis for 60s.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ isPremium: false });
    }

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ isPremium: false });
    }

    const isPremium = await cachedQuery(
      cacheKeys.isPremium(email),
      async () => {
        return await convex.query(api.users.isPremiumByEmail, {
          email: email,
        });
      },
      60 // 1 minute TTL
    );

    return NextResponse.json({ isPremium });
  } catch (err: any) {
    console.error("Premium check failed:", err);
    return NextResponse.json({ isPremium: false });
  }
}
