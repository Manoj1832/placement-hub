import fs from "fs";
import path from "path";

const dataFiles = [
  "./data-cleaned.json",
  "./data-cleaned2.json", 
  "./data-cleaned3.json"
];

const leetCodePatterns = [
  { pattern: /valid parenthesis/i, url: "https://leetcode.com/problems/valid-parentheses/" },
  { pattern: /merge.*interval/i, url: "https://leetcode.com/problems/merge-intervals/" },
  { pattern: /remove linked list/i, url: "https://leetcode.com/problems/remove-linked-list-elements/" },
  { pattern: /reverse nodes.*k.?group/i, url: "https://leetcode.com/problems/reverse-nodes-in-k-group/" },
  { pattern: /edit distance/i, url: "https://leetcode.com/problems/edit-distance/" },
  { pattern: /group anagram/i, url: "https://leetcode.com/problems/group-anagrams/" },
  { pattern: /longest substring.*without.*repeat/i, url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
  { pattern: /trapping rain water/i, url: "https://leetcode.com/problems/trapping-rain-water/" },
  { pattern: /best time.*buy.*sell.*stock/i, url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
  { pattern: /two sum/i, url: "https://leetcode.com/problems/two-sum/" },
  { pattern: /climbing stairs/i, url: "https://leetcode.com/problems/climbing-stairs/" },
  { pattern: /binary search/i, url: "https://leetcode.com/problems/binary-search/" },
  { pattern: /merge.*sorted.*list/i, url: "https://leetcode.com/problems/merge-k-sorted-lists/" },
  { pattern: /word search/i, url: "https://leetcode.com/problems/word-search/" },
  { pattern: /sudoku/i, url: "https://leetcode.com/problems/valid-sudoku/" },
  { pattern: /pascal.*triangle/i, url: "https://leetcode.com/problems/pascals-triangle/" },
  { pattern: /symmetric.*tree/i, url: "https://leetcode.com/problems/symmetric-tree/" },
  { pattern: /dice throw/i, url: "https://leetcode.com/problems/dice-throw/" },
  { pattern: /kadane/i, url: "https://leetcode.com/problems/maximum-subarray/" },
];

function findLeetCodeUrl(question: string): string | null {
  if (!question) return null;
  for (const { pattern, url } of leetCodePatterns) {
    if (pattern.test(question)) return url;
  }
  return null;
}

interface ExperienceData {
  company: string;
  role: string;
  type: string;
  duration?: string;
  work_mode: string;
  location?: string;
  compensation_inr?: number;
  application_date: string;
  result_date?: string;
  overall_rating: string;
  final_result: string;
  would_recommend: boolean;
  preparation_time_weeks: number;
  resources_used?: string[];
  total_rounds: number;
  rounds: Array<{
    round_number: number;
    type: string;
    duration_minutes: number;
    platform?: string;
    result: string;
    experience_rating: string;
    tips?: string;
    technical_questions?: Array<{
      question: string;
      difficulty?: string;
      topics?: string[];
      solution?: string;
      leetcode_url?: string;
    }>;
    behavioral_questions?: string[];
  }>;
  key_tips?: string[];
  mistakes_to_avoid?: string[];
  tags?: string[];
}

function processFile(filePath: string): ExperienceData[] {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    return data.map((exp: any) => processExperience(exp));
  } catch (e) {
    console.error(`Error processing ${filePath}:`, e);
    return [];
  }
}

function processExperience(raw: any): ExperienceData {
  const processed: ExperienceData = {
    company: raw.company,
    role: raw.role,
    type: raw.type || raw.department || "Full-time",
    duration: raw.duration,
    work_mode: raw.work_mode || "On-site",
    location: raw.location,
    compensation_inr: raw.compensation_inr,
    application_date: raw.application_date,
    result_date: raw.result_date,
    overall_rating: raw.overall_rating || "5/5",
    final_result: raw.final_result || "Selected",
    would_recommend: raw.would_recommend ?? true,
    preparation_time_weeks: raw.preparation_time_weeks || 0,
    resources_used: raw.resources_used,
    total_rounds: raw.total_rounds || raw.rounds?.length || 0,
    rounds: [],
    key_tips: raw.key_tips,
    mistakes_to_avoid: raw.mistakes_to_avoid,
    tags: raw.tags || []
  };

  if (raw.rounds) {
    processed.rounds = raw.rounds.map((round: any) => {
      const processedRound: any = {
        round_number: round.round_number,
        type: round.type,
        duration_minutes: round.duration_minutes,
        platform: round.platform,
        result: round.result,
        experience_rating: round.experience_rating || round.experience_rating,
        tips: round.tips,
        technical_questions: [],
        behavioral_questions: round.behavioral_questions || []
      };

      if (round.technical_questions || round.questions) {
        const questions = round.technical_questions || round.questions;
        processedRound.technical_questions = questions.map((q: any) => ({
          question: q.question,
          difficulty: q.difficulty,
          topics: q.topics || q.topics,
          solution: q.solution,
          leetcode_url: findLeetCodeUrl(q.question)
        }));
      }

      return processedRound;
    });
  }

  return processed;
}

async function seed() {
  let allData: ExperienceData[] = [];
  
  for (const file of dataFiles) {
    try {
      const data = processFile(file);
      allData = [...allData, ...data];
      console.log(`Loaded ${data.length} experiences from ${file}`);
    } catch (e) {
      console.error(`Failed to load ${file}:`, e);
    }
  }

  console.log(`\nTotal experiences to seed: ${allData.length}`);
  console.log("Sample experience:", JSON.stringify(allData[0], null, 2));
  
  const sampleJson = JSON.stringify(allData.slice(0, 3), null, 2);
  fs.writeFileSync("./scripts/sample-experiences.json", sampleJson);
  console.log("\nSaved 3 sample experiences to scripts/sample-experiences.json");
}

seed();