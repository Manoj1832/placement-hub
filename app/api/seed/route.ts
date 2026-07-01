import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import fs from "fs";
import path from "path";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    // Read the JSON file
    const filePath = path.join(process.cwd(), "scripts", "all-experiences.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const allExperiences = JSON.parse(raw);

    let inserted = 0;
    const errors: string[] = [];

    for (const exp of allExperiences) {
      try {
        const typeMap: Record<string, "internship" | "fulltime"> = {
          Summer: "internship",
          Winter: "internship",
          "Full-time": "fulltime",
          PPO: "fulltime",
        };
        const opportunityType = typeMap[exp.type] || "internship";

        let year = 2025;
        let month = 1;
        if (exp.application_date) {
          const parts = exp.application_date.split("/");
          if (parts.length === 3) {
            month = parseInt(parts[0], 10);
            year = parseInt(parts[2], 10);
            if (year < 100) year += 2000;
          }
        }

        const diffMap: Record<string, "easy" | "medium" | "hard"> = {
          easy: "easy",
          medium: "medium",
          hard: "hard",
        };

        // Determine difficulty from rounds or default
        let difficulty: "easy" | "medium" | "hard" = "medium";
        if (exp.rounds && exp.rounds.length > 0) {
          const diffs = exp.rounds
            .flatMap((r: any) => (r.questions || []).map((q: any) => q.difficulty?.toLowerCase()))
            .filter(Boolean);
          if (diffs.includes("hard")) difficulty = "hard";
          else if (diffs.includes("medium")) difficulty = "medium";
          else if (diffs.includes("easy")) difficulty = "easy";
        }

        const companyName = exp.company || exp.company_name || "Unknown";
        
        // First 5 are free preview, rest are premium
        const isFreePreview = inserted < 5;
        const isPremium = !isFreePreview;

        const record = {
          companyName,
          roleTitle: exp.role || exp.job_title || "Unknown Role",
          opportunityType,
          branch: exp.branch || "CSE",
          year,
          month,
          difficulty,
          location: exp.location || "",
          workMode: exp.work_mode || "Hybrid",
          compensation: exp.compensation_inr || exp.compensation_INR || 0,
          duration: exp.duration || "",
          isPremium,
          isFreePreview,
          upvotes: exp.upvotes || Math.floor(Math.random() * 50) + 5,
          status: "approved" as const,
          roundsJson: JSON.stringify(exp.rounds || []),
          keyTips: exp.key_tips || [],
          mistakesToAvoid: exp.mistakes_to_avoid || [],
          tags: exp.tags || [],
          preparationResources: exp.resources_used || [],
          preparationTimeWeeks: exp.preparation_time_weeks || 0,
          totalRounds: exp.total_rounds || (exp.rounds?.length || 0),
          overallRating: exp.overall_rating || "5/5",
          finalResult: exp.final_result || "Selected",
          experienceNarrative: exp.experience_narrative || "",
          questionsAsked: [] as string[],
          tips: exp.key_tips?.join(". ") || "",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isAnonymous: false,
          isVerified: true,
        };

        await convex.mutation(api.experiences.seedOne, record);
        inserted++;
      } catch (e: any) {
        errors.push(`${exp.company}: ${e.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      inserted,
      total: allExperiences.length,
      errors: errors.slice(0, 10),
    });
  } catch (err: any) {
    console.error("Seed failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
