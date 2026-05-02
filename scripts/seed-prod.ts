import { ConvexHttpClient } from "convex/browser";
import * as fs from "fs";
import * as path from "path";

const CONVEX_URL = "https://standing-heron-418.convex.cloud";

async function main() {
  const client = new ConvexHttpClient(CONVEX_URL);
  const dataPath = path.resolve(__dirname, "../data-cleaned2.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  console.log(`Starting seed to production (${CONVEX_URL})...`);
  console.log(`Found ${data.length} experiences to seed.`);

  // Since we changed seedExperiences to a public mutation temporarily,
  // we can call it using the any() syntax since we don't have the fully generated 
  // types for the external client without the api object from _generated.
  // We'll just pass the string path.
  try {
    const result = await client.mutation("seed:seedExperiences" as any, {
      experiences: data
    });
    console.log("Successfully seeded to production!");
    console.log("Result:", result);
  } catch (error) {
    console.error("Error seeding to production:", error);
  }
}

main().catch(console.error);
