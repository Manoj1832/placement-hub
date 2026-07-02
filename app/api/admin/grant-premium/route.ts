import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
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
    const userPayload = await getServerUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const email = userPayload.email;

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
