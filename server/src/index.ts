import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { config } from "./config.js";
import { api } from "./api/routes.js";

// ─── MongoDB ───
import { connectDB, ensureIndexes, scoringWeightsCol } from "./db/index.js";
import { nanoid } from "nanoid";
import { DEFAULT_SCORING_WEIGHTS } from "./types/index.js";

// ─── Seed default weights if not present ───
async function seedDefaultWeights() {
  const now = new Date().toISOString();
  const col = scoringWeightsCol();

  for (const [dimension, weight] of Object.entries(DEFAULT_SCORING_WEIGHTS)) {
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
  console.log("⚖️  Default scoring weights loaded");
}

// ─── Build App ───
const app = new Hono();

// Middleware
app.use("*", cors({ origin: config.clientUrl, credentials: true }));
app.use("*", logger());

// Mount API routes
app.route("/api", api);

// Root
app.get("/", (c) => {
  return c.json({
    name: "NERVE Engine",
    version: "1.0.0",
    description: "Autonomous Agentic Outreach Engine",
    modes: {
      targeted: "POST /api/leads/execute — Evaluate a specific company",
      discovery: "POST /api/leads/discover — Get AI-recommended companies",
    },
    events: "GET /api/events — Server-Sent Events for real-time updates",
    health: "GET /api/health",
  });
});

// ─── Start Server ───
async function start() {
  await connectDB();
  await ensureIndexes();
  await seedDefaultWeights();

  console.log(`
╔══════════════════════════════════════════╗
║         🧠 NERVE Engine v1.0.0          ║
║                                          ║
║  Mode: ${config.simulationMode ? "SIMULATION 🔵" : "LIVE 🔴       "}                   ║
║  Port: ${config.port}                              ║
║  Client: ${config.clientUrl}             ║
║  DB: MongoDB (${config.mongoDbName})                ║
╚══════════════════════════════════════════╝
`);

  serve({
    fetch: app.fetch,
    port: config.port,
  });
}

start().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
