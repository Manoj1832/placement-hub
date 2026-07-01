import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

async function requireAuth(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated. Please log in.");
  }

  let user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .first();

  if (!user && identity.email) {
    user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", identity.email))
      .first();
  }

  if (!user) {
    throw new Error("User profile not found in database.");
  }

  return { identity, user };
}

async function getOptionalUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  let user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .first();

  if (!user && identity.email) {
    user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", identity.email))
      .first();
  }

  return user;
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

    // Sort by company name A-Z
    results = results.sort((a, b) => (a.companyName || "").localeCompare(b.companyName || ""));

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

    return filtered;
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
    let results = await ctx.db
      .query("experiences")
      .withIndex("by_status", (q: any) => q.eq("status", "approved"))
      .collect();

    results = results.sort((a, b) => (a.companyName || "").localeCompare(b.companyName || ""));

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
      totalCount: filtered.length,
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
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const experience = await ctx.db.get(args.id);
    if (!experience) return null;

    // Free preview — always return full data
    if (experience.isFreePreview) {
      return { ...experience, accessLevel: "full" as const };
    }

    // Check if user has premium — try Convex auth first
    let isPremiumUser = false;
    const user = await getOptionalUser(ctx);

    if (user && user.isPremium && (!user.premiumUntil || user.premiumUntil > Date.now())) {
      isPremiumUser = true;
    }

    // Fallback: if Convex auth failed but email was provided, check by email
    if (!isPremiumUser && !user && args.userEmail) {
      const emailUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q: any) => q.eq("email", args.userEmail!.toLowerCase().trim()))
        .first();
      if (emailUser && emailUser.isPremium && (!emailUser.premiumUntil || emailUser.premiumUntil > Date.now())) {
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

/**
 * Main browse query for the /browse page.
 * Accepts all filter args sent by BrowseContent component.
 */
export const browse = query({
  args: {
    search: v.optional(v.string()),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    opportunityType: v.optional(v.string()),
    branch: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    isVerified: v.optional(v.boolean()),
    isPremium: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("experiences")
      .withIndex("by_status", (q: any) => q.eq("status", "approved"))
      .collect();

    const filtered = results.filter((e) => {
      if (args.company && !e.companyName?.toLowerCase().includes(args.company.toLowerCase())) return false;
      if (args.role && !e.roleTitle?.toLowerCase().includes(args.role.toLowerCase())) return false;
      if (args.opportunityType && e.opportunityType !== args.opportunityType) return false;
      if (args.branch && e.branch !== args.branch) return false;
      if (args.difficulty && e.difficulty !== args.difficulty) return false;
      if (args.isVerified && !e.isVerified) return false;
      if (args.isPremium !== undefined && e.isPremium !== args.isPremium) return false;
      if (args.search) {
        const s = args.search.toLowerCase();
        const haystack = [
          e.companyName ?? "",
          e.roleTitle ?? "",
          (e.tags ?? []).join(" "),
          e.location ?? "",
        ].join(" ").toLowerCase();
        if (!haystack.includes(s)) return false;
      }
      return true;
    });

    return filtered
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((e) => ({
        _id: e._id,
        _creationTime: e._creationTime,
        companyName: e.companyName,
        roleTitle: e.roleTitle,
        opportunityType: e.opportunityType,
        branch: e.branch,
        year: e.year,
        month: e.month,
        difficulty: e.difficulty,
        isVerified: e.isVerified,
        isPremium: e.isPremium,
        isFreePreview: e.isFreePreview,
        upvotes: e.upvotes,
        location: e.location,
        compensation: e.compensation,
        workMode: e.workMode,
        totalRounds: e.totalRounds,
        tags: e.tags,
        finalResult: e.finalResult,
      }));
  },
});

/**
 * Stats for the browse page header (total count, company count).
 */
export const getBrowseStats = query({
  args: {
    search: v.optional(v.string()),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    opportunityType: v.optional(v.string()),
    branch: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    isVerified: v.optional(v.boolean()),
    isPremium: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("experiences")
      .withIndex("by_status", (q: any) => q.eq("status", "approved"))
      .collect();

    const filtered = results.filter((e) => {
      if (args.company && !e.companyName?.toLowerCase().includes(args.company.toLowerCase())) return false;
      if (args.role && !e.roleTitle?.toLowerCase().includes(args.role.toLowerCase())) return false;
      if (args.opportunityType && e.opportunityType !== args.opportunityType) return false;
      if (args.branch && e.branch !== args.branch) return false;
      if (args.difficulty && e.difficulty !== args.difficulty) return false;
      if (args.isVerified && !e.isVerified) return false;
      if (args.isPremium !== undefined && e.isPremium !== args.isPremium) return false;
      if (args.search) {
        const s = args.search.toLowerCase();
        const haystack = [
          e.companyName ?? "",
          e.roleTitle ?? "",
          (e.tags ?? []).join(" "),
          e.location ?? "",
        ].join(" ").toLowerCase();
        if (!haystack.includes(s)) return false;
      }
      return true;
    });

    const companies = new Set(filtered.map((e) => e.companyName));
    return {
      totalResults: filtered.length,
      totalCompanies: companies.size,
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
    compensation: v.optional(v.number()),
    location: v.optional(v.string()),
    workMode: v.optional(v.string()),
    duration: v.optional(v.string()),
    totalRounds: v.optional(v.number()),
    roundsJson: v.optional(v.string()),
    keyTips: v.optional(v.array(v.string())),
    mistakesToAvoid: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    finalResult: v.optional(v.string()),
    experienceNarrative: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAuth(ctx);
    const now = Date.now();
    const experienceId = await ctx.db.insert("experiences", {
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

    // Event-driven publish (Outbox Pattern)
    const eventId = await ctx.db.insert("events", {
      eventType: "experience.created",
      payload: JSON.stringify({
        experienceId: experienceId,
        userId: user._id,
      }),
      status: "pending",
      createdAt: Date.now(),
    });

    // Dispatch immediately in background
    await ctx.scheduler.runAfter(0, internal.events.dispatchAction, { eventId });

    return experienceId;
  },
});

export const upvote = mutation({
  args: { experienceId: v.id("experiences") },
  handler: async (ctx, args) => {
    const { user } = await requireAuth(ctx);

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
  args: {
    experienceId: v.id("experiences"),
    userEmail: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", args.userEmail.toLowerCase().trim()))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

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
  args: {
    experienceId: v.id("experiences"),
    userEmail: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", args.userEmail.toLowerCase().trim()))
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
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    if (!args.userEmail) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", args.userEmail.toLowerCase().trim()))
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

export const seedOne = mutation({
  args: {
    companyName: v.string(),
    roleTitle: v.string(),
    opportunityType: v.union(v.literal("internship"), v.literal("fulltime")),
    branch: v.string(),
    year: v.number(),
    month: v.number(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    location: v.optional(v.string()),
    workMode: v.optional(v.string()),
    compensation: v.optional(v.number()),
    duration: v.optional(v.string()),
    isPremium: v.boolean(),
    isFreePreview: v.boolean(),
    upvotes: v.number(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    roundsJson: v.optional(v.string()),
    keyTips: v.optional(v.array(v.string())),
    mistakesToAvoid: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    preparationResources: v.optional(v.array(v.string())),
    preparationTimeWeeks: v.optional(v.number()),
    totalRounds: v.optional(v.number()),
    overallRating: v.optional(v.string()),
    finalResult: v.optional(v.string()),
    experienceNarrative: v.optional(v.string()),
    questionsAsked: v.array(v.string()),
    tips: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    isAnonymous: v.boolean(),
    isVerified: v.boolean(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("experiences", args);
  },
});

