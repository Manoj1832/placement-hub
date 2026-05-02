import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    type: v.optional(v.string()),
    isPremium: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db.query("resources").collect();

    if (args.type) {
      results = results.filter((r) => r.type === args.type);
    }
    if (args.isPremium !== undefined) {
      results = results.filter((r) => r.isPremium === args.isPremium);
    }

    return results;
  },
});

export const getById = query({
  args: { id: v.id("resources") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

export const getFree = query({
  handler: async (ctx) => {
    return ctx.db
      .query("resources")
      .filter((q) => q.eq(q.field("isPremium"), false))
      .collect();
  },
});
