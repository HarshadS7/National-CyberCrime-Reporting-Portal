import { connectDB, scoringWeightsCol } from "./index.js";
import { DEFAULT_SCORING_WEIGHTS } from "../types/index.js";
import { nanoid } from "nanoid";

async function seed() {
  console.log("🌱 Seeding database...");
  await connectDB();

  const now = new Date().toISOString();
  const entries = Object.entries(DEFAULT_SCORING_WEIGHTS);
  const col = scoringWeightsCol();

  for (const [dimension, weight] of entries) {
    await col.updateOne(
      { dimension },
      {
        $setOnInsert: {
          _id: nanoid(),
          dimension,
          weight,
          updatedAt: now,
          updatedBy: "seed",
          previousWeight: weight,
        },
      },
      { upsert: true }
    );
  }

  console.log(`✅ Seeded ${entries.length} scoring weight dimensions`);
  console.log("🌱 Seed complete!");
  process.exit(0);
}

seed().catch(console.error);
