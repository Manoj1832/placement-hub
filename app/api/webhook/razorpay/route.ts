import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { invalidateCache, cacheKeys } from "@/lib/redis";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Razorpay Webhook Handler
 * 
 * This endpoint is called directly by Razorpay servers when a payment event occurs.
 * It does NOT require user authentication — instead it verifies the request
 * using the webhook secret signature from Razorpay.
 * 
 * Events to subscribe: order.paid, payment.captured
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Read the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("Webhook: Missing x-razorpay-signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // 2. Verify the webhook signature using HMAC SHA256
    const crypto = await import("crypto");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Webhook: Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 3. Parse the verified payload
    const event = JSON.parse(body);
    console.log("Webhook event received:", event.event);

    // 4. Handle the event
    switch (event.event) {
      case "order.paid":
      case "payment.captured": {
        const payment = event.payload?.payment?.entity;
        if (!payment) {
          console.error("Webhook: No payment entity in payload");
          return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const email = payment.notes?.email;
        const razorpayOrderId = payment.order_id;
        const razorpayPaymentId = payment.id;
        const amount = payment.amount; // in paise

        if (!email) {
          console.error("Webhook: No email found in payment notes. Payment ID:", razorpayPaymentId);
          return NextResponse.json({ error: "No email in notes" }, { status: 400 });
        }

        console.log(`Webhook: Processing payment for ${email}, Order: ${razorpayOrderId}, Payment: ${razorpayPaymentId}`);

        // 5. Grant premium via Convex (idempotent — safe to call multiple times)
        try {
          const result = await convex.mutation(api.orders.grantPremiumByEmail, {
            email,
            razorpayOrderId,
            razorpayPaymentId,
            amount,
          });

          console.log("Webhook: Premium granted successfully:", result);

          // 6. Invalidate Redis cache so user sees premium status immediately
          try {
            await invalidateCache(
              cacheKeys.premiumStatus(email),
              cacheKeys.isPremium(email),
              cacheKeys.userProfile(email)
            );
          } catch (cacheErr) {
            // Cache invalidation failure is non-critical
            console.warn("Webhook: Cache invalidation failed (non-critical):", cacheErr);
          }
        } catch (convexErr: any) {
          // If user not found, log but don't retry — the user may not have registered yet
          console.error("Webhook: Convex mutation failed:", convexErr?.message);
          return NextResponse.json(
            { error: "Failed to process payment" },
            { status: 500 }
          );
        }

        break;
      }

      case "payment.failed": {
        const payment = event.payload?.payment?.entity;
        console.warn("Webhook: Payment failed for order:", payment?.order_id, "Reason:", payment?.error_description);
        // You could log this to a separate table or send an alert
        break;
      }

      default:
        console.log("Webhook: Unhandled event type:", event.event);
    }

    // Always return 200 to Razorpay so it doesn't retry
    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("Webhook: Unexpected error:", err);
    // Return 200 even on errors to prevent Razorpay from retrying indefinitely
    // The error is already logged for investigation
    return NextResponse.json({ status: "error", message: err?.message }, { status: 200 });
  }
}
