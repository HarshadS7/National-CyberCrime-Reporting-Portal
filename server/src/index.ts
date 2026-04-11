import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { config } from "./config.js";
import { api } from "./api/routes.js";

// ─── Initialize Tables (auto-create on startup) ───
import { db } from "./db/index.js";
import { sql } from "drizzle-orm";

function initializeDatabase() {
  // Create all tables if they don't exist
  db.run(sql`CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    company_domain TEXT,
    company_size TEXT,
    industry TEXT,
    funding_stage TEXT,
    funding_amount TEXT,
    tech_stack TEXT,
    headquarters TEXT,
    contact_name TEXT NOT NULL,
    contact_title TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    contact_linkedin TEXT,
    seniority TEXT,
    source TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    raw_input TEXT,
    enriched_at TEXT,
    created_at TEXT NOT NULL
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS agent_runs (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL REFERENCES leads(id),
    agent_number INTEGER NOT NULL,
    agent_name TEXT NOT NULL,
    status TEXT NOT NULL,
    input TEXT,
    output TEXT,
    error TEXT,
    started_at TEXT,
    completed_at TEXT,
    duration_ms INTEGER
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS signals (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL REFERENCES leads(id),
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    source TEXT NOT NULL,
    source_url TEXT,
    date_detected TEXT,
    recency_days INTEGER,
    strength TEXT NOT NULL,
    recency_weight REAL,
    created_at TEXT NOT NULL
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS scoring_weights (
    id TEXT PRIMARY KEY,
    dimension TEXT NOT NULL UNIQUE,
    weight REAL NOT NULL,
    updated_at TEXT NOT NULL,
    updated_by TEXT,
    previous_weight REAL
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS intent_scores (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL REFERENCES leads(id),
    composite_score REAL NOT NULL,
    tier TEXT NOT NULL,
    dimensions TEXT NOT NULL,
    top_contributors TEXT,
    generated_at TEXT NOT NULL
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS persona_profiles (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL REFERENCES leads(id),
    archetype TEXT NOT NULL,
    archetype_label TEXT NOT NULL,
    confidence REAL,
    traits TEXT,
    communication_style TEXT,
    preferred_tone TEXT,
    avoid_in_messaging TEXT,
    reasoning TEXT,
    generated_at TEXT NOT NULL
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS strategies (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL REFERENCES leads(id),
    primary_channel TEXT NOT NULL,
    secondary_channel TEXT,
    send_timestamp TEXT,
    timezone TEXT,
    tone_framework TEXT,
    cadence TEXT,
    decisions TEXT,
    generated_at TEXT NOT NULL
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS generated_content (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL REFERENCES leads(id),
    touch_number INTEGER NOT NULL,
    channel TEXT NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,
    preview TEXT,
    generated_at TEXT NOT NULL
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS delivery_logs (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL REFERENCES leads(id),
    touch_number INTEGER NOT NULL,
    channel TEXT NOT NULL,
    status TEXT NOT NULL,
    message_id TEXT,
    sent_at TEXT,
    simulation_mode INTEGER DEFAULT 0,
    raw_response TEXT
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS response_events (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL REFERENCES leads(id),
    channel TEXT NOT NULL,
    message_body TEXT,
    sentiment TEXT NOT NULL,
    classification_reasoning TEXT,
    action TEXT NOT NULL,
    received_at TEXT NOT NULL
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS learning_history (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL REFERENCES leads(id),
    weight_updates TEXT,
    heuristic_updates TEXT,
    tone_rule_updates TEXT,
    updated_at TEXT NOT NULL
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL REFERENCES leads(id),
    mode TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'running',
    current_agent INTEGER,
    simulation_mode INTEGER DEFAULT 1,
    started_at TEXT NOT NULL,
    completed_at TEXT
  )`);

  console.log("📦 Database tables initialized");
}

import { nanoid } from "nanoid";
import { DEFAULT_SCORING_WEIGHTS } from "./types/index.js";

// ─── Seed default weights if not present ───
function seedDefaultWeights() {
  const now = new Date().toISOString();

  for (const [dimension, weight] of Object.entries(DEFAULT_SCORING_WEIGHTS)) {
    db.run(
      sql`INSERT OR IGNORE INTO scoring_weights (id, dimension, weight, updated_at, updated_by, previous_weight)
          VALUES (${nanoid()}, ${dimension}, ${weight}, ${now}, 'seed', ${weight})`
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
initializeDatabase();
seedDefaultWeights();

console.log(`
╔══════════════════════════════════════════╗
║         🧠 NERVE Engine v1.0.0          ║
║                                          ║
║  Mode: ${config.simulationMode ? "SIMULATION 🔵" : "LIVE 🔴       "}                   ║
║  Port: ${config.port}                              ║
║  Client: ${config.clientUrl}             ║
╚══════════════════════════════════════════╝
`);

serve({
  fetch: app.fetch,
  port: config.port,
});
