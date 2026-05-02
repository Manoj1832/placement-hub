import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const seedExperiences = internalMutation({
  args: {
    experiences: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const allExperiences = args.experiences;

    // Track which companies already have a free preview
    const freePreviewCompanies = new Set<string>();

    for (const raw of allExperiences) {
      // Determine opportunity type
      const typeMap: Record<string, "internship" | "fulltime"> = {
        Summer: "internship",
        Winter: "internship",
        "Full-time": "fulltime",
        PPO: "fulltime",
      };
      const opportunityType: "internship" | "fulltime" =
        typeMap[raw.type] || "internship";

      // Parse application date for year/month
      let year = 2025;
      let month = 1;
      if (raw.application_date) {
        const parts = raw.application_date.split("/");
        if (parts.length === 3) {
          month = parseInt(parts[0], 10);
          year = parseInt(parts[2], 10);
        }
      }

      // Infer difficulty from round difficulties
      let difficulty: "easy" | "medium" | "hard" = "medium";
      if (raw.rounds) {
        const difficulties = raw.rounds.flatMap(
          (r: any) =>
            r.questions?.map((q: any) => q.difficulty?.toLowerCase()) || []
        );
        if (difficulties.includes("hard")) difficulty = "hard";
        else if (difficulties.includes("easy") && !difficulties.includes("medium"))
          difficulty = "easy";
      }

      // Infer branch from tags or default to CSE
      let branch = "CSE";
      if (raw.tags) {
        const tagStr = raw.tags.join(" ").toLowerCase();
        if (tagStr.includes("eee")) branch = "EEE";
        else if (tagStr.includes("ece") || tagStr.includes("extc")) branch = "ECE";
        else if (tagStr.includes("mech")) branch = "MECH";
        else if (tagStr.includes("it ") || tagStr.includes("#it")) branch = "IT";
      }

      // Build flat round descriptions from structured rounds
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
          // Collect questions
          if (round.questions) {
            for (const q of round.questions) {
              if (q.question) {
                allQuestions.push(q.question);
              }
            }
          }

          // Collect tips
          if (round.tips) {
            allTips.push(round.tips);
          }

          // Build round description
          const roundDesc = buildRoundDescription(round);

          const roundType = (round.type || "").toLowerCase();
          if (
            roundType.includes("online assessment") ||
            roundType.includes("coding round")
          ) {
            oaDetails = roundDesc;
          } else if (roundType === "hr") {
            hrRound = roundDesc;
          } else {
            // Technical, System Design, Group Discussion, Presentation
            techRoundIdx++;
            if (techRoundIdx === 1) round1 = roundDesc;
            else if (techRoundIdx === 2) round2 = roundDesc;
            else if (techRoundIdx === 3) round3 = roundDesc;
          }
        }
      }

      // Aggregate tips
      const tipsStr = [
        ...(raw.key_tips || []),
        ...allTips,
      ].join(" | ");

      // Determine if this is the free preview for this company
      const isFreePreview = !freePreviewCompanies.has(raw.company);
      if (isFreePreview) {
        freePreviewCompanies.add(raw.company);
      }

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
        questionsAsked: allQuestions.slice(0, 20), // Cap at 20
        tips: tipsStr || "No specific tips provided.",
        difficulty,
        isAnonymous: true,
        isVerified: true,
        isPremium: !isFreePreview,
        isFreePreview,
        status: "approved",
        upvotes: Math.floor(Math.random() * 50) + 5,

        // Rich fields
        compensation: raw.compensation_inr || undefined,
        location: raw.location || undefined,
        workMode: raw.work_mode || undefined,
        duration: raw.duration || undefined,
        totalRounds: raw.total_rounds || raw.rounds?.length || undefined,
        roundsJson: raw.rounds ? JSON.stringify(raw.rounds) : undefined,
        keyTips: raw.key_tips || undefined,
        mistakesToAvoid: raw.mistakes_to_avoid || undefined,
        tags: raw.tags || undefined,
        preparationResources: raw.resources_used?.length
          ? raw.resources_used
          : undefined,
        preparationTimeWeeks: raw.preparation_time_weeks || undefined,
        overallRating: raw.overall_rating || undefined,
        finalResult: raw.final_result || undefined,
        experienceNarrative: raw.experience_narrative || undefined,

        createdAt: now,
        updatedAt: now,
      });
    }

    return { inserted: allExperiences.length };
  },
});

function buildRoundDescription(round: any): string {
  const parts: string[] = [];

  parts.push(`**${round.type}** (${round.duration_minutes} mins)`);
  if (round.platform) parts.push(`Platform: ${round.platform}`);
  if (round.result) parts.push(`Result: ${round.result}`);
  if (round.experience_rating) parts.push(`Rating: ${round.experience_rating}`);

  if (round.questions?.length > 0) {
    parts.push("\nQuestions:");
    for (const q of round.questions) {
      let qLine = `• ${q.question}`;
      if (q.topics?.length) qLine += ` [${q.topics.join(", ")}]`;
      if (q.difficulty) qLine += ` (${q.difficulty})`;
      parts.push(qLine);
      if (q.solution) parts.push(`  → ${q.solution}`);
    }
  }

  if (round.tips) parts.push(`\nTips: ${round.tips}`);
  if (round.round_feedback)
    parts.push(`Feedback: ${round.round_feedback}`);

  return parts.join("\n");
}
