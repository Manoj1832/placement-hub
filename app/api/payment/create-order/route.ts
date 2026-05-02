import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { amount, productType, productId } = await req.json();
  
  const order = await createRazorpayOrder({
    amount,
    currency: "INR",
    receipt: `order_${Date.now()}`,
  });
  
  return NextResponse.json({ orderId: order.id, amount: order.amount });
}