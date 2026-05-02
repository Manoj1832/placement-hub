import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/razorpay-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();
    const sig = request.headers.get("x-razorpay-signature") ?? "";
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(body)
    );
    const expected = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (sig !== expected) {
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === "payment.captured") {
      const orderId = event.payload.payment.entity.order_id;
      const paymentId = event.payload.payment.entity.id;

      const order = await ctx.runQuery(api.orders.getByRazorpayId, {
        orderId,
      });

      if (order) {
        await ctx.runMutation(api.orders.markPaid, {
          orderId: order._id,
          razorpayPaymentId: paymentId,
        });
      }
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
