import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyJWT } from "@/lib/auth";
import { checkRateLimitRedis } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyJWT(token);
    if (!payload?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limit: 5 payment attempts per 10 minutes per user
    const rateLimit = await checkRateLimitRedis(`payment:${payload.email}`, 5, 600);
    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: `Too many payment attempts. Try again in ${rateLimit.retryAfter}s` },
        { status: 429 }
      );
    }
    
    const { amount } = await req.json();

    const Razorpay = (await import("razorpay")).default;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
    
    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: `order_${payload.email}_${Date.now()}`,
    });
    
    return NextResponse.json({ orderId: order.id, amount: order.amount });
  } catch (err: any) {
    console.error("Razorpay order creation failed:", err);
    return NextResponse.json(
      { error: err?.message || "Order creation failed" },
      { status: 500 }
    );
  }
}
