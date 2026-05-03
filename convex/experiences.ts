import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

async function requireAuth(ctx: any) {
  // Stub for now - auth handled at API layer
  return { identity: null, user: { _id: null as any } };
}

async function getOptionalUser(ctx: any) {
  // No auth check in Convex - auth handled at API layer
  return null;
}

/**
 * List all approved experiences.
 * Only first 5 experiences are free - rest require premium.
 */
export const list = query({
  args: {
    company: v.optional(v.string()),
    type: v.optional(v.string()),
    branch: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    isPremium: v.optional(v.boolean()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db
      .query("experiences")
      .withIndex("by_status", (q: any) => q.eq("status", "approved"))
      .collect();

    // Sort by upvotes to show most popular first
    results = results.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));

    // Filter based on args
    const filtered = results.filter((e) => {
      if (args.company && !e.companyName?.toLowerCase().includes(args.company.toLowerCase())) return false;
      if (args.type && e.opportunityType !== args.type) return false;
      if (args.branch && e.branch !== args.branch) return false;
      if (args.difficulty && e.difficulty !== args.difficulty) return false;
      if (args.isPremium !== undefined && e.isPremium !== args.isPremium) return false;
      
      if (args.search) {
        const searchLower = args.search.toLowerCase();
        const searchFields = [
          e.companyName?.toLowerCase() || "",
          e.roleTitle?.toLowerCase() || "",
          e.tags?.join(" ").toLowerCase() || "",
          e.tips?.toLowerCase() || "",
        ].join(" ");
        if (!searchFields.includes(searchLower)) return false;
      }
      return true;
    });

    // ARCHITECTURE OPTIMIZATION:
    // Strip out heavy fields that are not needed for the UI cards.
    // roundsJson, questionsAsked, and experienceNarrative can be huge!
    return filtered.map((e) => ({
      _id: e._id,
      _creationTime: e._creationTime,
      companyName: e.companyName,
      roleTitle: e.roleTitle,
      opportunityType: e.opportunityType,
      difficulty: e.difficulty,
      isPremium: e.isPremium,
      isFreePreview: e.isFreePreview,
      location: e.location,
      compensation: e.compensation,
      year: e.year,
      month: e.month,
      totalRounds: e.totalRounds,
      isVerified: e.isVerified,
      upvotes: e.upvotes,
      tags: e.tags, // needed for client-side search
    }));
  },
});

/**
 * Paginated list of approved experiences.
 * Returns experiences in chunks for faster initial load and infinite scroll.
 */
export const paginatedList = query({
  args: {
    cursor: v.optional(v.string()),
    numItems: v.optional(v.number()),
    company: v.optional(v.string()),
    type: v.optional(v.string()),
    branch: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get all approved experiences
    let results = await ctx.db
      .query("experiences")
      .withIndex("by_status", (q: any) => q.eq("status", "approved"))
      .collect();

    // Sort by upvotes
    results = results.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));

    // Apply filters
    const filtered = results.filter((e) => {
      if (args.company && !e.companyName?.toLowerCase().includes(args.company.toLowerCase())) return false;
      if (args.type && e.opportunityType !== args.type) return false;
      if (args.branch && e.branch !== args.branch) return false;
      if (args.difficulty && e.difficulty !== args.difficulty) return false;

      if (args.search) {
        const searchLower = args.search.toLowerCase();
        const searchFields = [
          e.companyName?.toLowerCase() || "",
          e.roleTitle?.toLowerCase() || "",
          e.tags?.join(" ").toLowerCase() || "",
        ].join(" ");
        if (!searchFields.includes(searchLower)) return false;
      }
      return true;
    });

    // Manual pagination
    const cursorPos = Number(args.cursor ?? "0");
    const pageSize = args.numItems ?? 8;
    const page = filtered.slice(cursorPos, cursorPos + pageSize);
    const nextCursor = cursorPos + pageSize;
    const isDone = nextCursor >= filtered.length;

    return {
      page: page.map((e) => ({
        _id: e._id,
        _creationTime: e._creationTime,
        companyName: e.companyName,
        roleTitle: e.roleTitle,
        opportunityType: e.opportunityType,
        difficulty: e.difficulty,
        isPremium: e.isPremium,
        isFreePreview: e.isFreePreview,
        location: e.location,
        compensation: e.compensation,
        year: e.year,
        month: e.month,
        totalRounds: e.totalRounds,
        isVerified: e.isVerified,
        upvotes: e.upvotes,
        tags: e.tags,
      })),
      isDone,
      continueCursor: isDone ? null : String(nextCursor),
    };
  },
});

/**
 * Search experiences by company, role, or topic (alias for list with search)
 */
