import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { amount } = await req.json();

    // Dynamic import to avoid crashes if razorpay module isn't configured
    const Razorpay = (await import("razorpay")).default;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
    
    const order = await razorpay.orders.create({
      amount: amount, // amount already in paise from frontend (9900 = ₹99)
      currency: "INR",
      receipt: `order_${userId}_${Date.now()}`,
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