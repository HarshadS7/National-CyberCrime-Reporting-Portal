import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ─── Leads ───
export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  companyName: text("company_name").notNull(),
  companyDomain: text("company_domain"),
  companySize: text("company_size"),
  industry: text("industry"),
  fundingStage: text("funding_stage"),
  fundingAmount: text("funding_amount"),
  techStack: text("tech_stack"), // JSON array
  headquarters: text("headquarters"),
  contactName: text("contact_name").notNull(),
  contactTitle: text("contact_title").notNull(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  contactLinkedIn: text("contact_linkedin"),
  seniority: text("seniority"),
  source: text("source").notNull(), // "targeted" | "discovery"
  status: text("status").notNull().default("new"), // new | processing | active | completed | do_not_contact
  rawInput: text("raw_input"), // JSON
  enrichedAt: text("enriched_at"),
  createdAt: text("created_at").notNull(),
});

// ─── Agent Runs (trace every agent execution) ───
export const agentRuns = sqliteTable("agent_runs", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull().references(() => leads.id),
  agentNumber: integer("agent_number").notNull(),
  agentName: text("agent_name").notNull(),
  status: text("status").notNull(), // idle | running | complete | error
  input: text("input"), // JSON
  output: text("output"), // JSON
  error: text("error"),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  durationMs: integer("duration_ms"),
});

// ─── Signals (from Agent 2) ───
export const signals = sqliteTable("signals", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull().references(() => leads.id),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  source: text("source").notNull(),
  sourceUrl: text("source_url"),
  dateDetected: text("date_detected"),
  recencyDays: integer("recency_days"),
  strength: text("strength").notNull(), // HIGH | MEDIUM | LOW
  recencyWeight: real("recency_weight"),
  createdAt: text("created_at").notNull(),
});

// ─── Scoring Weights (dynamic, updated by Agent 10) ───
export const scoringWeights = sqliteTable("scoring_weights", {
  id: text("id").primaryKey(),
  dimension: text("dimension").notNull().unique(),
  weight: real("weight").notNull(),
  updatedAt: text("updated_at").notNull(),
  updatedBy: text("updated_by"), // "seed" | "agent_10"
  previousWeight: real("previous_weight"),
});

// ─── Intent Scores (from Agent 3) ───
export const intentScores = sqliteTable("intent_scores", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull().references(() => leads.id),
  compositeScore: real("composite_score").notNull(),
  tier: text("tier").notNull(), // HOT | WARM | COOL | COLD
  dimensions: text("dimensions").notNull(), // JSON array of ScoreDimension
  topContributors: text("top_contributors"), // JSON array
  generatedAt: text("generated_at").notNull(),
});

// ─── Persona Profiles (from Agent 4) ───
export const personaProfiles = sqliteTable("persona_profiles", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull().references(() => leads.id),
  archetype: text("archetype").notNull(),
  archetypeLabel: text("archetype_label").notNull(),
  confidence: real("confidence"),
  traits: text("traits"), // JSON array
  communicationStyle: text("communication_style"),
  preferredTone: text("preferred_tone"),
  avoidInMessaging: text("avoid_in_messaging"), // JSON array
  reasoning: text("reasoning"),
  generatedAt: text("generated_at").notNull(),
});

// ─── Strategies (from Agent 5) ───
export const strategies = sqliteTable("strategies", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull().references(() => leads.id),
  primaryChannel: text("primary_channel").notNull(),
  secondaryChannel: text("secondary_channel"),
  sendTimestamp: text("send_timestamp"),
  timezone: text("timezone"),
  toneFramework: text("tone_framework"),
  cadence: text("cadence"), // JSON
  decisions: text("decisions"), // JSON
  generatedAt: text("generated_at").notNull(),
});

// ─── Generated Content (from Agent 6) ───
export const generatedContent = sqliteTable("generated_content", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull().references(() => leads.id),
  touchNumber: integer("touch_number").notNull(),
  channel: text("channel").notNull(),
  subject: text("subject"),
  body: text("body").notNull(),
  preview: text("preview"),
  generatedAt: text("generated_at").notNull(),
});

// ─── Delivery Logs (from Agent 8) ───
export const deliveryLogs = sqliteTable("delivery_logs", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull().references(() => leads.id),
  touchNumber: integer("touch_number").notNull(),
  channel: text("channel").notNull(),
  status: text("status").notNull(), // sent | queued | failed | simulated
  messageId: text("message_id"),
  sentAt: text("sent_at"),
  simulationMode: integer("simulation_mode", { mode: "boolean" }).default(false),
  rawResponse: text("raw_response"), // JSON
});

// ─── Response Events (from Agent 9) ───
export const responseEvents = sqliteTable("response_events", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull().references(() => leads.id),
  channel: text("channel").notNull(),
  messageBody: text("message_body"),
  sentiment: text("sentiment").notNull(), // positive | neutral | negative | no_reply
  classificationReasoning: text("classification_reasoning"),
  action: text("action").notNull(),
  receivedAt: text("received_at").notNull(),
});

// ─── Learning History (from Agent 10) ───
export const learningHistory = sqliteTable("learning_history", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull().references(() => leads.id),
  weightUpdates: text("weight_updates"), // JSON
  heuristicUpdates: text("heuristic_updates"), // JSON
  toneRuleUpdates: text("tone_rule_updates"), // JSON
  updatedAt: text("updated_at").notNull(),
});

// ─── Campaigns (top-level grouping) ───
export const campaigns = sqliteTable("campaigns", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull().references(() => leads.id),
  mode: text("mode").notNull(), // targeted | discovery
  status: text("status").notNull().default("running"), // running | paused | completed | cancelled
  currentAgent: integer("current_agent"),
  simulationMode: integer("simulation_mode", { mode: "boolean" }).default(true),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at"),
});
