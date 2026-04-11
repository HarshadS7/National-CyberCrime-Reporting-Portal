import { db } from "./index.js";
import { scoringWeights } from "./schema.js";
import { DEFAULT_SCORING_WEIGHTS } from "../types/index.js";
import { nanoid } from "nanoid";

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed default scoring weights
  const now = new Date().toISOString();
  const entries = Object.entries(DEFAULT_SCORING_WEIGHTS);

  for (const [dimension, weight] of entries) {
    db.insert(scoringWeights)
      .values({
        id: nanoid(),
        dimension,
        weight,
        updatedAt: now,
        updatedBy: "seed",
        previousWeight: weight,
      })
      .onConflictDoNothing()
      .run();
  }

  console.log(`✅ Seeded ${entries.length} scoring weight dimensions`);
  console.log("🌱 Seed complete!");
}

seed().catch(console.error);
