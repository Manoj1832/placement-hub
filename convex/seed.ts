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
        }
      }

      let difficulty: "easy" | "medium" | "hard" = "medium";
      if (raw.rounds) {
        const difficulties = raw.rounds.flatMap(
          (r: any) => r.technical_questions?.map((q: any) => q.difficulty?.toLowerCase()) || []
        );
        if (difficulties.includes("hard")) difficulty = "hard";
        else if (difficulties.includes("easy") && !difficulties.includes("medium")) difficulty = "easy";
      }

      let branch = "CSE";
      if (raw.tags) {
        const tagStr = raw.tags.join(" ").toLowerCase();
        if (tagStr.includes("eee")) branch = "EEE";
        else if (tagStr.includes("ece") || tagStr.includes("extc")) branch = "ECE";
        else if (tagStr.includes("mech")) branch = "MECH";
        else if (tagStr.includes("it ") || tagStr.includes("#it")) branch = "IT";
      }

      let oaDetails: string | undefined;
      let round1: string | undefined;
      let round2: string | undefined;
      let round3: string | undefined;
      let hrRound: string | undefined;
      const allQuestions: string[] = [];
      const allTips: string[] = [];

      if (raw.rounds) {
        let techRoundIdx = 0;
        for (const round of raw.rounds) {
          if (round.technical_questions) {
            for (const q of round.technical_questions) {
              if (q.question) allQuestions.push(q.question);
            }
          }
          if (round.tips) allTips.push(round.tips);

          const roundType = (round.type || "").toLowerCase();

          if (roundType.includes("online assessment") || roundType.includes("coding") || roundType.includes("oa")) {
            oaDetails = `${round.type} (${round.duration_minutes} mins) - ${round.result || "N/A"}`;
          } else if (roundType === "hr" || roundType.includes("manager")) {
            hrRound = `${round.type} (${round.duration_minutes} mins) - ${round.result || "N/A"}`;
          } else {
            techRoundIdx++;
            const roundDesc = `${round.type} (${round.duration_minutes} mins) - ${round.result || "N/A"}`;
            if (techRoundIdx === 1) round1 = roundDesc;
            else if (techRoundIdx === 2) round2 = roundDesc;
            else if (techRoundIdx === 3) round3 = roundDesc;
          }
        }
      }

      const tipsStr = [...(raw.key_tips || []), ...allTips].join(" | ");

      const isFreePreview = !freePreviewCompanies.has(raw.company);
      if (isFreePreview) freePreviewCompanies.add(raw.company);

      const now = Date.now();

      await ctx.db.insert("experiences", {
        companyName: raw.company,
        roleTitle: raw.role,
        opportunityType,
        branch,
        year,
        month,
        oaDetails,
        round1,
        round2,
        round3,
        hrRound,
        questionsAsked: allQuestions.slice(0, 20),
        tips: tipsStr || "No specific tips provided.",
        difficulty,
        isAnonymous: true,
        isVerified: true,
        isPremium: !isFreePreview,
        isFreePreview,
        status: "approved",
        upvotes: Math.floor(Math.random() * 50) + 5,
        compensation: raw.compensation_inr || undefined,
        location: raw.location || undefined,
        workMode: raw.work_mode || undefined,
        duration: raw.duration || undefined,
        totalRounds: raw.total_rounds || raw.rounds?.length || undefined,
        roundsJson: raw.rounds ? JSON.stringify(raw.rounds) : undefined,
        keyTips: raw.key_tips || undefined,
        mistakesToAvoid: raw.mistakes_to_avoid || undefined,
        tags: raw.tags || undefined,
        preparationResources: raw.resources_used?.length ? raw.resources_used : undefined,
        preparationTimeWeeks: raw.preparation_time_weeks || undefined,
        overallRating: raw.overall_rating || undefined,
        finalResult: raw.final_result || undefined,
        experienceNarrative: raw.experience_narrative || undefined,
        createdAt: now,
        updatedAt: now,
      });
      count++;
    }

    return { inserted: count };
  },
});