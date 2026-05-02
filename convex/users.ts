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

export const createOrUpdate = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    branch: v.optional(v.string()),
    graduationYear: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        branch: args.branch,
        graduationYear: args.graduationYear,
      });
      return existing._id;
    }

    return ctx.db.insert("users", {
      ...args,
      role: "student",
      isPremium: false,
      badges: [],
      createdAt: Date.now(),
    });
  },
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .first();
  },
});

export const grantPremium = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const currentUntil = user.premiumUntil || 0;
    const now = Date.now();
    const startFrom = currentUntil > now ? currentUntil : now;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    await ctx.db.patch(args.userId, {
      isPremium: true,
      premiumUntil: startFrom + thirtyDays,
    });
  },
});

export const isPremium = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) return false;
    if (!user.isPremium) return false;
    if (user.premiumUntil && user.premiumUntil < Date.now()) {
      return false;
    }
    return true;
  },
});
