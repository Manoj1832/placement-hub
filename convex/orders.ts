import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

async function requireAuth(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .first();
  if (!user) throw new Error("User not found");
  return { identity, user };
}

export const create = mutation({
  args: {
    productType: v.union(
      v.literal("premium_yearly"),
      v.literal("starter_kit"),
      v.literal("company_pack")
    ),
    productId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    razorpayOrderId: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAuth(ctx);
    return ctx.db.insert("orders", {
      ...args,
      userId: user._id,
      paymentStatus: "created",
      createdAt: Date.now(),
    });
  },
});

export const getByRazorpayId = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_razorpay_order", (q: any) =>
        q.eq("razorpayOrderId", args.orderId)
      )
      .collect();
    return orders[0] || null;
  },
});

export const markPaid = mutation({
  args: {
    orderId: v.id("orders"),
    razorpayPaymentId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      paymentStatus: "paid",
      razorpayPaymentId: args.razorpayPaymentId,
    });

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    if (order.productType === "premium_yearly") {
      const userOrders = await ctx.db
        .query("orders")
        .withIndex("by_user", (q: any) => q.eq("userId", order.userId))
        .collect();

      const userId = order.userId;
      const user = await ctx.db.get(userId);
      if (!user) throw new Error("User not found");

      const currentUntil = user.premiumUntil || 0;
      const now = Date.now();
      const startFrom = currentUntil > now ? currentUntil : now;
      const oneYear = 365 * 24 * 60 * 60 * 1000;

      await ctx.db.patch(userId, {
        isPremium: true,
        premiumUntil: startFrom + oneYear,
      });
    }
  },
});

export const getByUser = query({
  handler: async (ctx) => {
    const { user } = await requireAuth(ctx);
    return ctx.db
      .query("orders")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();
  },
});

/**
 * Grant premium by email — called from our trusted server-side API route
 * after Razorpay payment is verified. Does NOT require Convex auth since
 * the NextAuth session is validated in the API route itself.
 */
export const grantPremiumByEmail = mutation({
  args: {
    email: v.string(),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", args.email))
      .first();

    if (!user) throw new Error(`User not found for email: ${args.email}`);

    // Check for duplicate payment
    const existingOrders = await ctx.db
      .query("orders")
      .withIndex("by_razorpay_order", (q: any) =>
        q.eq("razorpayOrderId", args.razorpayOrderId)
      )
      .collect();

    if (existingOrders.length > 0) {
      // Already processed — idempotent
      return { alreadyProcessed: true };
    }

    // Create the order record
    const orderId = await ctx.db.insert("orders", {
      userId: user._id,
      productType: "premium_yearly",
      amount: args.amount,
      currency: "INR",
      razorpayOrderId: args.razorpayOrderId,
      razorpayPaymentId: args.razorpayPaymentId,
      paymentStatus: "paid",
      createdAt: Date.now(),
    });

    // Grant 365 days of premium
    const now = Date.now();
    const currentUntil = user.premiumUntil || 0;
    const startFrom = currentUntil > now ? currentUntil : now;
    const oneYear = 365 * 24 * 60 * 60 * 1000;

    await ctx.db.patch(user._id, {
      isPremium: true,
      premiumUntil: startFrom + oneYear,
    });

    return { orderId, premiumUntil: startFrom + oneYear };
  },
});
