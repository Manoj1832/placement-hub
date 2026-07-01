import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * GET /api/admin/grant-premium
 * Grants 90 days of premium to the currently logged-in user.
 * For admin/testing purposes.
 */
export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "No email" }, { status: 400 });
    }

    // Grant premium via Convex
    await convex.mutation(api.orders.grantPremiumByEmail, {
      email,
      razorpayOrderId: "admin_grant_" + Date.now(),
      razorpayPaymentId: "admin_grant_" + Date.now(),
      amount: 0,
    });

    return NextResponse.json({
      success: true,
      message: `Premium granted to ${email} for 90 days`,
    });
  } catch (err: any) {
    console.error("Grant premium failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
