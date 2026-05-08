import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function getUser(ctx: any) {
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

const ACTIVITY_POINTS = {
  roadmap_node_completed: 10,
  experience_viewed: 2,
  experience_upvoted: 5,
  experience_saved: 3,
  experience_submitted: 50,
  resource_downloaded: 5,
  mock_completed: 20,
  goal_set: 5,
  goal_completed: 25,
  streak_milestone: 15,
  badge_earned: 30,
  lesson_completed: 15,
  quiz_completed: 10,
};

const XP_PER_LEVEL = 500;

function getLevelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function getXpForNextLevel(currentXp: number): number {
  const currentLevel = getLevelFromXp(currentXp);
  return currentLevel * XP_PER_LEVEL;
}

// Track any activity
export const trackActivity = mutation({
  args: {
    activityType: v.union(
      v.literal("roadmap_node_completed"),
      v.literal("experience_viewed"),
      v.literal("experience_upvoted"),
      v.literal("experience_saved"),
      v.literal("experience_submitted"),
      v.literal("resource_downloaded"),
      v.literal("mock_completed"),
      v.literal("goal_set"),
      v.literal("goal_completed"),
      v.literal("streak_milestone"),
      v.literal("badge_earned"),
      v.literal("lesson_completed"),
      v.literal("quiz_completed")
    ),
    description: v.string(),
    relatedId: v.optional(v.string()),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Not authenticated");
    
    const points = ACTIVITY_POINTS[args.activityType];
    
    // Create activity record
    await ctx.db.insert("studentActivity", {
      userId: user._id,
      activityType: args.activityType,
      description: args.description,
      points,
      relatedId: args.relatedId,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
    
    // Update student levels (XP)
    const existingLevel = await ctx.db
      .query("studentLevels")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .first();
    
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
        userId: user._id,
        xp: points,
        level: 1,
        totalXpEarned: points,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    // Update streaks
    await updateStreak(ctx, user._id);
    
    return { success: true, pointsEarned: points };
  },
});

async function updateStreak(ctx: any, userId: any) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();
  
  const existingStreak = await ctx.db
    .query("studentStreaks")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
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
      // Same day, no change
    } else if (dayDiff === 1) {
      // Consecutive day
      newStreak += 1;
      if (newStreak > longestStreak) longestStreak = newStreak;
    } else {
      // Streak broken
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
    
    // Check for milestone
    if (newStreak === 7 || newStreak === 30 || newStreak === 100 || newStreak === 365) {
      await ctx.db.insert("studentActivity", {
        userId,
        activityType: "streak_milestone",
        description: `Achieved ${newStreak}-day streak!`,
        points: ACTIVITY_POINTS.streak_milestone,
        createdAt: Date.now(),
      });
    }
  } else {
    await ctx.db.insert("studentStreaks", {
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: Date.now(),
      totalActiveDays: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
}

// Get user progress stats
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return null;
    
    const levels = await ctx.db
      .query("studentLevels")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .first();
    
    const streaks = await ctx.db
      .query("studentStreaks")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .first();
    
    const activities = await ctx.db
      .query("studentActivity")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .order("desc")
      .take(20);
    
    const goals = await ctx.db
      .query("studentGoals")
      .withIndex("by_user_status", (q: any) => q.eq("userId", user._id).eq("status", "active"))
      .take(10);
    
    const achievements = await ctx.db
      .query("studentAchievements")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .take(20);
    
    const xpForNextLevel = levels ? getXpForNextLevel(levels.xp) : XP_PER_LEVEL;
    const currentLevelXp = levels ? levels.xp % XP_PER_LEVEL : 0;
    const progressPercent = levels ? Math.round((currentLevelXp / XP_PER_LEVEL) * 100) : 0;
    
    return {
      xp: levels?.xp || 0,
      level: levels?.level || 1,
      totalXpEarned: levels?.totalXpEarned || 0,
      xpForNextLevel,
      currentLevelXp,
      progressPercent,
      currentStreak: streaks?.currentStreak || 0,
      longestStreak: streaks?.longestStreak || 0,
      totalActiveDays: streaks?.totalActiveDays || 0,
      activities: activities.map(a => ({
        id: a._id,
        type: a.activityType,
        description: a.description,
        points: a.points,
        createdAt: a.createdAt,
      })),
      activeGoals: goals.map(g => ({
        id: g._id,
        title: g.title,
        targetValue: g.targetValue,
        currentValue: g.currentValue,
        unit: g.unit,
        deadline: g.deadline,
        progress: g.targetValue > 0 ? Math.round((g.currentValue / g.targetValue) * 100) : 0,
      })),
      achievements: achievements.map(a => ({
        id: a._id,
        badgeId: a.badgeId,
        name: a.name,
        description: a.description,
        earnedAt: a.earnedAt,
      })),
    };
  },
});

// Set a new goal
export const setGoal = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    goalType: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("custom")),
    targetValue: v.number(),
    unit: v.optional(v.string()),
    deadline: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Not authenticated");
    
    const goalId = await ctx.db.insert("studentGoals", {
      userId: user._id,
      title: args.title,
      description: args.description,
      goalType: args.goalType,
      targetValue: args.targetValue,
      currentValue: 0,
      unit: args.unit,
      deadline: args.deadline,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Track activity
    await ctx.db.insert("studentActivity", {
      userId: user._id,
      activityType: "goal_set",
      description: `Set goal: ${args.title}`,
      points: ACTIVITY_POINTS.goal_set,
      relatedId: goalId,
      createdAt: Date.now(),
    });
    
    return { success: true, goalId };
  },
});

