import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyJWT } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyJWT(token);
    if (!payload?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    // 1. Verify the Razorpay signature
    const crypto = await import("crypto");
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Grant premium to the user via Convex
    await convex.mutation(api.orders.grantPremiumByEmail, {
      email: payload.email,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount: 9900,
    });

    return NextResponse.json({ success: true, message: "Premium access granted!" });
  } catch (err: any) {
    console.error("Payment verification failed:", err);
    return NextResponse.json(
      { error: err?.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
