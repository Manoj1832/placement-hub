import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { amount } = await req.json();

    const Razorpay = (await import("razorpay")).default;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
    
    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: `order_${session.user.email}_${Date.now()}`,
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