// Update goal progress
export const updateGoalProgress = mutation({
  args: {
    goalId: v.id("studentGoals"),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Not authenticated");
    
    const goal = await ctx.db.get(args.goalId);
    if (!goal || goal.userId !== user._id) throw new Error("Goal not found");
    
    const newValue = Math.min(args.progress, goal.targetValue);
    const wasCompleted = goal.status === "completed";
    const isNowCompleted = newValue >= goal.targetValue;
    
    await ctx.db.patch(goal._id, {
      currentValue: newValue,
      status: isNowCompleted ? "completed" : "active",
      updatedAt: Date.now(),
    });
    
    // Award points for completion
    if (!wasCompleted && isNowCompleted) {
      await ctx.db.insert("studentActivity", {
        userId: user._id,
        activityType: "goal_completed",
        description: `Completed goal: ${goal.title}`,
        points: ACTIVITY_POINTS.goal_completed,
        relatedId: goal._id,
        createdAt: Date.now(),
      });
    }
    
    return { success: true, completed: isNowCompleted };
  },
});

// Get leaderboard
export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const topUsers = await ctx.db
      .query("studentLevels")
      .order("desc")
      .take(limit);
    
    const leaderboard = await Promise.all(
      topUsers.map(async (level) => {
        const user = await ctx.db.get(level.userId);
        const streak = await ctx.db
          .query("studentStreaks")
          .withIndex("by_user", (q: any) => q.eq("userId", level.userId))
          .first();
        
        return {
          rank: 0, // Will be set by index
          userId: level.userId,
          name: user?.name || "Anonymous",
          xp: level.xp,
          level: level.level,
          streak: streak?.currentStreak || 0,
        };
      })
    );
    
    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  },
});

// Award badge
export const awardBadge = mutation({
  args: {
    badgeId: v.string(),
    name: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Not authenticated");
    
    // Check if already earned
    const existing = await ctx.db
      .query("studentAchievements")
      .withIndex("by_user", (q: any) => 
        q.eq("userId", user._id).eq("badgeId", args.badgeId)
      )
      .first();
    
    if (existing) {
      return { success: false, message: "Badge already earned" };
    }
    
    await ctx.db.insert("studentAchievements", {
      userId: user._id,
      badgeId: args.badgeId,
      name: args.name,
      description: args.description,
      icon: args.icon,
      earnedAt: Date.now(),
    });
    
    // Track activity
    await ctx.db.insert("studentActivity", {
      userId: user._id,
      activityType: "badge_earned",
      description: `Earned badge: ${args.name}`,
      points: ACTIVITY_POINTS.badge_earned,
      createdAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Get daily progress summary
export const getDailyProgress = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    
    const todayActivities = await ctx.db
      .query("dailyProgress")
      .withIndex("by_user_date", (q: any) => 
        q.eq("userId", user._id).eq("date", todayStart)
      )
      .first();
    
    const recentActivities = await ctx.db
      .query("studentActivity")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .order("desc")
      .take(10);
    
    return {
      date: todayStart,
      xpEarned: todayActivities?.xpEarned || 0,
      pointsEarned: todayActivities?.pointsEarned || 0,
      activitiesCompleted: todayActivities?.activitiesCompleted || 0,
      recentActivities: recentActivities.map(a => ({
        type: a.activityType,
        description: a.description,
        points: a.points,
        createdAt: a.createdAt,
      })),
    };
  },
});