export const search = query({
  args: {
    q: v.optional(v.string()),
    type: v.optional(v.string()),
    difficulty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Reuse the list function logic with search parameter
    const results = await ctx.db
      .query("experiences")
      .withIndex("by_status", (q: any) => q.eq("status", "approved"))
      .collect();

    const searchLower = args.q?.toLowerCase() || "";

    return results.filter((e) => {
      if (args.type && e.opportunityType !== args.type) return false;
      if (args.difficulty && e.difficulty !== args.difficulty) return false;
      
      if (searchLower) {
        const searchFields = [
          e.companyName?.toLowerCase() || "",
          e.roleTitle?.toLowerCase() || "",
          e.tags?.join(" ").toLowerCase() || "",
          e.tips?.toLowerCase() || "",
          e.questionsAsked?.join(" ").toLowerCase() || "",
        ].join(" ");
        
        if (!searchFields.includes(searchLower)) return false;
      }
      
      return true;
    }).sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  },
});

/**
 * Get distinct companies list for autocomplete
 */
export const getCompanies = query({
  handler: async (ctx) => {
    const results = await ctx.db
      .query("experiences")
      .withIndex("by_status", (q: any) => q.eq("status", "approved"))
      .collect();
    
    const companies = [...new Set(results.map(e => e.companyName).filter(Boolean))];
    return companies.sort();
  },
});

/**
 * Get experience by ID.
 * Returns full data for free preview experiences.
 * Returns limited data for premium experiences (unless user is premium).
 */
export const getById = query({
  args: { 
    id: v.id("experiences"),
    userEmail: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const experience = await ctx.db.get(args.id);
    if (!experience) return null;

    // Free preview — always return full data
    if (experience.isFreePreview) {
      return { ...experience, accessLevel: "full" as const };
    }

    // Check if user has premium via email
    let isPremiumUser = false;
    if (args.userEmail) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q: any) => q.eq("email", args.userEmail))
        .first();
      
      if (user && user.isPremium && (!user.premiumUntil || user.premiumUntil > Date.now())) {
        isPremiumUser = true;
      }
    }

    if (isPremiumUser) {
      return { ...experience, accessLevel: "full" as const };
    }

    // Non-premium user viewing premium content — return limited data
    return {
      _id: experience._id,
      _creationTime: experience._creationTime,
      companyName: experience.companyName,
      roleTitle: experience.roleTitle,
      opportunityType: experience.opportunityType,
      branch: experience.branch,
      year: experience.year,
      month: experience.month,
      difficulty: experience.difficulty,
      isAnonymous: experience.isAnonymous,
      isVerified: experience.isVerified,
      isPremium: experience.isPremium,
      isFreePreview: experience.isFreePreview,
      status: experience.status,
      upvotes: experience.upvotes,
      totalRounds: experience.totalRounds,
      overallRating: experience.overallRating,
      finalResult: experience.finalResult,
      tags: experience.tags,
      location: experience.location,
      workMode: experience.workMode,
      duration: experience.duration,
      compensation: experience.compensation,
      createdAt: experience.createdAt,
      updatedAt: experience.updatedAt,
      // These are hidden for non-premium
      oaDetails: undefined,
      round1: undefined,
      round2: undefined,
      round3: undefined,
      hrRound: undefined,
      questionsAsked: [],
      tips: "",
      roundsJson: undefined,
      keyTips: undefined,
      mistakesToAvoid: undefined,
      preparationResources: undefined,
      experienceNarrative: undefined,
      accessLevel: "limited" as const,
    };
  },
});

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 3;
    const results = await ctx.db
      .query("experiences")
      .withIndex("by_status", (q: any) => q.eq("status", "approved"))
      .collect();
    return results
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  },
});

export const getDistinctCompanies = query({
  handler: async (ctx) => {
    const results = await ctx.db
      .query("experiences")
      .withIndex("by_status", (q: any) => q.eq("status", "approved"))
      .collect();
    const companies = new Set(results.map((e) => e.companyName));
    return Array.from(companies).sort();
  },
});

/**
 * Get stats for the homepage.
 */
export const getStats = query({
  handler: async (ctx) => {
    const experiences = await ctx.db
      .query("experiences")
      .withIndex("by_status", (q: any) => q.eq("status", "approved"))
      .collect();

    const companies = new Set(experiences.map((e) => e.companyName));
    const freeCount = experiences.filter((e) => e.isFreePreview).length;

    return {
      totalExperiences: experiences.length,
      totalCompanies: companies.size,
      freeExperiences: freeCount,
    };
  },
});

