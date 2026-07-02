import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { invalidateCache, cacheKeys } from "@/lib/redis";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const PRODUCT_AMOUNTS: Record<string, number> = {
  premium_3months: 14900,
  resume_vault: 19900,
};

export async function POST(req: NextRequest) {
  try {
    const userPayload = await getServerUser();
    if (!userPayload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const email = userPayload.email;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, productId } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    // 1. Verify the Razorpay signature (cryptographic — cannot be spoofed)
    const crypto = await import("crypto");
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      console.error("Payment Verification: RAZORPAY_KEY_SECRET is not configured");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Cross-verify the order amount with Razorpay API to prevent tampering
    const Razorpay = (await import("razorpay")).default;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.fetch(razorpay_order_id);
    const resolvedProductId = productId || order.notes?.productId || "premium_3months";
    const expectedAmount = PRODUCT_AMOUNTS[resolvedProductId];

    if (!expectedAmount || order.amount !== expectedAmount) {
      console.error(`Amount mismatch! Order: ${order.amount}, Expected: ${expectedAmount}, Product: ${resolvedProductId}`);
      return NextResponse.json({ error: "Payment amount mismatch. Possible tampering detected." }, { status: 400 });
    }

    if (order.status !== "paid") {
      return NextResponse.json({ error: "Order not yet paid" }, { status: 400 });
    }

    // 3. Grant premium to the user via Convex
    await convex.mutation(api.orders.grantPremiumByEmail, {
      email: email,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount: expectedAmount,
    });

    // 4. Invalidate cached premium status so user sees update immediately
    await invalidateCache(
      cacheKeys.premiumStatus(email),
      cacheKeys.isPremium(email),
      cacheKeys.userProfile(email)
    );

    return NextResponse.json({ success: true, message: "Premium access granted!" });
  } catch (err: any) {
    console.error("Payment verification failed:", err);
    return NextResponse.json(
      { error: err?.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
