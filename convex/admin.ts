import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .first();
  if (!user || user.role !== "admin") throw new Error("Not an admin");
  return { identity, user };
}

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

export const getPending = query({
  handler: async (ctx) => {
    const { user } = await requireAdmin(ctx);
    return ctx.db
      .query("experiences")
      .withIndex("by_status", (q: any) => q.eq("status", "pending"))
      .collect();
  },
});

export const getAll = query({
  handler: async (ctx) => {
    const { user } = await requireAdmin(ctx);
    return ctx.db.query("experiences").collect();
  },
});

export const approve = mutation({
  args: {
    experienceId: v.id("experiences"),
    isVerified: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.experienceId, {
      status: "approved",
      isVerified: args.isVerified,
      updatedAt: Date.now(),
    });
  },
});

export const reject = mutation({
  args: { experienceId: v.id("experiences") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.experienceId, {
      status: "rejected",
      updatedAt: Date.now(),
    });
  },
});

export const getReports = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db
      .query("reports")
      .withIndex("by_status", (q: any) => q.eq("status", "open"))
      .collect();
  },
});

export const resolveReport = mutation({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.reportId, {
      status: "resolved",
    });
  },
});

export const getBookings = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db.query("serviceBookings").collect();
  },
});

export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("serviceBookings"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_review"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.bookingId, {
      bookingStatus: args.status,
    });
  },
});