export const submit = mutation({
  args: {
    companyName: v.string(),
    roleTitle: v.string(),
    opportunityType: v.union(v.literal("internship"), v.literal("fulltime")),
    branch: v.string(),
    cgpaNote: v.optional(v.string()),
    year: v.number(),
    month: v.number(),
    oaDetails: v.optional(v.string()),
    round1: v.optional(v.string()),
    round2: v.optional(v.string()),
    round3: v.optional(v.string()),
    hrRound: v.optional(v.string()),
    questionsAsked: v.array(v.string()),
    tips: v.string(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    isAnonymous: v.boolean(),
    sourceDocId: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAuth(ctx);
    const now = Date.now();
    return ctx.db.insert("experiences", {
      ...args,
      userId: user._id,
      isVerified: false,
      isPremium: false,
      isFreePreview: false,
      status: "pending",
      upvotes: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const upvote = mutation({
  args: { experienceId: v.id("experiences"), userEmail: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", args.userEmail))
      .first();
    
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("votes")
      .withIndex("by_user_experience", (q: any) =>
        q.eq("userId", user._id).eq("experienceId", args.experienceId)
      )
      .first();

    if (existing) return;

    await ctx.db.insert("votes", {
      userId: user._id,
      experienceId: args.experienceId,
      createdAt: Date.now(),
    });

    const exp = await ctx.db.get(args.experienceId);
    if (exp) {
      await ctx.db.patch(args.experienceId, {
        upvotes: (exp.upvotes ?? 0) + 1,
      });
    }
  },
});

export const save = mutation({
  args: { experienceId: v.id("experiences"), userEmail: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", args.userEmail))
      .first();
      
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("savedExperiences")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect()
      .then((items) =>
        items.find((i) => i.experienceId === args.experienceId)
      );

    if (existing) {
      await ctx.db.delete(existing._id);
      return { saved: false };
    }

    await ctx.db.insert("savedExperiences", {
      userId: user._id,
      experienceId: args.experienceId,
      createdAt: Date.now(),
    });
    return { saved: true };
  },
});

export const isSaved = query({
  args: { experienceId: v.id("experiences"), userEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.userEmail) return false;
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", args.userEmail))
      .first();
    if (!user) return false;

    const saved = await ctx.db
      .query("savedExperiences")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect()
      .then((items) =>
        items.find((i) => i.experienceId === args.experienceId)
      );
    return !!saved;
  },
});

export const getSaved = query({
  args: { userEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.userEmail) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", args.userEmail))
      .first();
    if (!user) return [];

    const saved = await ctx.db
      .query("savedExperiences")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();

    const isPremiumUser = user.isPremium && (!user.premiumUntil || user.premiumUntil > Date.now());

    const experiences = await Promise.all(
      saved.map((s) => ctx.db.get(s.experienceId))
    );

    const validExperiences = experiences.filter(Boolean);

    if (isPremiumUser) {
      return validExperiences.map(e => ({ ...e, accessLevel: "full" as const }));
    }

    // Strip premium fields for expired/non-premium users
    return validExperiences.map(e => {
      if (e?.isFreePreview) {
        return { ...e, accessLevel: "full" as const };
      }
      return {
        _id: e!._id,
        _creationTime: e!._creationTime,
        companyName: e!.companyName,
        roleTitle: e!.roleTitle,
        opportunityType: e!.opportunityType,
        branch: e!.branch,
        year: e!.year,
        month: e!.month,
        difficulty: e!.difficulty,
        isAnonymous: e!.isAnonymous,
        isVerified: e!.isVerified,
        isPremium: e!.isPremium,
        isFreePreview: e!.isFreePreview,
        status: e!.status,
        upvotes: e!.upvotes,
        totalRounds: e!.totalRounds,
        overallRating: e!.overallRating,
        finalResult: e!.finalResult,
        tags: e!.tags,
        location: e!.location,
        workMode: e!.workMode,
        duration: e!.duration,
        compensation: e!.compensation,
        createdAt: e!.createdAt,
        updatedAt: e!.updatedAt,
        accessLevel: "limited" as const,
      };
    });
  },
});

export const report = mutation({
  args: {
    experienceId: v.id("experiences"),
    reason: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAuth(ctx);
    return ctx.db.insert("reports", {
      reporterUserId: user._id,
      experienceId: args.experienceId,
      reason: args.reason,
      notes: args.notes,
      status: "open",
      createdAt: Date.now(),
    });
  },
});

export const fixFreemium = mutation({
  args: {},
  handler: async (ctx) => {
    let results = await ctx.db.query("experiences").collect();
    results = results.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    for (let i = 0; i < results.length; i++) {
      const exp = results[i];
      const isFree = i < 5;
      await ctx.db.patch(exp._id, {
        isFreePreview: isFree,
        isPremium: !isFree,
      });
    }
    return `Fixed ${results.length} experiences. Top 5 are now free.`;
  }
});
