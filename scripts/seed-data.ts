/**
 * Seed script — run with: npx convex run seed:seedExperiences
 *
 * Or use this standalone script:
 *   npx tsx scripts/seed-data.ts
 *
 * Reads data.json, strips candidate_profile, and inserts into Convex.
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from "fs";
import * as path from "path";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "http://127.0.0.1:3210";

async function main() {
  const dataPath = path.resolve(__dirname, "../data.json");
  const rawData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  // Strip candidate_profile from every entry
  const cleaned = rawData.map((entry: any) => {
    const { candidate_profile, ...rest } = entry;
    return rest;
  });

  console.log(`📄 Loaded ${cleaned.length} experiences from data.json`);
  console.log(`🔗 Connecting to Convex at ${CONVEX_URL}`);

  // We'll use the Convex dashboard or `npx convex run` to invoke the internal mutation.
  // Print the cleaned data summary instead.
  console.log("\n📊 Companies found:");
  const companies = [...new Set(cleaned.map((e: any) => e.company))];
  companies.forEach((c) => {
    const count = cleaned.filter((e: any) => e.company === c).length;
    console.log(`   ${c}: ${count} experience(s)`);
  });

  // Write the cleaned (no student details) data to a temp file for manual import
  const cleanedPath = path.resolve(__dirname, "../data-cleaned.json");
  fs.writeFileSync(cleanedPath, JSON.stringify(cleaned, null, 2));
  console.log(`\n✅ Cleaned data written to data-cleaned.json`);
  console.log(`\n🚀 To seed, run:`);
  console.log(`   npx convex run seed:seedExperiences '{"experiences": ...}'`);
  console.log(`   Or use the Convex dashboard to run the internal mutation.`);
}

main().catch(console.error);
