import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    password: v.optional(v.string()),
    branch: v.optional(v.string()),
    graduationYear: v.optional(v.number()),
    role: v.union(
      v.literal("student"),
      v.literal("contributor"),
      v.literal("admin")
    ),
    isPremium: v.boolean(),
    premiumUntil: v.optional(v.number()),
    badges: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  experiences: defineTable({
    userId: v.optional(v.id("users")),
    companyName: v.string(),
    roleTitle: v.string(),
    opportunityType: v.union(v.literal("internship"), v.literal("fulltime")),
    branch: v.string(),
    cgpaNote: v.optional(v.string()),
    year: v.number(),
    month: v.number(),

    // Flat round descriptions (backward compat)
    oaDetails: v.optional(v.string()),
    round1: v.optional(v.string()),
    round2: v.optional(v.string()),
    round3: v.optional(v.string()),
    hrRound: v.optional(v.string()),
    questionsAsked: v.array(v.string()),
    tips: v.string(),

    // Rich data from data.json
    compensation: v.optional(v.number()),
    location: v.optional(v.string()),
    workMode: v.optional(v.string()),
    duration: v.optional(v.string()),
    totalRounds: v.optional(v.number()),
    roundsJson: v.optional(v.string()),
    keyTips: v.optional(v.array(v.string())),
    mistakesToAvoid: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    preparationResources: v.optional(v.array(v.string())),
    preparationTimeWeeks: v.optional(v.number()),
    overallRating: v.optional(v.string()),
    finalResult: v.optional(v.string()),
    experienceNarrative: v.optional(v.string()),

    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    isAnonymous: v.boolean(),
    isVerified: v.boolean(),
    isPremium: v.boolean(),
    isFreePreview: v.optional(v.boolean()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    upvotes: v.number(),
    sourceDocId: v.optional(v.id("documents")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_company", ["companyName"])
    .index("by_user", ["userId"])
    .index("by_type", ["opportunityType"])
    .searchIndex("search_company_role", {
      searchField: "companyName",
      filterFields: ["status", "opportunityType", "branch", "difficulty"],
    }),

  documents: defineTable({
    userId: v.id("users"),
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
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["docType"]),

  resources: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("template"),
      v.literal("checklist"),
      v.literal("tracker"),
      v.literal("guide"),
      v.literal("company_pack")
    ),
    isPremium: v.boolean(),
    docId: v.id("documents"),
    tags: v.array(v.string()),
    downloadCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_premium", ["isPremium"]),

  savedExperiences: defineTable({
    userId: v.id("users"),
    experienceId: v.id("experiences"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  votes: defineTable({
    userId: v.id("users"),
    experienceId: v.id("experiences"),
    createdAt: v.number(),
  }).index("by_user_experience", ["userId", "experienceId"]),

  reports: defineTable({
    reporterUserId: v.id("users"),
    experienceId: v.id("experiences"),
    reason: v.string(),
    notes: v.optional(v.string()),
    status: v.union(v.literal("open"), v.literal("resolved")),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  orders: defineTable({
    userId: v.id("users"),
    productType: v.union(
      v.literal("premium_monthly"),
      v.literal("premium_yearly"),
      v.literal("starter_kit"),
      v.literal("company_pack")
    ),
    productId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.optional(v.string()),
    paymentStatus: v.union(
      v.literal("created"),
      v.literal("paid"),
      v.literal("failed")
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_razorpay_order", ["razorpayOrderId"]),

  serviceBookings: defineTable({
    userId: v.id("users"),
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
    bookingStatus: v.union(
      v.literal("pending"),
      v.literal("in_review"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    resultDocId: v.optional(v.id("documents")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["bookingStatus"]),
});
