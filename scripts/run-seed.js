const { ConvexClient } = require("convex/browser");
const fs = require("fs");
const path = require("path");

function getConvexUrl() {
  const envPath = path.join(__dirname, "../.env.local");
  if (!fs.existsSync(envPath)) {
    console.error("Could not find .env.local at", envPath);
    return null;
  }
  const content = fs.readFileSync(envPath, "utf8");
  const match = content.match(/NEXT_PUBLIC_CONVEX_URL\s*=\s*["']?([^"\s'\r\n]+)/);
  return match ? match[1] : null;
}

const convexUrl = getConvexUrl();
if (!convexUrl) {
  console.error("Error: NEXT_PUBLIC_CONVEX_URL not found in .env.local");
  process.exit(1);
}

const client = new ConvexClient(convexUrl);

async function run() {
  const dataPath = path.join(__dirname, "all-experiences.json");
  if (!fs.existsSync(dataPath)) {
    console.error("Could not find all-experiences.json at", dataPath);
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  console.log(`Seeding ${data.length} experiences to Convex at ${convexUrl}...`);
  
  const result = await client.mutation("seed:seedExperiencesPublic", { experiences: data });
  console.log("Seed success:", result);
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
