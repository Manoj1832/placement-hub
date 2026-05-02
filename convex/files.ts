import { mutation } from "./_generated/server";
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

export const storeDocumentMeta = mutation({
  args: {
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    r2Key: v.string(),
    r2Bucket: v.string(),
    r2Url: v.string(),
    docType: v.union(
      v.literal("experience_source"),
      v.literal("resume"),
      v.literal("portfolio"),
      v.literal("resource_pack"),
      v.literal("github_report")
    ),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAuth(ctx);
    return ctx.db.insert("documents", {
      ...args,
      userId: user._id,
      createdAt: Date.now(),
    });
  },
});

export const getById = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});
