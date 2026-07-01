import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { checkRateLimitRedis } from "@/lib/redis";

// ─── Server-Side Product Catalog ──────────────────────────────────
// All pricing lives here. The frontend only sends a product key.
// This prevents any client-side tampering with the amount.
const PRODUCTS: Record<string, { amountPaise: number; description: string; type: string }> = {
  premium_3months: {
    amountPaise: 14900, // ₹149
    description: "Premium Access — 1 Month",
    type: "premium_3months",
  },
  resume_vault: {
    amountPaise: 19900, // ₹199
    description: "Resume Vault — ₹199 Lifetime",
    type: "resume_vault",
  },
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limit: 5 payment attempts per 10 minutes per user
    const rateLimit = await checkRateLimitRedis(`payment:${email}`, 5, 600);
    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: `Too many payment attempts. Try again in ${rateLimit.retryAfter}s` },
        { status: 429 }
      );
    }
    
    const { productId } = await req.json();

    // Validate product exists in our catalog
    const product = PRODUCTS[productId];
    if (!product) {
      return NextResponse.json({ error: "Invalid product" }, { status: 400 });
    }

    const Razorpay = (await import("razorpay")).default;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
    
    const order = await razorpay.orders.create({
      amount: product.amountPaise,
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        email: email,
        productId: productId,
        productType: product.type,
      },
    });
    
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      description: product.description,
      productId: productId,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SkbKWOUl89i06l",
    });
  } catch (err: any) {
    console.error("Razorpay order creation failed:", err);
    return NextResponse.json(
      { error: err?.message || "Order creation failed" },
      { status: 500 }
    );
  }
}
