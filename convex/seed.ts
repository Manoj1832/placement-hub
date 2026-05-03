import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const seedExperiences = internalMutation({
  args: {
    experiences: v.any()
  },
  handler: async (ctx, args) => {
    const allExperiences = args.experiences;

    console.log(`Processing ${allExperiences.length} experiences`);

    const freePreviewCompanies = new Set<string>();
    let count = 0;

    for (const raw of allExperiences) {
      const typeMap: Record<string, "internship" | "fulltime"> = {
        Summer: "internship",
        Winter: "internship",
        "Full-time": "fulltime",
        PPO: "fulltime",
      };
      const opportunityType = typeMap[raw.type] || "internship";

      let year = 2025;
      let month = 1;
      if (raw.application_date) {
        const parts = raw.application_date.split("/");
        if (parts.length === 3) {
          month = parseInt(parts[0], 10);
          year = parseInt(parts[2], 10);
          if (year < 100) year += 2000;
        }
      }

      const companyName = raw.company_name || raw.companyName || "";
      const isPremium = raw.is_premium === true || raw.isPremium === true;
      const isFreePreview = !isPremium;

      const processed = {
        companyName,
        roleTitle: raw.job_title || raw.roleTitle || "",
        opportunityType,
        branch: raw.branch || "CSE",
        year,
        month,
        difficulty: (raw.difficulty?.toLowerCase() || "medium") as "easy" | "medium" | "hard",
        location: raw.location || "",
        workMode: raw.work_mode || raw.workMode || "Hybrid",
        compensation: raw.ctc || raw.compensation || 0,
        isPremium,
        isFreePreview,
        upvotes: raw.upvotes || 0,
        status: "approved" as const,
        rounds: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isAnonymous: false,
        isVerified: false,
        questionsAsked: [],
        tips: "",
        totalRounds: 0,
        overallRating: "5",
        finalResult: "offer",
      };

      await ctx.db.insert("experiences", processed);
      count++;
    }

    return { inserted: count };
  },
});

export const seedBasic = internalMutation({
  args: {},
  handler: async (ctx) => {
    const baseExp = {
      month: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isAnonymous: false,
      isVerified: false,
      questionsAsked: [],
      tips: "",
      totalRounds: 0,
      overallRating: "5",
      finalResult: "offer" as const,
    };

    const experiences = [
      { ...baseExp, companyName: "Google", roleTitle: "L3 SWE", opportunityType: "fulltime" as const, branch: "CSE", year: 2024, difficulty: "hard" as const, location: "Bangalore", workMode: "Hybrid", isPremium: true, isFreePreview: false, upvotes: 52, status: "approved" as const },
      { ...baseExp, companyName: "Amazon", roleTitle: "SDE", opportunityType: "fulltime" as const, branch: "CSE", year: 2024, difficulty: "hard" as const, location: "Bangalore", workMode: "Hybrid", isPremium: false, isFreePreview: true, upvotes: 45, status: "approved" as const },
      { ...baseExp, companyName: "Microsoft", roleTitle: "SDE", opportunityType: "fulltime" as const, branch: "IT", year: 2024, difficulty: "medium" as const, location: "Hyderabad", workMode: "Hybrid", isPremium: false, isFreePreview: true, upvotes: 38, status: "approved" as const },
      { ...baseExp, companyName: "Goldman Sachs", roleTitle: "Analyst", opportunityType: "fulltime" as const, branch: "ECE", year: 2024, difficulty: "hard" as const, location: "Bangalore", workMode: "Office", isPremium: true, isFreePreview: false, upvotes: 31, status: "approved" as const },
      { ...baseExp, companyName: "IBM", roleTitle: "Backend Developer", opportunityType: "fulltime" as const, branch: "CSE", year: 2024, difficulty: "easy" as const, location: "Chennai", workMode: "Hybrid", isPremium: false, isFreePreview: true, upvotes: 27, status: "approved" as const },
    ];
    
    for (const exp of experiences) {
      await ctx.db.insert("experiences", exp);
    }
    return { inserted: experiences.length };
  },
});