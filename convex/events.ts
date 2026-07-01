import { internalMutation, internalAction, mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Publishes an event to the Event Store / Outbox queue.
 * Decouples write operations from long-running side effects.
 */
export const publish = internalMutation({
  args: {
    eventType: v.string(),
    payload: v.string(),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", {
      eventType: args.eventType,
      payload: args.payload,
      status: "pending",
      createdAt: Date.now(),
    });

    // Schedule background microservices processing immediately
    await ctx.scheduler.runAfter(0, internal.events.dispatchAction, { eventId });
    return eventId;
  },
});

/**
 * Dispatcher action: Acts as the microservice message broker dispatcher.
 * Orchestrates event handling by invoking individual domain processors (microservices).
 */
export const dispatchAction = internalAction({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    // 1. Fetch the event
    const event = await ctx.runQuery(internal.events.getEventById, { eventId: args.eventId });
    if (!event || event.status !== "pending") return;

    try {
      const payload = JSON.parse(event.payload);

      // 2. Dispatch to specific microservices based on event type
      switch (event.eventType) {
        case "user.activity_tracked":
          // Dispatch to: Level Service, Streak Service, Achievement Service
          await ctx.runMutation(internal.events.levelServiceProcessor, { payload });
          await ctx.runMutation(internal.events.streakServiceProcessor, { payload });
          await ctx.runMutation(internal.events.achievementServiceProcessor, { payload });
          break;

        case "experience.created":
          // Dispatch to: Moderation Service, Verification Service
          await ctx.runMutation(internal.events.moderationServiceProcessor, { payload });
          break;

        case "order.completed":
          // Dispatch to: Billing Service, Notification Service
          await ctx.runMutation(internal.events.billingServiceProcessor, { payload });
          break;

        default:
          console.warn(`No microservice registered for event type: ${event.eventType}`);
          break;
      }

      // Mark event as processed successfully
      await ctx.runMutation(internal.events.updateEventStatus, {
        eventId: args.eventId,
        status: "processed",
      });
    } catch (err: any) {
      console.error(`Failed to process event ${args.eventId}:`, err);
      // Mark event as failed
      await ctx.runMutation(internal.events.updateEventStatus, {
        eventId: args.eventId,
        status: "failed",
        error: err.message || String(err),
      });
    }
  },
});

/* ─── Internal Queries & Mutations for Event Store ─── */

export const getEventById = internalQuery({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.eventId);
  },
});

export const updateEventStatus = internalMutation({
  args: {
    eventId: v.id("events"),
    status: v.union(v.literal("processed"), v.literal("failed")),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      status: args.status,
      error: args.error,
      processedAt: Date.now(),
    });
  },
});

/* ─── MICROSERVICES / DOMAIN SERVICE PROCESSORS ─── */

/**
 * Level Service: Processes XP gains and levels asynchronously.
 */
