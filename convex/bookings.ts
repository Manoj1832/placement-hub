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
    serviceType: v.union(
      v.literal("resume_review"),
      v.literal("github_audit"),
      v.literal("portfolio_audit")
    ),
    resumeDocId: v.optional(v.id("documents")),
    portfolioUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAuth(ctx);
    return ctx.db.insert("serviceBookings", {
      ...args,
      userId: user._id,
      bookingStatus: "pending",
      createdAt: Date.now(),
    });
  },
});

export const listByUser = query({
  handler: async (ctx) => {
    const { user } = await requireAuth(ctx);
    return ctx.db
      .query("serviceBookings")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("serviceBookings") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});
