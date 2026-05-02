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
      v.literal("premium_monthly"),
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

    if (order.productType === "premium_monthly") {
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
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;

      await ctx.db.patch(userId, {
        isPremium: true,
        premiumUntil: startFrom + thirtyDays,
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