export const levelServiceProcessor = internalMutation({
  args: { payload: v.any() },
  handler: async (ctx, args) => {
    const { userId, points } = args.payload;
    if (!userId || !points) return;

    const existingLevel = await ctx.db
      .query("studentLevels")
      .withIndex("by_user", (q: any) => q.eq("userId", userId as Id<"users">))
      .first();

    const XP_PER_LEVEL = 500;
    const getLevelFromXp = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;

    if (existingLevel) {
      const newXp = existingLevel.xp + points;
      await ctx.db.patch(existingLevel._id, {
        xp: newXp,
        totalXpEarned: existingLevel.totalXpEarned + points,
        level: getLevelFromXp(newXp),
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("studentLevels", {
        userId: userId as Id<"users">,
        xp: points,
        level: 1,
        totalXpEarned: points,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Streak Service: Computes learning streak milestone progress asynchronously.
 */
export const streakServiceProcessor = internalMutation({
  args: { payload: v.any() },
  handler: async (ctx, args) => {
    const { userId } = args.payload;
    if (!userId) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    const existingStreak = await ctx.db
      .query("studentStreaks")
      .withIndex("by_user", (q: any) => q.eq("userId", userId as Id<"users">))
      .first();

    if (existingStreak) {
      const lastDate = new Date(existingStreak.lastActivityDate);
      lastDate.setHours(0, 0, 0, 0);
      const lastDateStart = lastDate.getTime();

      const dayDiff = Math.floor((todayStart - lastDateStart) / (1000 * 60 * 60 * 24));

      let newStreak = existingStreak.currentStreak;
      let longestStreak = existingStreak.longestStreak;
      let totalActiveDays = existingStreak.totalActiveDays;

      if (dayDiff === 0) {
        // Same day, nothing to update
      } else if (dayDiff === 1) {
        newStreak += 1;
        if (newStreak > longestStreak) longestStreak = newStreak;
      } else {
        newStreak = 1;
        totalActiveDays += existingStreak.currentStreak;
      }

      await ctx.db.patch(existingStreak._id, {
        currentStreak: newStreak,
        longestStreak,
        lastActivityDate: Date.now(),
        totalActiveDays,
        updatedAt: Date.now(),
      });

      // Award streak milestone rewards
      if ([7, 30, 100, 365].includes(newStreak)) {
        await ctx.db.insert("studentActivity", {
          userId: userId as Id<"users">,
          activityType: "streak_milestone",
          description: `Achieved ${newStreak}-day streak!`,
          points: 15,
          createdAt: Date.now(),
        });
      }
    } else {
      await ctx.db.insert("studentStreaks", {
        userId: userId as Id<"users">,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: Date.now(),
        totalActiveDays: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Achievement Service: Evaluates badge awards asynchronously.
 */
export const achievementServiceProcessor = internalMutation({
  args: { payload: v.any() },
  handler: async (ctx, args) => {
    const { userId, activityType } = args.payload;
    if (!userId || !activityType) return;

    // Check total activities completed to reward milestone badges
    const totalActivities = await ctx.db
      .query("studentActivity")
      .withIndex("by_user", (q: any) => q.eq("userId", userId as Id<"users">))
      .collect();

    let badgeToAward: { id: string; name: string; desc: string } | null = null;

    if (totalActivities.length >= 100) {
      badgeToAward = { id: "master_contributor", name: "Master Contributor", desc: "Completed over 100 student activities" };
    } else if (totalActivities.length >= 50) {
      badgeToAward = { id: "expert_contributor", name: "Expert Contributor", desc: "Completed over 50 student activities" };
    } else if (totalActivities.length >= 10) {
      badgeToAward = { id: "active_student", name: "Active Student", desc: "Completed over 10 student activities" };
    }

    if (badgeToAward) {
      // Check if already earned
      const existing = await ctx.db
        .query("studentAchievements")
        .withIndex("by_user", (q: any) => q.eq("userId", userId as Id<"users">))
        .collect();
      
      const alreadyHas = existing.some(badge => badge.badgeId === badgeToAward!.id);
      if (!alreadyHas) {
        await ctx.db.insert("studentAchievements", {
          userId: userId as Id<"users">,
          badgeId: badgeToAward.id,
          name: badgeToAward.name,
          description: badgeToAward.desc,
          earnedAt: Date.now(),
        });
      }
    }
  },
});

/**
 * Moderation / Auto-Verification Service: Asynchronously checks submitted content.
 */
export const moderationServiceProcessor = internalMutation({
  args: { payload: v.any() },
  handler: async (ctx, args) => {
    const { experienceId } = args.payload;
    if (!experienceId) return;

    const experience = await ctx.db.get(experienceId as Id<"experiences">);
    if (!experience) return;

    // Auto-approve experiences with high completeness (mocking ML service auto-moderation)
    const hasDetailedRounds = experience.roundsJson && JSON.parse(experience.roundsJson).length > 0;
    const hasLocation = !!experience.location;

    if (hasDetailedRounds && hasLocation) {
      await ctx.db.patch(experienceId as Id<"experiences">, {
        status: "approved",
        isVerified: true,
      });
    }
  },
});

/**
 * Billing Service: Unlocks features asynchronously upon payments.
 */
export const billingServiceProcessor = internalMutation({
  args: { payload: v.any() },
  handler: async (ctx, args) => {
    const { orderId } = args.payload;
    if (!orderId) return;

    const order = await ctx.db.get(orderId as Id<"orders">);
    if (!order || order.paymentStatus !== "paid") return;

    const user = await ctx.db.get(order.userId as Id<"users">);
    if (!user) return;

    const now = Date.now();
    const currentUntil = user.premiumUntil || 0;
    const startFrom = currentUntil > now ? currentUntil : now;
    const duration = order.productType === "premium_3months"
      ? 90 * 24 * 60 * 60 * 1000 
      : 365 * 24 * 60 * 60 * 1000;

    await ctx.db.patch(order.userId as Id<"users">, {
      isPremium: true,
      premiumUntil: startFrom + duration,
    });
  },
});
