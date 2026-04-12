import { Mastra } from '@mastra/core/mastra';
import { Agent } from '@mastra/core/agent';
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import { createGroq } from '@ai-sdk/groq';
import { generateText, generateObject } from 'ai';

"use strict";
const MODEL$1 = "groq/llama-3.3-70b-versatile";
const leadIngestionAgent = new Agent({
  id: "agent-1-lead-ingestion",
  name: "Lead Ingestion & Enrichment",
  instructions: `You are Agent 1 \u2014 the Lead Ingestion & Enrichment agent in the NERVE pipeline.
Your job is to accept a company name (and optional contact info), enrich it via Apollo API,
validate the data, de-duplicate, and produce a fully enriched lead record.
You output structured JSON with company details, contact details, tech stack, funding stage, and seniority.`,
  model: MODEL$1
});
const signalScoutAgent = new Agent({
  id: "agent-2-signal-scout",
  name: "Signal Scout",
  instructions: `You are Agent 2 \u2014 the Signal Scout in the NERVE pipeline.
Given an enriched lead, you scan the web via Tavily for recent signals:
funding rounds, product launches, executive hires, hiring spikes, LinkedIn activity,
partnerships, awards. You classify each signal by category, strength (HIGH/MEDIUM/LOW),
recency, and return a ranked SignalBundle.`,
  model: MODEL$1
});
const intentScorerAgent = new Agent({
  id: "agent-3-intent-scorer",
  name: "Intent Scorer",
  instructions: `You are Agent 3 \u2014 the Intent Scorer in the NERVE pipeline.
Given an enriched lead and its signal bundle, you compute a composite intent score (0-100)
across weighted dimensions: ICP fit, seniority, geography, industry relevance, company size,
funding stage, signal strength, LinkedIn activity, engagement history.
Classify the lead as HOT / WARM / COOL / COLD based on the composite score.`,
  model: MODEL$1
});
const personaAnalystAgent = new Agent({
  id: "agent-4-persona-analyst",
  name: "Persona Analyst",
  instructions: `You are Agent 4 \u2014 the Persona Analyst in the NERVE pipeline.
Given an enriched lead, analyze the contact's archetype (strategic_executive, practitioner,
innovator, networker), their personality traits, communication style, preferred tone,
and what to avoid in messaging. Produce a PersonaProfile with confidence score.`,
  model: MODEL$1
});
const strategyCommanderAgent = new Agent({
  id: "agent-5-strategy-commander",
  name: "Strategy Commander",
  instructions: `You are Agent 5 \u2014 the Strategy Commander, the central decision brain of the NERVE pipeline.
Given the enriched lead, signal bundle, intent score, and persona profile, decide:
1. Primary outreach channel (linkedin_dm / email / whatsapp)
2. Tone framework (insight_led / peer_problem / challenger / relationship_first / growth_urgency)
3. Optimal send timing (based on timezone + working hours)
4. 3-touch cadence schedule with channel + day offsets
Return an OutreachStrategy with explicit decisions and reasoning.`,
  model: MODEL$1
});
const contentForgeAgent = new Agent({
  id: "agent-6-content-forge",
  name: "Content Forge",
  instructions: `You are Agent 6 \u2014 the Content Forge in the NERVE pipeline.
Given lead, signals, intent, persona, and strategy, generate personalized outreach messages
for each touch in the cadence. Craft subject lines (for emails), message bodies, and optionally
a LinkedIn thought-leadership post and headline suggestion. Every message should reference
real signals and use the persona's preferred tone.`,
  model: MODEL$1
});
const explainerAgent = new Agent({
  id: "agent-7-explainer",
  name: "Decision Trace & Explainability",
  instructions: `You are Agent 7 \u2014 the Explainer in the NERVE pipeline.
Given the full trace of all upstream agents (lead, signals, intent, persona, strategy, content),
produce a plain-English executive summary of WHY each decision was made.
For each agent's output, generate a RationaleItem with: agentName, decision, explanation, confidence.
This powers the explainability layer of the system.`,
  model: MODEL$1
});
const deliveryAgent = new Agent({
  id: "agent-8-delivery",
  name: "Delivery & Execution",
  instructions: `You are Agent 8 \u2014 the Delivery agent in the NERVE pipeline.
Given the enriched lead, outreach strategy, and generated content, dispatch the first-touch
message via the appropriate platform:
- LinkedIn DM \u2192 HeyReach API
- Email \u2192 Resend API
- WhatsApp \u2192 AiSensy API
Track delivery receipts, message IDs, and status (sent/queued/failed/simulated).`,
  model: MODEL$1
});
const responseMonitorAgent = new Agent({
  id: "agent-9-response-monitor",
  name: "Response Monitor",
  instructions: `You are Agent 9 \u2014 the Response Monitor in the NERVE pipeline.
When a prospect responds (or doesn't after a timeout), classify the sentiment
(positive / neutral / negative / no_reply) and recommend an action:
escalate_human, continue_cadence, cancel_sequence, or nurture.
Provide classification reasoning.`,
  model: MODEL$1
});
const learningLoopAgent = new Agent({
  id: "agent-10-learning-loop",
  name: "Learning Loop",
  instructions: `You are Agent 10 \u2014 the Learning Loop in the NERVE pipeline.
Given the response event, original intent score, outreach strategy, and persona profile,
compute scoring weight adjustments (delta per dimension) to improve future predictions.
Also generate heuristic updates and tone rule adjustments.
This enables the system to compound its learning over every outreach cycle.`,
  model: MODEL$1
});

"use strict";
const __dirname$1 = dirname(fileURLToPath(import.meta.url));
function loadEnv() {
  const candidates = [
    resolve(__dirname$1, "../.env"),
    // server/.env (from src/config.ts → ../)
    resolve(__dirname$1, "../../.env")
    // HackX/.env (fallback)
  ];
  for (const envPath of candidates) {
    try {
      const content = readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
      break;
    } catch {
    }
  }
}
loadEnv();
const config = {
  // Server
  port: parseInt(process.env.PORT || "3001", 10),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  // Mode
  simulationMode: process.env.SIMULATION_MODE === "true",
  // MongoDB
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017",
  mongoDbName: process.env.MONGO_DB_NAME || "nerve",
  // LLM (Groq — llama-3.3-70b-versatile)
  groqApiKey: process.env.GROQ_API_KEY || "",
  // Enrichment & Signals
  apolloApiKey: process.env.APOLLO_API_KEY || "",
  tavilyApiKey: process.env.TAVILY_API_KEY || "",
  // Outreach
  resendApiKey: process.env.RESEND_API_KEY || "",
  heyreachApiKey: process.env.HEYREACH_API_KEY || "",
  aisensyApiKey: process.env.AISENSY_API_KEY || ""
};

var config$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  config: config
});

"use strict";
const MONGO_URI = config.mongoUri;
const DB_NAME = config.mongoDbName;
const client = new MongoClient(MONGO_URI);
let _db;
async function connectDB() {
  if (_db) return _db;
  await client.connect();
  _db = client.db(DB_NAME);
  console.log(`\u{1F4E6} Connected to MongoDB \u2014 ${DB_NAME}`);
  return _db;
}
function getDB() {
  if (!_db) throw new Error("Database not connected. Call connectDB() first.");
  return _db;
}
function leadsCol() {
  return getDB().collection("leads");
}
function agentRunsCol() {
  return getDB().collection("agent_runs");
}
function signalsCol() {
  return getDB().collection("signals");
}
function scoringWeightsCol() {
  return getDB().collection("scoring_weights");
}
function intentScoresCol() {
  return getDB().collection("intent_scores");
}
function personaProfilesCol() {
  return getDB().collection("persona_profiles");
}
function strategiesCol() {
  return getDB().collection("strategies");
}
function generatedContentCol() {
  return getDB().collection("generated_content");
}
function deliveryLogsCol() {
  return getDB().collection("delivery_logs");
}
function responseEventsCol() {
  return getDB().collection("response_events");
}
function learningHistoryCol() {
  return getDB().collection("learning_history");
}
function campaignsCol() {
  return getDB().collection("campaigns");
}
async function ensureIndexes() {
  const db = getDB();
  await db.collection("leads").createIndex({ companyName: 1 });
  await db.collection("leads").createIndex({ status: 1 });
  await db.collection("agent_runs").createIndex({ leadId: 1, agentNumber: 1 });
  await db.collection("signals").createIndex({ leadId: 1 });
  await db.collection("scoring_weights").createIndex({ dimension: 1 }, { unique: true });
  await db.collection("intent_scores").createIndex({ leadId: 1 });
  await db.collection("persona_profiles").createIndex({ leadId: 1 });
  await db.collection("strategies").createIndex({ leadId: 1 });
  await db.collection("generated_content").createIndex({ leadId: 1 });
  await db.collection("delivery_logs").createIndex({ leadId: 1 });
  await db.collection("response_events").createIndex({ leadId: 1 });
  await db.collection("learning_history").createIndex({ leadId: 1 });
  await db.collection("campaigns").createIndex({ leadId: 1 });
  console.log("\u{1F5C2}\uFE0F  MongoDB indexes ensured");
}

"use strict";
class SSEManager {
  clients = /* @__PURE__ */ new Map();
  addClient(client) {
    this.clients.set(client.id, client);
    console.log(`\u{1F4E1} SSE client connected: ${client.id} (total: ${this.clients.size})`);
  }
  removeClient(clientId) {
    this.clients.delete(clientId);
    console.log(`\u{1F4E1} SSE client disconnected: ${clientId} (total: ${this.clients.size})`);
  }
  /** Broadcast to all clients, or only those subscribed to a specific leadId */
  broadcast(event) {
    for (const client of this.clients.values()) {
      if (!client.leadId || client.leadId === event.leadId) {
        try {
          client.send(event);
        } catch {
          this.removeClient(client.id);
        }
      }
    }
  }
  /** Convenience: emit an agent status update */
  emitAgentStatus(leadId, agentNumber, agentName, status, outputSummary, error) {
    this.broadcast({
      type: "agent_status",
      leadId,
      data: { agentNumber, agentName, status, outputSummary, error },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  /** Convenience: emit a typed data update */
  emit(type, leadId, data) {
    this.broadcast({
      type,
      leadId,
      data,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  getClientCount() {
    return this.clients.size;
  }
}
const sseManager = new SSEManager();

"use strict";
const groq = createGroq({
  apiKey: config.groqApiKey
});
const MODEL = "llama-3.3-70b-versatile";
function hasKey() {
  return !!(config.groqApiKey && config.groqApiKey.length > 10);
}
function isQuotaError(error) {
  const msg = String(error);
  return msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("429") || msg.includes("rate_limit");
}
async function llmGenerateText(systemPrompt, userMessage) {
  if (!hasKey()) {
    console.warn("[LLM] No Groq API key \u2014 returning simulated response");
    return `[SIMULATED] ${systemPrompt.slice(0, 80)}... | Input: ${userMessage.slice(0, 80)}`;
  }
  try {
    const { text } = await generateText({
      model: groq(MODEL),
      system: systemPrompt,
      prompt: userMessage
    });
    return text;
  } catch (error) {
    if (isQuotaError(error)) {
      console.warn("[LLM] Groq rate limit \u2014 returning simulated response");
      return `[QUOTA_EXCEEDED] ${userMessage.slice(0, 100)}`;
    }
    throw error;
  }
}
async function llmGenerateObject(systemPrompt, userMessage, schema, schemaName) {
  if (!hasKey()) {
    throw new Error(`GROQ_API_KEY not set \u2014 cannot generate structured object for "${schemaName}"`);
  }
  try {
    const { object } = await generateObject({
      model: groq(MODEL),
      system: systemPrompt,
      prompt: userMessage,
      schema,
      schemaName
    });
    return object;
  } catch (error) {
    if (isQuotaError(error)) {
      console.warn(`[LLM] Groq rate limit for "${schemaName}" \u2014 throwing`);
    }
    throw error;
  }
}

"use strict";
const AGENT_NUMBER$9 = 1;
const AGENT_NAME$9 = "Lead Ingestion";
async function enrichViaApollo(companyName, contactName, contactTitle, location) {
  if (config.simulationMode) {
    return simulateApolloEnrichment(companyName, contactName, contactTitle, location);
  }
  try {
    const response = await fetch("https://api.apollo.io/api/v1/mixed_people/api_search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "X-Api-Key": config.apolloApiKey
      },
      body: JSON.stringify({
        q_organization_name: companyName,
        q_person_name: contactName || void 0,
        per_page: 1
      })
    });
    if (!response.ok) {
      console.warn(`Apollo API returned ${response.status}, falling back to simulation`);
      return simulateApolloEnrichment(companyName, contactName, contactTitle, location);
    }
    const data = await response.json();
    const person = data.people?.[0];
    if (!person) {
      return simulateApolloEnrichment(companyName, contactName, contactTitle, location);
    }
    const org = person.organization;
    return {
      companyDomain: org?.website_url,
      companySize: org?.estimated_num_employees ? categorizeSize(org.estimated_num_employees) : void 0,
      industry: org?.industry,
      fundingStage: org?.funding_stage,
      fundingAmount: org?.total_funding ? `$${(org.total_funding / 1e6).toFixed(1)}M` : void 0,
      techStack: org?.technologies?.slice(0, 10),
      headquarters: org?.city && org?.country ? `${org.city}, ${org.country}` : void 0,
      contactName: person.name || contactName || "Unknown",
      contactTitle: person.title || "Unknown",
      contactEmail: person.email,
      contactPhone: person.phone_numbers?.[0]?.sanitized_number,
      contactLinkedIn: person.linkedin_url,
      seniority: person.seniority
    };
  } catch (error) {
    console.warn("Apollo API error, falling back to simulation:", error);
    return simulateApolloEnrichment(companyName, contactName, contactTitle, location);
  }
}
function simulateApolloEnrichment(companyName, contactName, contactTitle, location) {
  const industries = ["SaaS", "FinTech", "HealthTech", "EdTech", "E-commerce", "DevTools", "AI/ML"];
  const stages = ["Seed", "Series A", "Series B", "Series C", "Growth", "Public"];
  const stacks = ["React", "Node.js", "Python", "AWS", "Kubernetes", "PostgreSQL", "Redis", "TypeScript"];
  const cities = ["Mumbai", "Bangalore", "San Francisco", "New York", "London", "Berlin", "Singapore"];
  const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const stage = randomPick(stages);
  const amounts = {
    Seed: "$2.5M",
    "Series A": "$12M",
    "Series B": "$45M",
    "Series C": "$120M",
    Growth: "$250M",
    Public: "N/A"
  };
  const inferredSeniority = inferSeniority(contactTitle);
  return {
    companyDomain: `${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
    companySize: randomPick(["11-50", "51-200", "201-500", "501-1000"]),
    industry: randomPick(industries),
    fundingStage: stage,
    fundingAmount: amounts[stage] || "$10M",
    techStack: stacks.sort(() => Math.random() - 0.5).slice(0, 4),
    headquarters: location || randomPick(cities),
    contactName: contactName || `${randomPick(["Rahul", "Priya", "Amit", "Sarah", "James"])} ${randomPick(["Sharma", "Patel", "Singh", "Chen", "Wilson"])}`,
    contactTitle: contactTitle || randomPick(["VP Sales", "CTO", "Head of Engineering", "VP Marketing", "Director of Product"]),
    contactEmail: `${(contactName || "contact").toLowerCase().replace(/\s+/g, ".")}@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
    contactPhone: "+91-9876543210",
    contactLinkedIn: `https://linkedin.com/in/${(contactName || "contact").toLowerCase().replace(/\s+/g, "-")}`,
    seniority: inferredSeniority || randomPick(["C-Level", "VP", "Director", "Manager"])
  };
}
function inferSeniority(title) {
  if (!title) return void 0;
  const t = title.toLowerCase();
  if (t.includes("chief") || t.includes("ceo") || t.includes("cto") || t.includes("cfo") || t.includes("coo") || t.includes("co-founder") || t.includes("founder")) return "C-Level";
  if (t.includes("vp") || t.includes("vice president")) return "VP";
  if (t.includes("director") || t.includes("head of")) return "Director";
  if (t.includes("manager") || t.includes("lead")) return "Manager";
  return void 0;
}
function categorizeSize(employees) {
  if (employees <= 10) return "1-10";
  if (employees <= 50) return "11-50";
  if (employees <= 200) return "51-200";
  if (employees <= 500) return "201-500";
  if (employees <= 1e3) return "501-1000";
  return "1000+";
}
async function discoverCompanies(input) {
  if (config.simulationMode && !config.groqApiKey) {
    return simulateDiscovery(input);
  }
  const systemPrompt = `You are a B2B sales intelligence agent. Given a product description and target criteria, recommend real companies that would be ideal prospects. Return ONLY a JSON array of objects, each with "companyName", "contactTitle" (the ideal person to reach out to), and "reason" (one sentence on why they're a good fit). Return ${input.maxResults || 5} companies.`;
  const userMessage = `
Product: ${input.productName}
Description: ${input.productDescription}
Target Industries: ${input.targetIndustries.join(", ")}
Target Company Size: ${input.targetCompanySize || "Any"}
Target Geographies: ${input.targetGeographies?.join(", ") || "Global"}
ICP: ${input.idealCustomerProfile || "Not specified"}

Recommend real, specific companies that would benefit from this product.`;
  try {
    const response = await llmGenerateText(systemPrompt, userMessage);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return simulateDiscovery(input);
  } catch {
    return simulateDiscovery(input);
  }
}
function simulateDiscovery(input) {
  const companies = [
    { companyName: "Freshworks", contactTitle: "VP Engineering", reason: `Strong fit \u2014 ${input.targetIndustries[0] || "SaaS"} company actively scaling their tech stack` },
    { companyName: "Razorpay", contactTitle: "Head of Platform", reason: "High-growth FinTech, recently raised Series F, expanding product suite" },
    { companyName: "Postman", contactTitle: "Director of Product", reason: "DevTools company with strong API-first culture, ideal for technical products" },
    { companyName: "Zerodha", contactTitle: "CTO", reason: "Tech-forward fintech with lean engineering team, values developer productivity" },
    { companyName: "Notion", contactTitle: "VP Sales", reason: "Productivity SaaS scaling rapidly, open to tools that improve workflow" }
  ];
  return companies.slice(0, input.maxResults || 5);
}
async function checkDuplicate(companyName, contactEmail) {
  const existing = await leadsCol().find({ companyName }).toArray();
  if (existing.length === 0) return false;
  return existing.some(
    (l) => l.status === "processing" || l.status === "active" || contactEmail && l.contactEmail === contactEmail
  );
}
async function runLeadIngestionAgent(input) {
  const startTime = Date.now();
  const enrichedLeads = [];
  sseManager.emitAgentStatus("pipeline", AGENT_NUMBER$9, AGENT_NAME$9, "running");
  try {
    if (input.mode === "targeted") {
      const targeted = input;
      const isDuplicate = await checkDuplicate(targeted.companyName, targeted.contactEmail);
      if (isDuplicate) {
        sseManager.emit("agent_status", "pipeline", {
          agentNumber: AGENT_NUMBER$9,
          agentName: AGENT_NAME$9,
          status: "complete",
          outputSummary: `Duplicate detected for ${targeted.companyName} \u2014 skipping`
        });
        return [];
      }
      const enrichment = await enrichViaApollo(targeted.companyName, targeted.contactName, targeted.contactTitle, targeted.location);
      const lead = buildEnrichedLead(enrichment, targeted);
      enrichedLeads.push(lead);
    } else {
      const discovery = input;
      sseManager.emit("agent_status", "pipeline", {
        agentNumber: AGENT_NUMBER$9,
        agentName: AGENT_NAME$9,
        status: "running",
        outputSummary: "Discovering ideal target companies..."
      });
      const recommendations = await discoverCompanies(discovery);
      for (const rec of recommendations) {
        const isDuplicate = await checkDuplicate(rec.companyName);
        if (isDuplicate) continue;
        const enrichment = await enrichViaApollo(rec.companyName, void 0, rec.contactTitle);
        const lead = buildEnrichedLead(enrichment, {
          ...discovery,
          _companyName: rec.companyName,
          _reason: rec.reason
        });
        enrichedLeads.push(lead);
      }
    }
    for (const lead of enrichedLeads) {
      await leadsCol().insertOne({
        _id: lead.id,
        companyName: lead.companyName,
        companyDomain: lead.companyDomain,
        companySize: lead.companySize,
        industry: lead.industry,
        fundingStage: lead.fundingStage,
        fundingAmount: lead.fundingAmount,
        techStack: JSON.stringify(lead.techStack),
        headquarters: lead.headquarters,
        contactName: lead.contactName,
        contactTitle: lead.contactTitle,
        contactEmail: lead.contactEmail,
        contactPhone: lead.contactPhone,
        contactLinkedIn: lead.contactLinkedIn,
        seniority: lead.seniority,
        source: lead.source,
        status: "processing",
        rawInput: JSON.stringify(lead.rawInput),
        enrichedAt: lead.enrichedAt,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    const durationMs = Date.now() - startTime;
    const summary = input.mode === "targeted" ? `Enriched ${enrichedLeads[0]?.companyName || "lead"} \u2014 ${enrichedLeads[0]?.contactName}, ${enrichedLeads[0]?.contactTitle}` : `Discovered & enriched ${enrichedLeads.length} target companies`;
    sseManager.emitAgentStatus("pipeline", AGENT_NUMBER$9, AGENT_NAME$9, "complete", summary);
    sseManager.emit("score_update", "pipeline", {
      agent: AGENT_NAME$9,
      leads: enrichedLeads.map((l) => ({
        id: l.id,
        company: l.companyName,
        contact: l.contactName,
        title: l.contactTitle
      })),
      durationMs
    });
    console.log(`\u2705 Agent 1 complete in ${durationMs}ms \u2014 ${summary}`);
    return enrichedLeads;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    sseManager.emitAgentStatus("pipeline", AGENT_NUMBER$9, AGENT_NAME$9, "error", void 0, errMsg);
    throw error;
  }
}
function buildEnrichedLead(enrichment, input) {
  const companyName = input.mode === "targeted" ? input.companyName : input._companyName || "Unknown";
  return {
    id: nanoid(),
    companyName,
    companyDomain: enrichment.companyDomain,
    companySize: enrichment.companySize,
    industry: enrichment.industry,
    fundingStage: enrichment.fundingStage,
    fundingAmount: enrichment.fundingAmount,
    techStack: enrichment.techStack,
    headquarters: enrichment.headquarters,
    contactName: enrichment.contactName,
    contactTitle: enrichment.contactTitle,
    contactEmail: enrichment.contactEmail,
    contactPhone: enrichment.contactPhone,
    contactLinkedIn: enrichment.contactLinkedIn,
    seniority: enrichment.seniority,
    source: input.mode,
    enrichedAt: (/* @__PURE__ */ new Date()).toISOString(),
    rawInput: input
  };
}

"use strict";
const AGENT_NUMBER$8 = 2;
const AGENT_NAME$8 = "Signal Scout";
async function searchTavily(query) {
  if (config.simulationMode || !config.tavilyApiKey) {
    return simulateTavilySearch(query);
  }
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: config.tavilyApiKey,
        query,
        search_depth: "advanced",
        max_results: 10,
        include_answer: false
      })
    });
    if (!response.ok) {
      console.warn(`Tavily API returned ${response.status}, falling back to simulation`);
      return simulateTavilySearch(query);
    }
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.warn("Tavily API error:", error);
    return simulateTavilySearch(query);
  }
}
function simulateTavilySearch(query) {
  const companyName = query.split(" ")[0] || "Company";
  const now = /* @__PURE__ */ new Date();
  return [
    {
      title: `${companyName} Raises Series B Funding Round`,
      url: `https://techcrunch.com/${companyName.toLowerCase()}-series-b`,
      content: `${companyName} has announced a $45M Series B funding round led by Sequoia Capital. The company plans to use the funds to expand its engineering team and accelerate product development across new markets.`,
      published_date: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1e3).toISOString()
    },
    {
      title: `${companyName} Launches New AI-Powered Product Suite`,
      url: `https://venturebeat.com/${companyName.toLowerCase()}-ai-product`,
      content: `${companyName} unveiled its new AI-powered product suite at the annual SaaS conference, targeting enterprise customers looking to automate their workflows.`,
      published_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1e3).toISOString()
    },
    {
      title: `${companyName} Hires Former Google VP as New CTO`,
      url: `https://linkedin.com/posts/${companyName.toLowerCase()}-new-cto`,
      content: `${companyName} has appointed Dr. Aisha Patel, former VP of Engineering at Google Cloud, as its new Chief Technology Officer. The hire signals the company's push into enterprise-grade infrastructure.`,
      published_date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1e3).toISOString()
    },
    {
      title: `${companyName} Expands Operations to Southeast Asia`,
      url: `https://bloomberg.com/${companyName.toLowerCase()}-asia-expansion`,
      content: `${companyName} is opening new offices in Singapore and Jakarta as part of its Asia-Pacific expansion strategy, aiming to capture the growing SaaS market in the region.`,
      published_date: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1e3).toISOString()
    },
    {
      title: `${companyName} is Hiring: 12 Open Engineering Roles`,
      url: `https://careers.${companyName.toLowerCase()}.com`,
      content: `${companyName} currently has 12 open engineering positions across backend, frontend, and ML engineering, suggesting significant team growth and product investment.`,
      published_date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1e3).toISOString()
    }
  ];
}
function classifySignal(result) {
  const text = `${result.title} ${result.content}`.toLowerCase();
  const categories = [];
  const hiringKeywords = ["hiring", "open roles", "open positions", "engineering positions", "careers", "job openings", "we're hiring", "is hiring", "open engineering"];
  const hiringScore = hiringKeywords.reduce((s, kw) => s + (text.includes(kw) ? 1 : 0), 0);
  if (hiringScore > 0) categories.push({ category: "hiring_spike", strength: "MEDIUM", score: hiringScore });
  const execKeywords = ["appointed", "new cto", "new ceo", "new vp", "new chief", "names new", "hires former", "joins as"];
  const execScore = execKeywords.reduce((s, kw) => s + (text.includes(kw) ? 1 : 0), 0);
  if (execScore > 0) categories.push({ category: "executive_hire", strength: "HIGH", score: execScore });
  const fundingKeywords = ["funding", "raised", "series a", "series b", "series c", "series d", "investment", "seed round", "led by", "venture capital", "valuation"];
  const fundingScore = fundingKeywords.reduce((s, kw) => s + (text.includes(kw) ? 1 : 0), 0);
  if (fundingScore > 0) categories.push({ category: "funding", strength: "HIGH", score: fundingScore });
  const productKeywords = ["launch", "unveiled", "announces new", "release", "new product", "product suite", "generally available"];
  const productScore = productKeywords.reduce((s, kw) => s + (text.includes(kw) ? 1 : 0), 0);
  if (productScore > 0) categories.push({ category: "product_launch", strength: "HIGH", score: productScore });
  const geoKeywords = ["expand", "new office", "new market", "expansion", "opens office", "opens new", "entering"];
  const geoScore = geoKeywords.reduce((s, kw) => s + (text.includes(kw) ? 1 : 0), 0);
  if (geoScore > 0) categories.push({ category: "geographic_expansion", strength: "MEDIUM", score: geoScore });
  const partnerKeywords = ["partner", "collaboration", "integration", "strategic alliance", "joins forces"];
  const partnerScore = partnerKeywords.reduce((s, kw) => s + (text.includes(kw) ? 1 : 0), 0);
  if (partnerScore > 0) categories.push({ category: "partnership", strength: "MEDIUM", score: partnerScore });
  const awardKeywords = ["award", "recognition", "named best", "wins", "honored"];
  const awardScore = awardKeywords.reduce((s, kw) => s + (text.includes(kw) ? 1 : 0), 0);
  if (awardScore > 0) categories.push({ category: "award", strength: "LOW", score: awardScore });
  if (categories.length > 0) {
    categories.sort((a, b) => b.score - a.score);
    return { category: categories[0].category, strength: categories[0].strength };
  }
  return { category: "other", strength: "LOW" };
}
function calculateRecencyWeight(dateStr) {
  if (!dateStr) return { recencyDays: 30, weight: 0.3 };
  const signalDate = new Date(dateStr);
  const now = /* @__PURE__ */ new Date();
  const diffMs = now.getTime() - signalDate.getTime();
  const days = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1e3)));
  const weight = Math.round(Math.exp(-days / 15) * 100) / 100;
  return { recencyDays: days, weight };
}
function determineOverallStrength(signals) {
  const highCount = signals.filter((s) => s.strength === "HIGH").length;
  const medCount = signals.filter((s) => s.strength === "MEDIUM").length;
  if (highCount >= 2) return "HIGH";
  if (highCount >= 1 || medCount >= 2) return "MEDIUM";
  return "LOW";
}
function simulateLinkedInActivity(lead) {
  const seniorityScores = {
    "C-Level": 75,
    VP: 80,
    Director: 65,
    Manager: 55,
    "Individual Contributor": 40
  };
  const base = seniorityScores[lead.seniority || "Manager"] || 50;
  return Math.min(100, Math.max(0, base + Math.floor(Math.random() * 30 - 10)));
}
async function runSignalScoutAgent(lead) {
  const startTime = Date.now();
  sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$8, AGENT_NAME$8, "running");
  try {
    const searchQuery = `${lead.companyName} ${lead.industry || "technology"} news funding product launch 2025 2026`;
    const tavilyResults = await searchTavily(searchQuery);
    const processedSignals = tavilyResults.map((result) => {
      const { category, strength } = classifySignal(result);
      const { recencyDays, weight } = calculateRecencyWeight(result.published_date);
      return {
        id: nanoid(),
        category,
        title: result.title,
        description: result.content.slice(0, 300),
        source: new URL(result.url).hostname,
        sourceUrl: result.url,
        dateDetected: result.published_date || (/* @__PURE__ */ new Date()).toISOString(),
        recencyDays,
        strength,
        recencyWeight: weight
      };
    });
    processedSignals.sort((a, b) => b.recencyWeight - a.recencyWeight);
    const linkedinActivityScore = simulateLinkedInActivity(lead);
    if (linkedinActivityScore > 60) {
      processedSignals.push({
        id: nanoid(),
        category: "linkedin_activity",
        title: `${lead.contactName} is active on LinkedIn`,
        description: `LinkedIn activity score: ${linkedinActivityScore}/100. Recent posts and engagement suggest high receptiveness to outreach.`,
        source: "linkedin.com",
        sourceUrl: lead.contactLinkedIn,
        dateDetected: (/* @__PURE__ */ new Date()).toISOString(),
        recencyDays: 0,
        strength: linkedinActivityScore > 75 ? "HIGH" : "MEDIUM",
        recencyWeight: linkedinActivityScore > 75 ? 0.9 : 0.6
      });
    }
    const bundle = {
      leadId: lead.id,
      signals: processedSignals,
      topSignal: processedSignals[0] || null,
      linkedinActivityScore,
      overallSignalStrength: determineOverallStrength(processedSignals),
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    for (const signal of processedSignals) {
      await signalsCol().insertOne({
        _id: signal.id,
        leadId: lead.id,
        category: signal.category,
        title: signal.title,
        description: signal.description,
        source: signal.source,
        sourceUrl: signal.sourceUrl,
        dateDetected: signal.dateDetected,
        recencyDays: signal.recencyDays,
        strength: signal.strength,
        recencyWeight: signal.recencyWeight,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    const durationMs = Date.now() - startTime;
    const summary = `Found ${processedSignals.length} signals \u2014 Top: ${bundle.topSignal?.title || "None"} (${bundle.overallSignalStrength})`;
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$8, AGENT_NAME$8, "complete", summary);
    sseManager.emit("signal_update", lead.id, bundle);
    console.log(`\u2705 Agent 2 complete in ${durationMs}ms \u2014 ${summary}`);
    return bundle;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$8, AGENT_NAME$8, "error", void 0, errMsg);
    throw error;
  }
}

"use strict";
const DEFAULT_SCORING_WEIGHTS = {
  icpFit: 0.15,
  seniority: 0.12,
  geography: 0.08,
  industryRelevance: 0.13,
  companySize: 0.08,
  fundingStage: 0.12,
  signalStrength: 0.15,
  linkedinActivity: 0.07,
  engagementHistory: 0.1
};

"use strict";
const AGENT_NUMBER$7 = 3;
const AGENT_NAME$7 = "Intent Scorer";
async function loadWeights() {
  const rows = await scoringWeightsCol().find({}).toArray();
  if (rows.length === 0) {
    return { ...DEFAULT_SCORING_WEIGHTS };
  }
  const weights = {};
  for (const row of rows) {
    weights[row.dimension] = row.weight;
  }
  return {
    icpFit: weights.icpFit ?? DEFAULT_SCORING_WEIGHTS.icpFit,
    seniority: weights.seniority ?? DEFAULT_SCORING_WEIGHTS.seniority,
    geography: weights.geography ?? DEFAULT_SCORING_WEIGHTS.geography,
    industryRelevance: weights.industryRelevance ?? DEFAULT_SCORING_WEIGHTS.industryRelevance,
    companySize: weights.companySize ?? DEFAULT_SCORING_WEIGHTS.companySize,
    fundingStage: weights.fundingStage ?? DEFAULT_SCORING_WEIGHTS.fundingStage,
    signalStrength: weights.signalStrength ?? DEFAULT_SCORING_WEIGHTS.signalStrength,
    linkedinActivity: weights.linkedinActivity ?? DEFAULT_SCORING_WEIGHTS.linkedinActivity,
    engagementHistory: weights.engagementHistory ?? DEFAULT_SCORING_WEIGHTS.engagementHistory
  };
}
function scoreIcpFit(lead) {
  let score = 50;
  const reasons = [];
  if (lead.contactEmail) {
    score += 10;
    reasons.push("Verified email available");
  }
  if (lead.contactLinkedIn) {
    score += 10;
    reasons.push("LinkedIn profile found");
  }
  if (lead.industry) {
    score += 10;
    reasons.push(`Industry identified: ${lead.industry}`);
  }
  if (lead.techStack && lead.techStack.length > 0) {
    score += 10;
    reasons.push(`Tech stack identified (${lead.techStack.length} technologies)`);
  }
  if (lead.companyDomain) {
    score += 5;
    reasons.push("Company domain verified");
  }
  return {
    score: Math.min(100, score),
    reasoning: reasons.join(". ") || "Basic ICP match"
  };
}
function scoreSeniority(lead) {
  const seniorityScores = {
    "C-Level": 95,
    VP: 85,
    Director: 70,
    Manager: 55,
    "Individual Contributor": 30
  };
  const score = seniorityScores[lead.seniority || ""] || 40;
  return {
    score,
    reasoning: `${lead.seniority || "Unknown"} seniority \u2014 ${lead.contactTitle}`
  };
}
function scoreGeography(lead) {
  const hq = (lead.headquarters || "").toLowerCase();
  if (hq.includes("bangalore") || hq.includes("bengaluru") || hq.includes("mumbai") || hq.includes("delhi")) {
    return { score: 85, reasoning: `India tech hub: ${lead.headquarters}` };
  }
  if (hq.includes("san francisco") || hq.includes("new york") || hq.includes("silicon valley")) {
    return { score: 90, reasoning: `US tech hub: ${lead.headquarters}` };
  }
  if (hq.includes("london") || hq.includes("berlin") || hq.includes("singapore")) {
    return { score: 75, reasoning: `International tech hub: ${lead.headquarters}` };
  }
  if (hq) {
    return { score: 55, reasoning: `Location: ${lead.headquarters}` };
  }
  return { score: 40, reasoning: "Location unknown" };
}
function scoreIndustryRelevance(lead) {
  const highRelevance = ["SaaS", "FinTech", "DevTools", "AI/ML", "Cloud", "Enterprise Software"];
  const medRelevance = ["E-commerce", "HealthTech", "EdTech", "MarTech", "Cybersecurity"];
  const industry = lead.industry || "";
  if (highRelevance.some((i) => industry.toLowerCase().includes(i.toLowerCase()))) {
    return { score: 90, reasoning: `High-relevance industry: ${industry}` };
  }
  if (medRelevance.some((i) => industry.toLowerCase().includes(i.toLowerCase()))) {
    return { score: 70, reasoning: `Medium-relevance industry: ${industry}` };
  }
  if (industry) {
    return { score: 50, reasoning: `Industry: ${industry}` };
  }
  return { score: 35, reasoning: "Industry unknown" };
}
function scoreCompanySize(lead) {
  const sizeScores = {
    "1-10": 30,
    "11-50": 55,
    "51-200": 80,
    "201-500": 90,
    "501-1000": 85,
    "1000+": 70
  };
  const score = sizeScores[lead.companySize || ""] || 50;
  return {
    score,
    reasoning: `Company size: ${lead.companySize || "Unknown"} employees`
  };
}
function scoreFundingStage(lead) {
  const stageScores = {
    Seed: 45,
    "Series A": 70,
    "Series B": 90,
    "Series C": 85,
    Growth: 75,
    Public: 50
  };
  const score = stageScores[lead.fundingStage || ""] || 40;
  const extra = lead.fundingAmount ? ` (${lead.fundingAmount})` : "";
  return {
    score,
    reasoning: `${lead.fundingStage || "Unknown"} stage${extra}`
  };
}
function scoreSignalStrength(signals) {
  if (!signals || signals.signals.length === 0) {
    return { score: 20, reasoning: "No recent signals detected" };
  }
  const strengthMap = { HIGH: 30, MEDIUM: 20, LOW: 10 };
  let totalScore = 0;
  for (const signal of signals.signals) {
    const base = strengthMap[signal.strength];
    totalScore += base * signal.recencyWeight;
  }
  const score = Math.min(100, Math.round(totalScore));
  const topSignal = signals.topSignal;
  const reasoning = topSignal ? `${signals.signals.length} signals found \u2014 top: "${topSignal.title}" (${topSignal.strength}, ${topSignal.recencyDays}d ago)` : `${signals.signals.length} signals found`;
  return { score, reasoning };
}
function scoreLinkedinActivity(signals) {
  const activityScore = signals?.linkedinActivityScore || 0;
  return {
    score: activityScore,
    reasoning: `LinkedIn activity score: ${activityScore}/100`
  };
}
function scoreEngagementHistory(_lead) {
  return {
    score: 50,
    reasoning: "No prior engagement history (new lead)"
  };
}
async function runIntentScorerAgent(lead, signals) {
  const startTime = Date.now();
  sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$7, AGENT_NAME$7, "running");
  try {
    const weights = await loadWeights();
    const dimensionResults = [
      { name: "ICP Fit", result: scoreIcpFit(lead), weight: weights.icpFit },
      { name: "Seniority", result: scoreSeniority(lead), weight: weights.seniority },
      { name: "Geography", result: scoreGeography(lead), weight: weights.geography },
      { name: "Industry Relevance", result: scoreIndustryRelevance(lead), weight: weights.industryRelevance },
      { name: "Company Size", result: scoreCompanySize(lead), weight: weights.companySize },
      { name: "Funding Stage", result: scoreFundingStage(lead), weight: weights.fundingStage },
      { name: "Signal Strength", result: scoreSignalStrength(signals), weight: weights.signalStrength },
      { name: "LinkedIn Activity", result: scoreLinkedinActivity(signals), weight: weights.linkedinActivity },
      { name: "Engagement History", result: scoreEngagementHistory(lead), weight: weights.engagementHistory }
    ];
    const dimensions = dimensionResults.map((d) => ({
      name: d.name,
      rawScore: d.result.score,
      weight: d.weight,
      weightedScore: Math.round(d.result.score * d.weight * 100) / 100,
      reasoning: d.result.reasoning
    }));
    const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
    const rawComposite = dimensions.reduce((sum, d) => sum + d.weightedScore, 0);
    const compositeScore = Math.round(rawComposite / totalWeight);
    let tier;
    if (compositeScore >= 75) tier = "HOT";
    else if (compositeScore >= 55) tier = "WARM";
    else if (compositeScore >= 35) tier = "COOL";
    else tier = "COLD";
    const sorted = [...dimensions].sort((a, b) => b.weightedScore - a.weightedScore);
    const topContributors = sorted.slice(0, 3).map((d) => d.name);
    const intentScore = {
      leadId: lead.id,
      compositeScore,
      tier,
      dimensions,
      topContributors,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await intentScoresCol().insertOne({
      _id: nanoid(),
      leadId: lead.id,
      compositeScore,
      tier,
      dimensions: JSON.stringify(dimensions),
      topContributors: JSON.stringify(topContributors),
      generatedAt: intentScore.generatedAt
    });
    const durationMs = Date.now() - startTime;
    const summary = `Score: ${compositeScore}/100 (${tier}) \u2014 Top: ${topContributors.join(", ")}`;
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$7, AGENT_NAME$7, "complete", summary);
    sseManager.emit("score_update", lead.id, intentScore);
    console.log(`\u2705 Agent 3 complete in ${durationMs}ms \u2014 ${summary}`);
    return intentScore;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$7, AGENT_NAME$7, "error", void 0, errMsg);
    throw error;
  }
}

"use strict";
const AGENT_NUMBER$6 = 4;
const AGENT_NAME$6 = "Persona Analyst";
const SYSTEM_PROMPT = `You are an expert B2B buyer persona analyst. Given a lead's professional details, classify them into EXACTLY ONE of four communication archetypes:

1. "strategic_executive" \u2014 C-level / VP / senior leadership who respond to insight-led, ROI-focused, big-picture messaging. They care about business impact, competitive advantage, and revenue growth.

2. "practitioner" \u2014 Hands-on technical leaders (Engineering Managers, Tech Leads, Senior ICs) who respond to peer-level, problem-specific messaging. They care about technical quality, efficiency, and solving real problems.

3. "innovator" \u2014 Forward-thinking leaders (Heads of Product, Innovation Officers, startup founders) who respond to challenger framing that questions the status quo. They care about disruption, new approaches, and being first-movers.

4. "networker" \u2014 Relationship-oriented leaders (Business Development, Partnerships, Community leads) who respond to relationship-first, low-pressure messaging. They care about mutual value, connections, and long-term partnerships.

Return your analysis as JSON with these exact fields:
{
  "archetype": "strategic_executive" | "practitioner" | "innovator" | "networker",
  "archetypeLabel": "Strategic Executive" | "Practitioner" | "Innovator" | "Networker",
  "confidence": 0.0 to 1.0,
  "traits": ["trait1", "trait2", "trait3"],
  "communicationStyle": "description of how this person prefers to communicate",
  "preferredTone": "description of the ideal messaging tone",
  "avoidInMessaging": ["thing1", "thing2"],
  "reasoning": "one paragraph explaining why this archetype was selected"
}

Return ONLY the JSON, no other text.`;
async function classifyWithLLM(lead) {
  const userMessage = `Classify this lead:
- Name: ${lead.contactName}
- Title: ${lead.contactTitle}
- Seniority: ${lead.seniority || "Unknown"}
- Company: ${lead.companyName}
- Industry: ${lead.industry || "Unknown"}
- Company Size: ${lead.companySize || "Unknown"}
- Funding Stage: ${lead.fundingStage || "Unknown"}
- Headquarters: ${lead.headquarters || "Unknown"}`;
  try {
    const response = await llmGenerateText(SYSTEM_PROMPT, userMessage);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        leadId: lead.id,
        archetype: parsed.archetype,
        archetypeLabel: parsed.archetypeLabel,
        confidence: parsed.confidence,
        traits: parsed.traits,
        communicationStyle: parsed.communicationStyle,
        preferredTone: parsed.preferredTone,
        avoidInMessaging: parsed.avoidInMessaging,
        reasoning: parsed.reasoning,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    return classifyWithRules(lead);
  } catch {
    return classifyWithRules(lead);
  }
}
function classifyWithRules(lead) {
  const title = (lead.contactTitle || "").toLowerCase();
  const seniority = lead.seniority || "";
  let archetype;
  let archetypeLabel;
  let confidence;
  let traits;
  let communicationStyle;
  let preferredTone;
  let avoidInMessaging;
  let reasoning;
  if (seniority === "C-Level" || seniority === "VP" || title.includes("chief") || title.includes("vp ") || title.includes("vice president") || title.includes("head of")) {
    archetype = "strategic_executive";
    archetypeLabel = "Strategic Executive";
    confidence = 0.85;
    traits = ["ROI-focused", "Big-picture thinker", "Time-constrained", "Decision maker"];
    communicationStyle = "Concise, data-backed, outcome-oriented";
    preferredTone = "Insight-led, executive-level, ROI-focused";
    avoidInMessaging = ["Technical jargon", "Feature lists", "Long messages", "Generic pitches"];
    reasoning = `${lead.contactTitle} at ${lead.companyName} is a senior leader (${seniority}). Executives at this level respond best to insight-led messaging that demonstrates ROI and strategic value rather than technical details.`;
  } else if (title.includes("engineer") || title.includes("developer") || title.includes("architect") || title.includes("technical") || title.includes("cto") || seniority === "Director" && title.includes("engineering")) {
    archetype = "practitioner";
    archetypeLabel = "Practitioner";
    confidence = 0.8;
    traits = ["Detail-oriented", "Technically curious", "Problem-solver", "Values efficiency"];
    communicationStyle = "Technical, specific, peer-to-peer";
    preferredTone = "Peer-level, problem-specific, technically credible";
    avoidInMessaging = ["Marketing fluff", "Buzzwords", "Vague claims", "Pressure tactics"];
    reasoning = `${lead.contactTitle} is a technical practitioner who will respond best to peer-level messaging that addresses specific technical challenges and demonstrates credibility.`;
  } else if (title.includes("product") || title.includes("innovation") || title.includes("founder") || title.includes("strategy")) {
    archetype = "innovator";
    archetypeLabel = "Innovator";
    confidence = 0.75;
    traits = ["Forward-thinking", "Risk-tolerant", "Status-quo challenger", "Visionary"];
    communicationStyle = "Bold, thought-provoking, challenging";
    preferredTone = "Challenger framing, questions assumptions, paints a new future";
    avoidInMessaging = ["Conservative language", "Incremental improvements", "Risk-averse framing"];
    reasoning = `${lead.contactTitle} in ${lead.industry || "tech"} is likely an innovator archetype \u2014 they respond to messaging that challenges conventional approaches and paints a vision of what's possible.`;
  } else {
    archetype = "networker";
    archetypeLabel = "Networker";
    confidence = 0.65;
    traits = ["Relationship-oriented", "Community-minded", "Trust-builder", "Collaborative"];
    communicationStyle = "Warm, conversational, mutual-value focused";
    preferredTone = "Relationship-first, low-pressure, mutual benefit";
    avoidInMessaging = ["Hard sells", "Urgency tactics", "Transactional language", "Cold formality"];
    reasoning = `${lead.contactTitle} at ${lead.companyName} is best approached with relationship-first messaging that emphasizes mutual value and long-term partnership.`;
  }
  return {
    leadId: lead.id,
    archetype,
    archetypeLabel,
    confidence,
    traits,
    communicationStyle,
    preferredTone,
    avoidInMessaging,
    reasoning,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function runPersonaAnalystAgent(lead) {
  const startTime = Date.now();
  sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$6, AGENT_NAME$6, "running");
  try {
    let profile;
    if (!config.simulationMode && config.groqApiKey && config.groqApiKey !== "" && config.groqApiKey.length > 10) {
      profile = await classifyWithLLM(lead);
    } else {
      profile = classifyWithRules(lead);
    }
    await personaProfilesCol().insertOne({
      _id: nanoid(),
      leadId: lead.id,
      archetype: profile.archetype,
      archetypeLabel: profile.archetypeLabel,
      confidence: profile.confidence,
      traits: JSON.stringify(profile.traits),
      communicationStyle: profile.communicationStyle,
      preferredTone: profile.preferredTone,
      avoidInMessaging: JSON.stringify(profile.avoidInMessaging),
      reasoning: profile.reasoning,
      generatedAt: profile.generatedAt
    });
    const durationMs = Date.now() - startTime;
    const summary = `Archetype: ${profile.archetypeLabel} (${Math.round(profile.confidence * 100)}% confidence) \u2014 Tone: ${profile.preferredTone.slice(0, 50)}`;
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$6, AGENT_NAME$6, "complete", summary);
    sseManager.emit("score_update", lead.id, {
      agent: AGENT_NAME$6,
      persona: profile
    });
    console.log(`\u2705 Agent 4 complete in ${durationMs}ms \u2014 ${summary}`);
    return profile;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$6, AGENT_NAME$6, "error", void 0, errMsg);
    throw error;
  }
}

"use strict";
const AGENT_NUMBER$5 = 5;
const AGENT_NAME$5 = "Strategy Commander";
function selectPrimaryChannel(lead, signals, intent, persona) {
  const decisions = [];
  const hasLinkedIn = !!lead.contactLinkedIn;
  const linkedInActive = signals.linkedinActivityScore > 40;
  const isExecutive = persona.archetype === "strategic_executive";
  const hasEmail = !!lead.contactEmail;
  const isIndia = (lead.headquarters || "").toLowerCase().includes("india") || (lead.headquarters || "").toLowerCase().includes("bangalore") || (lead.headquarters || "").toLowerCase().includes("mumbai") || (lead.headquarters || "").toLowerCase().includes("delhi") || (lead.headquarters || "").toLowerCase().includes("hyderabad");
  const isHot = intent.tier === "HOT";
  let primary;
  let secondary;
  if (hasLinkedIn && linkedInActive && isExecutive) {
    primary = "linkedin_dm";
    secondary = hasEmail ? "email" : void 0;
    decisions.push({
      decision: "LinkedIn DM as primary channel",
      reasoning: "Executive persona with active LinkedIn presence \u2014 DMs have highest open rates for C-level",
      factors: ["LinkedIn active (score: " + signals.linkedinActivityScore + ")", "Executive archetype", "Has LinkedIn profile"]
    });
  } else if (isIndia && isHot) {
    primary = "whatsapp";
    secondary = hasEmail ? "email" : hasLinkedIn ? "linkedin_dm" : void 0;
    decisions.push({
      decision: "WhatsApp as primary channel",
      reasoning: "India-based HOT lead \u2014 WhatsApp has 95%+ open rates in Indian market",
      factors: ["India geography", "HOT intent (" + intent.compositeScore + ")", "High urgency"]
    });
  } else if (hasEmail) {
    primary = "email";
    secondary = hasLinkedIn ? "linkedin_dm" : void 0;
    decisions.push({
      decision: "Email as primary channel",
      reasoning: "Verified email available \u2014 email provides rich content delivery and tracking",
      factors: ["Verified email", hasLinkedIn ? "LinkedIn as backup" : "No LinkedIn available"]
    });
  } else if (hasLinkedIn) {
    primary = "linkedin_dm";
    secondary = void 0;
    decisions.push({
      decision: "LinkedIn DM as primary (only available channel)",
      reasoning: "No verified email \u2014 LinkedIn is the only reachable channel",
      factors: ["No email available", "Has LinkedIn profile"]
    });
  } else {
    primary = "email";
    decisions.push({
      decision: "Email as fallback primary",
      reasoning: "Limited contact info \u2014 email is the most reliable default",
      factors: ["No LinkedIn found", "Using company domain for outreach"]
    });
  }
  return { primary, secondary, decisions };
}
function selectToneFramework(persona, intent) {
  const toneMap = {
    strategic_executive: "insight_led",
    practitioner: "peer_problem",
    innovator: "challenger",
    networker: "relationship_first"
  };
  let tone = toneMap[persona.archetype] || "insight_led";
  if (intent.tier === "HOT" && intent.compositeScore >= 85) {
    tone = "growth_urgency";
  }
  const toneLabels = {
    insight_led: "Insight-Led (data, ROI, strategic value)",
    peer_problem: "Peer Problem (technical empathy, problem-specific)",
    challenger: "Challenger (question status quo, bold vision)",
    relationship_first: "Relationship-First (mutual value, low-pressure)",
    growth_urgency: "Growth Urgency (time-sensitive opportunity)"
  };
  return {
    tone,
    decision: {
      decision: `Tone: ${toneLabels[tone]}`,
      reasoning: `Based on ${persona.archetypeLabel} persona (${Math.round(persona.confidence * 100)}% confidence) and ${intent.tier} intent`,
      factors: [
        `Persona: ${persona.archetypeLabel}`,
        `Intent: ${intent.tier} (${intent.compositeScore}/100)`,
        `Preferred tone: ${persona.preferredTone}`
      ]
    }
  };
}
function buildCadence(lead, primary, secondary, tone, intent) {
  const hq = (lead.headquarters || "").toLowerCase();
  let timezone = "America/New_York";
  let offsetHours = -4;
  if (hq.includes("india") || hq.includes("bangalore") || hq.includes("mumbai") || hq.includes("delhi") || hq.includes("hyderabad")) {
    timezone = "Asia/Kolkata";
    offsetHours = 5.5;
  } else if (hq.includes("london") || hq.includes("uk")) {
    timezone = "Europe/London";
    offsetHours = 1;
  } else if (hq.includes("berlin") || hq.includes("germany") || hq.includes("europe")) {
    timezone = "Europe/Berlin";
    offsetHours = 2;
  } else if (hq.includes("singapore") || hq.includes("asia")) {
    timezone = "Asia/Singapore";
    offsetHours = 8;
  } else if (hq.includes("san francisco") || hq.includes("sf") || hq.includes("california")) {
    timezone = "America/Los_Angeles";
    offsetHours = -7;
  }
  const now = /* @__PURE__ */ new Date();
  const currentDay = now.getUTCDay();
  let daysUntilTuesday = (2 - currentDay + 7) % 7;
  if (daysUntilTuesday === 0) daysUntilTuesday = 7;
  const sendDate = new Date(now);
  sendDate.setUTCDate(sendDate.getUTCDate() + daysUntilTuesday);
  sendDate.setUTCHours(9 - offsetHours, 30, 0, 0);
  const sendTimestamp = sendDate.toISOString();
  const intervals = {
    HOT: [0, 2, 5],
    // Aggressive: Touch 1, +2 days, +5 days
    WARM: [0, 3, 7],
    // Moderate
    COOL: [0, 5, 12],
    // Patient
    COLD: [0, 7, 14]
    // Very patient
  };
  const [d1, d2, d3] = intervals[intent.tier] || intervals.WARM;
  const touch1Date = new Date(sendDate);
  const touch2Date = new Date(sendDate);
  touch2Date.setUTCDate(touch2Date.getUTCDate() + d2);
  const touch3Date = new Date(sendDate);
  touch3Date.setUTCDate(touch3Date.getUTCDate() + d3);
  const cadence = [
    {
      touchNumber: 1,
      channel: primary,
      scheduledAt: touch1Date.toISOString(),
      dayOffset: d1,
      toneFramework: tone
    },
    {
      touchNumber: 2,
      channel: secondary || primary,
      // Switch channel if available
      scheduledAt: touch2Date.toISOString(),
      dayOffset: d2,
      toneFramework: tone
    },
    {
      touchNumber: 3,
      channel: primary,
      // Return to primary for final touch
      scheduledAt: touch3Date.toISOString(),
      dayOffset: d3,
      toneFramework: tone
    }
  ];
  return {
    cadence,
    sendTimestamp,
    timezone,
    decision: {
      decision: `3-touch cadence over ${d3} days (${intent.tier} tempo)`,
      reasoning: `${intent.tier} leads need ${intent.tier === "HOT" ? "aggressive" : "measured"} follow-up pacing`,
      factors: [
        `Touch 1: ${primary} Day 0`,
        `Touch 2: ${secondary || primary} Day +${d2}`,
        `Touch 3: ${primary} Day +${d3}`,
        `Timezone: ${timezone}`,
        `First send: ${sendTimestamp}`
      ]
    }
  };
}
async function runStrategyCommanderAgent(lead, signals, intent, persona) {
  const startTime = Date.now();
  sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$5, AGENT_NAME$5, "running");
  try {
    const { primary, secondary, decisions: channelDecisions } = selectPrimaryChannel(lead, signals, intent, persona);
    const { tone, decision: toneDecision } = selectToneFramework(persona, intent);
    const { cadence, sendTimestamp, timezone, decision: cadenceDecision } = buildCadence(
      lead,
      primary,
      secondary,
      tone,
      intent
    );
    const allDecisions = [...channelDecisions, toneDecision, cadenceDecision];
    const strategy = {
      leadId: lead.id,
      primaryChannel: primary,
      secondaryChannel: secondary,
      sendTimestamp,
      timezone,
      toneFramework: tone,
      cadence,
      decisions: allDecisions,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await strategiesCol().insertOne({
      _id: nanoid(),
      leadId: lead.id,
      primaryChannel: strategy.primaryChannel,
      secondaryChannel: strategy.secondaryChannel,
      sendTimestamp: strategy.sendTimestamp,
      timezone: strategy.timezone,
      toneFramework: strategy.toneFramework,
      cadence: JSON.stringify(strategy.cadence),
      decisions: JSON.stringify(strategy.decisions),
      generatedAt: strategy.generatedAt
    });
    const durationMs = Date.now() - startTime;
    const summary = `${primary}${secondary ? " + " + secondary : ""} | ${tone} | ${cadence.length}-touch over ${cadence[cadence.length - 1].dayOffset}d`;
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$5, AGENT_NAME$5, "complete", summary);
    sseManager.emit("strategy_update", lead.id, strategy);
    console.log(`\u2705 Agent 5 complete in ${durationMs}ms \u2014 ${summary}`);
    return strategy;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$5, AGENT_NAME$5, "error", void 0, errMsg);
    throw error;
  }
}

"use strict";
const AGENT_NUMBER$4 = 6;
const AGENT_NAME$4 = "Content Forge";
const TONE_GUIDES = {
  insight_led: `Insight-Led: Lead with a data point or industry insight the recipient hasn't considered. Frame your product as the answer to a strategic shift. Be concise, executive-level, ROI-focused.`,
  peer_problem: `Peer Problem: Speak as a technical peer who understands their specific pain. Reference concrete technical challenges. Be specific, credible, jargon-appropriate but not salesy.`,
  challenger: `Challenger: Question the status quo. Present a bold, slightly provocative perspective on their industry. Make them think differently. Be confident, visionary, not arrogant.`,
  relationship_first: `Relationship-First: Build rapport before pitching. Find genuine common ground. Be warm, conversational, zero-pressure. Focus on mutual value and long-term relationship.`,
  growth_urgency: `Growth Urgency: This is a time-sensitive opportunity. The lead is very hot \u2014 act with appropriate urgency without being desperate. Highlight competitive advantage and market timing.`
};
const CHANNEL_GUIDES = {
  linkedin_dm: {
    maxLength: 300,
    format: "Short, conversational, no subject line. Max 300 chars. Personal and direct. No HTML."
  },
  email: {
    maxLength: 800,
    format: "Professional email with clear subject line. 3-5 short paragraphs max. Include a specific CTA. Plain text preferred."
  },
  whatsapp: {
    maxLength: 200,
    format: "Ultra-short, mobile-friendly. Max 200 chars. Casual but professional. Use line breaks. No HTML."
  }
};
function buildContentPrompt(lead, signals, intent, persona, strategy, touchNumber, channel) {
  const toneGuide = TONE_GUIDES[strategy.toneFramework];
  const channelGuide = CHANNEL_GUIDES[channel];
  const topSignal = signals.topSignal ? `Their top signal: "${signals.topSignal.title}" (${signals.topSignal.category}, ${signals.topSignal.strength} strength)` : "No recent signals detected";
  const touchGuide = touchNumber === 1 ? "This is the FIRST touch \u2014 introduce yourself and the value proposition. Hook with an insight." : touchNumber === 2 ? "This is the SECOND touch (follow-up). Reference the first message briefly. Add new value \u2014 share a relevant case study, data point, or resource." : "This is the THIRD and FINAL touch. Create gentle urgency. Offer a concrete next step (e.g. '15-min call this Thursday?'). Make it easy to say yes or no.";
  return `Generate a ${channel === "email" ? "sales email" : channel === "linkedin_dm" ? "LinkedIn DM" : "WhatsApp message"} for this outreach:

TARGET:
- Name: ${lead.contactName}
- Title: ${lead.contactTitle} at ${lead.companyName}
- Industry: ${lead.industry || "Technology"}
- Company Size: ${lead.companySize || "Unknown"}
- Seniority: ${lead.seniority || "Unknown"}
- ${topSignal}

PERSONA: ${persona.archetypeLabel}
- Communication style: ${persona.communicationStyle}
- Avoid: ${persona.avoidInMessaging.join(", ")}

SCORING: ${intent.tier} (${intent.compositeScore}/100)
- Top factors: ${intent.topContributors.join(", ")}

TONE FRAMEWORK:
${toneGuide}

CHANNEL CONSTRAINTS:
${channelGuide.format}
Max length: ${channelGuide.maxLength} characters

TOUCH:
${touchGuide}

${channel === "email" ? "Return as:\nSUBJECT: <subject line>\n\n<email body>" : "Return ONLY the message body, no labels."}

Important: Do NOT use placeholder brackets like [Company] or [Name]. Use the actual values provided. Be specific and genuine.`;
}
async function generateTouchContent(lead, signals, intent, persona, strategy, touchNumber, channel) {
  const prompt = buildContentPrompt(lead, signals, intent, persona, strategy, touchNumber, channel);
  const systemPrompt = `You are an elite B2B copywriter who writes hyper-personalized outreach messages. Every message must feel hand-crafted, not templated. Never use generic phrases like "I hope this finds you well" or "I wanted to reach out". Be specific, concise, and human.`;
  const response = await llmGenerateText(systemPrompt, prompt);
  let subject;
  let body;
  if (channel === "email") {
    const subjectMatch = response.match(/SUBJECT:\s*(.+?)(?:\n|$)/i);
    subject = subjectMatch ? subjectMatch[1].trim() : `Quick note for ${lead.contactName}`;
    body = response.replace(/SUBJECT:\s*.+?\n/i, "").trim();
  } else {
    body = response.trim();
  }
  const maxLen = CHANNEL_GUIDES[channel].maxLength;
  if (body.length > maxLen * 1.5) {
    body = body.slice(0, maxLen) + "...";
  }
  return {
    touchNumber,
    channel,
    subject,
    body,
    preview: body.slice(0, 100)
  };
}
async function generateLinkedInPost(lead, signals, persona) {
  const systemPrompt = `You are a LinkedIn thought-leadership ghostwriter. Write posts that get engagement from B2B decision-makers. Posts should be 150-200 words, use short paragraphs, and end with a question or CTA.`;
  const prompt = `Write a LinkedIn post that would resonate with ${lead.contactTitle}s in the ${lead.industry || "tech"} industry. Topic should relate to: ${signals.topSignal?.title || "industry trends"}. The reader is a ${persona.archetypeLabel} archetype who values ${persona.traits.slice(0, 2).join(" and ")}.

Write as if YOU are posting (first person). The post should position the reader's company type as innovative. Do NOT mention any specific product or company name. Keep it to 150-200 words.`;
  return llmGenerateText(systemPrompt, prompt);
}
async function generateHeadlineSuggestion(lead, persona) {
  const systemPrompt = `You suggest LinkedIn headline improvements for B2B professionals. Headlines should be value-oriented, specific, and under 120 characters.`;
  const prompt = `Suggest a LinkedIn headline for someone who wants to appeal to ${persona.archetypeLabel} personas like ${lead.contactTitle}s. Current context: selling to ${lead.industry || "technology"} companies. Return ONLY the headline text, nothing else.`;
  return llmGenerateText(systemPrompt, prompt);
}
function simulateContent(lead, strategy, persona, intent) {
  const touches = strategy.cadence.map((tp) => {
    const isEmail = tp.channel === "email";
    const isLinkedIn = tp.channel === "linkedin_dm";
    const templates = {
      email: {
        1: {
          subject: `${lead.companyName}'s ${lead.industry || "growth"} trajectory \u2014 quick thought`,
          body: `Hi ${lead.contactName},

I noticed ${lead.companyName} has been making moves in ${lead.industry || "the industry"} \u2014 ${intent.tier === "HOT" ? "particularly impressive" : "interesting to see"} given the current market dynamics.

${persona.archetype === "strategic_executive" ? "From a strategic perspective" : persona.archetype === "practitioner" ? "From a technical standpoint" : "Looking at the bigger picture"}, there's an angle I think could accelerate what your team is building.

Worth a 15-minute conversation this week?

Best,
Alex from NERVE`
        },
        2: {
          subject: `Re: Following up \u2014 ${lead.companyName}`,
          body: `Hi ${lead.contactName},

Wanted to share a quick data point: companies similar to ${lead.companyName} in ${lead.industry || "your space"} saw 40% improvement in outreach efficiency after optimizing their approach.

I put together a brief analysis specific to your situation. Happy to walk through it in 10 minutes.

Cheers,
Alex from NERVE`
        },
        3: {
          subject: `Last note \u2014 ${lead.contactName}`,
          body: `Hi ${lead.contactName},

I'll keep this short \u2014 I genuinely think there's mutual value in connecting, but I respect your time.

If the timing isn't right, no worries at all. If it is, here's my Calendly: calendly.com/nerve-demo

Either way, wishing ${lead.companyName} continued success.

Best,
Alex from NERVE`
        }
      },
      linkedin_dm: {
        1: { body: `Hey ${lead.contactName} \u{1F44B} Saw ${lead.companyName} is ${intent.tier === "HOT" ? "crushing it" : "making moves"} in ${lead.industry || "the space"}. ${persona.archetype === "strategic_executive" ? "Your leadership approach caught my eye." : "The technical work your team is doing is impressive."} Would love to connect and share a thought.` },
        2: { body: `Hi ${lead.contactName}, following up \u2014 I came across something specific to ${lead.companyName}'s situation that I think you'd find valuable. Mind if I share a quick insight?` },
        3: { body: `${lead.contactName} \u2014 last ping, promise! \u{1F604} Open to a quick 10-min chat this week? If not, totally understand. Here either way.` }
      },
      whatsapp: {
        1: { body: `Hi ${lead.contactName}! \u{1F44B}

Quick one \u2014 saw ${lead.companyName}'s recent ${lead.industry || "growth"} moves. Have a relevant insight to share.

Open to a quick chat?` },
        2: { body: `Hey ${lead.contactName} \u{1F44B}

Following up \u2014 put together a brief analysis for ${lead.companyName}. Worth 5 mins?` },
        3: { body: `Hi ${lead.contactName} \u2014 final note! Open to connecting this week?

No pressure either way \u{1F64F}` }
      }
    };
    const channelKey = tp.channel === "linkedin_dm" ? "linkedin_dm" : tp.channel;
    const template = templates[channelKey]?.[tp.touchNumber] || { body: `Hi ${lead.contactName}, reaching out regarding ${lead.companyName}.` };
    return {
      touchNumber: tp.touchNumber,
      channel: tp.channel,
      subject: template.subject,
      body: template.body,
      preview: template.body.slice(0, 100)
    };
  });
  return {
    leadId: lead.id,
    touches,
    linkedinPost: `\u{1F680} The ${lead.industry || "B2B"} landscape is shifting.

Companies that adapt their outreach strategy now will have a 6-month head start.

Here's what I'm seeing:

1. Personalization at scale isn't optional anymore
2. Multi-channel beats single-channel 3x
3. AI-driven signals > gut feelings

The teams winning right now? They're the ones treating outreach as a product, not a task.

What's the biggest shift you've seen in how your buyers want to be reached?

#B2B #SalesStrategy #OutreachInnovation`,
    linkedinHeadlineSuggestion: `Helping ${lead.industry || "B2B"} teams turn cold outreach into warm conversations | AI-Powered Personalization`,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function runContentForgeAgent(lead, signals, intent, persona, strategy) {
  const startTime = Date.now();
  sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$4, AGENT_NAME$4, "running");
  try {
    let content;
    const hasLlmKey = !!(config.groqApiKey && config.groqApiKey.length > 10);
    const isSimulated = !hasLlmKey || config.simulationMode;
    if (isSimulated) {
      content = simulateContent(lead, strategy, persona, intent);
    } else {
      const touchPromises = strategy.cadence.map(
        (tp) => generateTouchContent(lead, signals, intent, persona, strategy, tp.touchNumber, tp.channel)
      );
      const [touches, linkedinPost, headlineSuggestion] = await Promise.all([
        Promise.all(touchPromises),
        generateLinkedInPost(lead, signals, persona).catch(() => void 0),
        generateHeadlineSuggestion(lead, persona).catch(() => void 0)
      ]);
      content = {
        leadId: lead.id,
        touches,
        linkedinPost: linkedinPost || void 0,
        linkedinHeadlineSuggestion: headlineSuggestion || void 0,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    for (const touch of content.touches) {
      await generatedContentCol().insertOne({
        _id: nanoid(),
        leadId: lead.id,
        touchNumber: touch.touchNumber,
        channel: touch.channel,
        subject: touch.subject || null,
        body: touch.body,
        preview: touch.preview,
        generatedAt: content.generatedAt
      });
    }
    const durationMs = Date.now() - startTime;
    const summary = `${content.touches.length} touches generated | ${content.touches.map((t) => `T${t.touchNumber}:${t.channel}`).join(", ")}${content.linkedinPost ? " + LI post" : ""}`;
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$4, AGENT_NAME$4, "complete", summary);
    sseManager.emit("content_update", lead.id, content);
    console.log(`\u2705 Agent 6 complete in ${durationMs}ms \u2014 ${summary}`);
    return content;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$4, AGENT_NAME$4, "error", void 0, errMsg);
    throw error;
  }
}

"use strict";
const AGENT_NUMBER$3 = 7;
const AGENT_NAME$3 = "Explainer";
async function buildAgentGraph(leadId) {
  const runs = await agentRunsCol().find({ leadId }).toArray();
  const runMap = new Map(runs.map((r) => [r.agentNumber, r]));
  const agentDefs = [
    { num: 1, name: "Lead Ingestion", id: "agent-1" },
    { num: 2, name: "Signal Scout", id: "agent-2" },
    { num: 3, name: "Intent Scorer", id: "agent-3" },
    { num: 4, name: "Persona Analyst", id: "agent-4" },
    { num: 5, name: "Strategy Commander", id: "agent-5" },
    { num: 6, name: "Content Forge", id: "agent-6" },
    { num: 7, name: "Explainer", id: "agent-7" },
    { num: 8, name: "Delivery Agent", id: "agent-8" },
    { num: 9, name: "Response Monitor", id: "agent-9" },
    { num: 10, name: "Learning Loop", id: "agent-10" }
  ];
  const nodes = agentDefs.map((def) => {
    const run = runMap.get(def.num);
    return {
      agentId: def.id,
      agentName: def.name,
      agentNumber: def.num,
      status: run ? run.status : "idle",
      startedAt: run?.startedAt || void 0,
      completedAt: run?.completedAt || void 0,
      outputSummary: run?.output ? summarizeOutput(def.num, run.output) : void 0,
      error: run?.error || void 0
    };
  });
  const edges = [
    { from: "agent-1", to: "agent-2", animated: true, dataFlowing: !!runMap.get(2) },
    { from: "agent-1", to: "agent-3", animated: true, dataFlowing: !!runMap.get(3) },
    { from: "agent-1", to: "agent-4", animated: true, dataFlowing: !!runMap.get(4) },
    { from: "agent-2", to: "agent-5", animated: true, dataFlowing: !!runMap.get(5) },
    { from: "agent-3", to: "agent-5", animated: true, dataFlowing: !!runMap.get(5) },
    { from: "agent-4", to: "agent-5", animated: true, dataFlowing: !!runMap.get(5) },
    { from: "agent-5", to: "agent-6", animated: true, dataFlowing: !!runMap.get(6) },
    { from: "agent-5", to: "agent-7", animated: true, dataFlowing: !!runMap.get(7) },
    { from: "agent-6", to: "agent-8", animated: true, dataFlowing: !!runMap.get(8) },
    { from: "agent-7", to: "agent-8", animated: true, dataFlowing: !!runMap.get(8) },
    { from: "agent-8", to: "agent-9", animated: true, dataFlowing: !!runMap.get(9) },
    { from: "agent-9", to: "agent-10", animated: true, dataFlowing: !!runMap.get(10) }
  ];
  return { nodes, edges };
}
function summarizeOutput(agentNumber, outputJson) {
  try {
    const data = JSON.parse(outputJson);
    switch (agentNumber) {
      case 1:
        return `Enriched: ${data.companyName} \u2014 ${data.contactName}`;
      case 2:
        return `${data.signals?.length || 0} signals, top: ${data.topSignal?.title?.slice(0, 40) || "none"}`;
      case 3:
        return `Score: ${data.compositeScore}/100 (${data.tier})`;
      case 4:
        return `${data.archetypeLabel} (${Math.round((data.confidence || 0) * 100)}%)`;
      case 5:
        return `${data.primaryChannel} | ${data.toneFramework}`;
      case 6:
        return `${data.touches?.length || 0} touches generated`;
      case 8:
        return `Delivered: ${data.status || "pending"}`;
      case 9:
        return `Sentiment: ${data.sentiment || "pending"}`;
      case 10:
        return `${data.weightUpdates?.length || 0} weight updates`;
      default:
        return "Completed";
    }
  } catch {
    return "Completed";
  }
}
function buildRationale(lead, signals, intent, persona, strategy, content) {
  const items = [];
  items.push({
    agentName: "Lead Ingestion",
    decision: `Enriched ${lead.companyName} \u2014 ${lead.contactName} (${lead.contactTitle})`,
    explanation: `We pulled data on ${lead.companyName} from Apollo.io and identified ${lead.contactName} as the primary contact. ${lead.companySize ? `The company is ${lead.companySize} employees` : "Company size unknown"}${lead.fundingStage ? `, at ${lead.fundingStage} stage` : ""}${lead.industry ? `, operating in ${lead.industry}` : ""}.`,
    confidence: 0.95
  });
  items.push({
    agentName: "Signal Scout",
    decision: signals.topSignal ? `Found ${signals.signals.length} signals \u2014 strongest: "${signals.topSignal.title}"` : "No strong signals detected",
    explanation: signals.topSignal ? `We scanned the web for recent activity from ${lead.companyName}. The strongest signal is "${signals.topSignal.title}" (${signals.topSignal.strength} strength, ${signals.topSignal.recencyDays} days ago). ${signals.signals.length > 1 ? `We also found ${signals.signals.length - 1} additional signals.` : ""} Their LinkedIn activity score is ${signals.linkedinActivityScore}/100.` : `No significant recent signals found for ${lead.companyName}. LinkedIn activity score is ${signals.linkedinActivityScore}/100.`,
    confidence: signals.topSignal ? 0.85 : 0.5
  });
  items.push({
    agentName: "Intent Scorer",
    decision: `Score: ${intent.compositeScore}/100 \u2014 ${intent.tier} lead`,
    explanation: `Using our 9-dimension weighted scoring model, ${lead.contactName} scored ${intent.compositeScore}/100, placing them in the ${intent.tier} tier. The top scoring factors were: ${intent.topContributors.join(", ")}. ${intent.tier === "HOT" ? "This is a high-priority lead that should be contacted quickly." : intent.tier === "WARM" ? "This lead shows solid potential and is worth pursuing." : intent.tier === "COOL" ? "This lead has some potential but may need more nurturing." : "This lead currently shows low intent \u2014 consider nurturing over time."}`,
    confidence: 0.9
  });
  items.push({
    agentName: "Persona Analyst",
    decision: `${persona.archetypeLabel} archetype (${Math.round(persona.confidence * 100)}% confidence)`,
    explanation: `We classified ${lead.contactName} as a "${persona.archetypeLabel}" based on their title (${lead.contactTitle}), seniority (${lead.seniority || "unknown"}), and industry context. ${persona.reasoning} This means we should use a ${persona.preferredTone} approach and avoid ${persona.avoidInMessaging.slice(0, 2).join(" and ")}.`,
    confidence: persona.confidence
  });
  items.push({
    agentName: "Strategy Commander",
    decision: `Channel: ${strategy.primaryChannel}${strategy.secondaryChannel ? " + " + strategy.secondaryChannel : ""} | Tone: ${strategy.toneFramework}`,
    explanation: strategy.decisions.map((d) => `${d.decision}: ${d.reasoning}`).join(" "),
    confidence: 0.85
  });
  items.push({
    agentName: "Content Forge",
    decision: `Generated ${content.touches.length}-touch cadence${content.linkedinPost ? " + LinkedIn post" : ""}`,
    explanation: `We crafted ${content.touches.length} personalized messages: ${content.touches.map((t) => `Touch ${t.touchNumber} via ${t.channel}`).join(", ")}. Each message was tailored to the ${persona.archetypeLabel} persona using the ${strategy.toneFramework.replace(/_/g, " ")} framework.${content.linkedinPost ? " A LinkedIn thought-leadership post was also generated to warm up the relationship." : ""}`,
    confidence: 0.8
  });
  return items;
}
async function generateSummary(lead, rationale, intent, strategy) {
  const { config } = await Promise.resolve().then(function () { return config$1; });
  if (config.simulationMode) {
    return `We're reaching ${lead.contactName} at ${lead.companyName} via ${strategy.primaryChannel} using a ${strategy.toneFramework.replace(/_/g, " ")} approach. They scored ${intent.compositeScore}/100 (${intent.tier}), making them ${intent.tier === "HOT" ? "a high-priority target for immediate outreach" : intent.tier === "WARM" ? "a solid prospect worth engaging" : "a lead to nurture carefully"}. The ${strategy.cadence.length}-touch cadence will unfold over ${strategy.cadence[strategy.cadence.length - 1]?.dayOffset || 7} days.`;
  }
  const systemPrompt = `You are a sales strategy advisor explaining AI-driven outreach decisions to a human operator. Write in plain English, 2-3 sentences max. Be specific, not generic.`;
  const userMessage = `Summarize the outreach plan for ${lead.contactName} (${lead.contactTitle} at ${lead.companyName}):
- Intent: ${intent.tier} (${intent.compositeScore}/100)
- Channel: ${strategy.primaryChannel}
- Tone: ${strategy.toneFramework}
- Touches: ${strategy.cadence.length} over ${strategy.cadence[strategy.cadence.length - 1]?.dayOffset || 7} days

Write a 2-3 sentence executive summary of why we're reaching out to this person, through this channel, in this way.`;
  const response = await llmGenerateText(systemPrompt, userMessage);
  if (response.startsWith("[SIMULATED]") || response.startsWith("[QUOTA_EXCEEDED]")) {
    return `We're reaching ${lead.contactName} at ${lead.companyName} via ${strategy.primaryChannel} using a ${strategy.toneFramework.replace(/_/g, " ")} approach. They scored ${intent.compositeScore}/100 (${intent.tier}), making them ${intent.tier === "HOT" ? "a high-priority target for immediate outreach" : intent.tier === "WARM" ? "a solid prospect worth engaging" : "a lead to nurture carefully"}. The ${strategy.cadence.length}-touch cadence will unfold over ${strategy.cadence[strategy.cadence.length - 1]?.dayOffset || 7} days.`;
  }
  return response;
}
async function runExplainerAgent(lead, signals, intent, persona, strategy, content) {
  const startTime = Date.now();
  sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$3, AGENT_NAME$3, "running");
  try {
    const explanations = buildRationale(lead, signals, intent, persona, strategy, content);
    const graphData = await buildAgentGraph(lead.id);
    const summary = await generateSummary(lead, explanations, intent, strategy);
    const rationale = {
      leadId: lead.id,
      explanations,
      summary,
      graphData,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const durationMs = Date.now() - startTime;
    const outputSummary = `${explanations.length} rationale items | ${graphData.nodes.filter((n) => n.status === "complete").length}/${graphData.nodes.length} agents complete`;
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$3, AGENT_NAME$3, "complete", outputSummary);
    sseManager.emit("rationale_update", lead.id, rationale);
    console.log(`\u2705 Agent 7 complete in ${durationMs}ms \u2014 ${outputSummary}`);
    return rationale;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$3, AGENT_NAME$3, "error", void 0, errMsg);
    throw error;
  }
}

"use strict";
const AGENT_NUMBER$2 = 8;
const AGENT_NAME$2 = "Delivery Agent";
async function sendViaResend(lead, touch) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (config.simulationMode || !config.resendApiKey) {
    return simulateDelivery(lead.id, touch.touchNumber, "email", "Email simulated \u2014 Resend");
  }
  try {
    const toEmail = lead.contactEmail || `${lead.contactName.toLowerCase().replace(/\s+/g, ".")}@${lead.companyDomain || "example.com"}`;
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        // Resend's free-tier verified sender
        to: [toEmail],
        subject: touch.subject || `Quick note for ${lead.contactName}`,
        html: touch.body.replace(/\n/g, "<br>")
      })
    });
    const data = await response.json();
    if (response.ok && data.id) {
      return {
        leadId: lead.id,
        touchNumber: touch.touchNumber,
        channel: "email",
        status: "sent",
        messageId: data.id,
        sentAt: now,
        simulationMode: false,
        rawApiResponse: data
      };
    }
    console.warn(`Resend API error: ${response.status} \u2014 ${data.message || "unknown"}`);
    return {
      leadId: lead.id,
      touchNumber: touch.touchNumber,
      channel: "email",
      status: "failed",
      sentAt: now,
      simulationMode: false,
      rawApiResponse: data
    };
  } catch (error) {
    console.warn("Resend delivery error:", error);
    return {
      leadId: lead.id,
      touchNumber: touch.touchNumber,
      channel: "email",
      status: "failed",
      sentAt: now,
      simulationMode: false,
      rawApiResponse: { error: String(error) }
    };
  }
}
async function sendViaHeyReach(lead, touch) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (config.simulationMode || !config.heyreachApiKey) {
    return simulateDelivery(lead.id, touch.touchNumber, "linkedin_dm", "LinkedIn DM simulated \u2014 HeyReach");
  }
  try {
    const campaignsRes = await fetch("https://api.heyreach.io/api/public/campaign/getall", {
      method: "POST",
      headers: {
        "X-API-KEY": config.heyreachApiKey,
        "Content-Type": "application/json"
      },
      body: "{}"
    });
    const campaignsData = await campaignsRes.json();
    if (!campaignsRes.ok || campaignsData.totalCount === 0) {
      console.warn("HeyReach: No campaigns found. Create a campaign at app.heyreach.io first.");
      return {
        leadId: lead.id,
        touchNumber: touch.touchNumber,
        channel: "linkedin_dm",
        status: "queued",
        sentAt: now,
        simulationMode: false,
        rawApiResponse: { note: "No HeyReach campaigns configured \u2014 message queued for manual send" }
      };
    }
    const campaignId = campaignsData.items[0].id;
    const linkedInUrl = lead.contactLinkedIn || `https://linkedin.com/in/${lead.contactName.toLowerCase().replace(/\s+/g, "-")}`;
    const addRes = await fetch("https://api.heyreach.io/api/public/campaign/AddLeadsToCampaign", {
      method: "POST",
      headers: {
        "X-API-KEY": config.heyreachApiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        campaignId,
        AccountLeadPairs: [
          {
            leads: [
              {
                linkedInUrl,
                firstName: lead.contactName.split(" ")[0],
                lastName: lead.contactName.split(" ").slice(1).join(" ") || "",
                companyName: lead.companyName,
                title: lead.contactTitle
              }
            ]
          }
        ]
      })
    });
    const addData = await addRes.json();
    if (addRes.ok) {
      return {
        leadId: lead.id,
        touchNumber: touch.touchNumber,
        channel: "linkedin_dm",
        status: "queued",
        messageId: `heyreach-${campaignId}-${nanoid(6)}`,
        sentAt: now,
        simulationMode: false,
        rawApiResponse: addData
      };
    }
    console.warn(`HeyReach API error: ${addRes.status}`, addData);
    return {
      leadId: lead.id,
      touchNumber: touch.touchNumber,
      channel: "linkedin_dm",
      status: "failed",
      sentAt: now,
      simulationMode: false,
      rawApiResponse: addData
    };
  } catch (error) {
    console.warn("HeyReach delivery error:", error);
    return {
      leadId: lead.id,
      touchNumber: touch.touchNumber,
      channel: "linkedin_dm",
      status: "failed",
      sentAt: now,
      simulationMode: false,
      rawApiResponse: { error: String(error) }
    };
  }
}
async function sendViaAisensy(lead, touch) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (config.simulationMode || !config.aisensyApiKey) {
    return simulateDelivery(lead.id, touch.touchNumber, "whatsapp", "WhatsApp simulated \u2014 AiSensy");
  }
  try {
    const phone = lead.contactPhone || "";
    if (!phone) {
      return {
        leadId: lead.id,
        touchNumber: touch.touchNumber,
        channel: "whatsapp",
        status: "failed",
        sentAt: now,
        simulationMode: false,
        rawApiResponse: { error: "No phone number available" }
      };
    }
    const response = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        apiKey: config.aisensyApiKey,
        campaignName: `NERVE-Touch-${touch.touchNumber}-${nanoid(4)}`,
        destination: phone,
        userName: lead.contactName,
        templateParams: [touch.body.slice(0, 1024)],
        source: "NERVE Engine",
        media: {}
      })
    });
    const data = await response.json();
    if (response.ok) {
      return {
        leadId: lead.id,
        touchNumber: touch.touchNumber,
        channel: "whatsapp",
        status: "sent",
        messageId: `aisensy-${nanoid(8)}`,
        sentAt: now,
        simulationMode: false,
        rawApiResponse: data
      };
    }
    return {
      leadId: lead.id,
      touchNumber: touch.touchNumber,
      channel: "whatsapp",
      status: "failed",
      sentAt: now,
      simulationMode: false,
      rawApiResponse: data
    };
  } catch (error) {
    console.warn("AiSensy delivery error:", error);
    return {
      leadId: lead.id,
      touchNumber: touch.touchNumber,
      channel: "whatsapp",
      status: "failed",
      sentAt: now,
      simulationMode: false,
      rawApiResponse: { error: String(error) }
    };
  }
}
function simulateDelivery(leadId, touchNumber, channel, note) {
  return {
    leadId,
    touchNumber,
    channel,
    status: "simulated",
    messageId: `sim-${channel}-${nanoid(8)}`,
    sentAt: (/* @__PURE__ */ new Date()).toISOString(),
    simulationMode: true,
    rawApiResponse: {
      note,
      simulatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      wouldHaveSent: true
    }
  };
}
async function deliverTouch(lead, touch) {
  switch (touch.channel) {
    case "email":
      return sendViaResend(lead, touch);
    case "linkedin_dm":
      return sendViaHeyReach(lead, touch);
    case "whatsapp":
      return sendViaAisensy(lead, touch);
    default:
      return simulateDelivery(lead.id, touch.touchNumber, touch.channel, "Unknown channel");
  }
}
async function runDeliveryAgent(lead, strategy, content) {
  const startTime = Date.now();
  sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$2, AGENT_NAME$2, "running");
  try {
    const results = [];
    for (const touch of content.touches) {
      let result;
      if (touch.touchNumber === 1) {
        result = await deliverTouch(lead, touch);
      } else {
        result = {
          leadId: lead.id,
          touchNumber: touch.touchNumber,
          channel: touch.channel,
          status: config.simulationMode ? "simulated" : "queued",
          messageId: `queued-t${touch.touchNumber}-${nanoid(6)}`,
          sentAt: (/* @__PURE__ */ new Date()).toISOString(),
          simulationMode: config.simulationMode,
          rawApiResponse: {
            note: `Touch ${touch.touchNumber} scheduled for Day +${strategy.cadence.find((c) => c.touchNumber === touch.touchNumber)?.dayOffset || "?"}`,
            scheduledAt: strategy.cadence.find((c) => c.touchNumber === touch.touchNumber)?.scheduledAt
          }
        };
      }
      await deliveryLogsCol().insertOne({
        _id: nanoid(),
        leadId: lead.id,
        touchNumber: result.touchNumber,
        channel: result.channel,
        status: result.status,
        messageId: result.messageId || null,
        sentAt: result.sentAt,
        simulationMode: result.simulationMode,
        rawResponse: JSON.stringify(result.rawApiResponse)
      });
      results.push(result);
      sseManager.emit("delivery_update", lead.id, result);
    }
    const durationMs = Date.now() - startTime;
    const sentCount = results.filter((r) => r.status === "sent" || r.status === "simulated").length;
    const queuedCount = results.filter((r) => r.status === "queued").length;
    const failedCount = results.filter((r) => r.status === "failed").length;
    const summary = `${sentCount} sent, ${queuedCount} queued, ${failedCount} failed | ${config.simulationMode ? "SIMULATION" : "LIVE"}`;
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$2, AGENT_NAME$2, "complete", summary);
    console.log(`\u2705 Agent 8 complete in ${durationMs}ms \u2014 ${summary}`);
    return results;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER$2, AGENT_NAME$2, "error", void 0, errMsg);
    throw error;
  }
}

"use strict";
const AGENT_NUMBER$1 = 9;
const AGENT_NAME$1 = "Response Monitor";
const SENTIMENT_SYSTEM_PROMPT = `You are an NLP sentiment classifier for B2B sales responses. Classify the response into EXACTLY one category:

- "positive": Interested, wants to learn more, agrees to meeting, asks follow-up questions, thanks for reaching out
- "neutral": Acknowledges but non-committal, asks to follow up later, "let me think about it", auto-replies
- "negative": Explicit rejection, "not interested", "remove me", hostile tone, "do not contact"
- "no_reply": Use this only when explicitly told there was no response

Also determine the recommended next action:
- "escalate_human": For positive responses \u2014 hand off to a human sales rep
- "continue_cadence": For neutral responses \u2014 proceed with next touch
- "cancel_sequence": For negative responses \u2014 stop all outreach, mark as do-not-contact
- "nurture": For no-reply \u2014 add to long-term nurture sequence

Return as JSON:
{
  "sentiment": "positive" | "neutral" | "negative" | "no_reply",
  "reasoning": "one sentence explaining the classification",
  "action": "escalate_human" | "continue_cadence" | "cancel_sequence" | "nurture"
}

Return ONLY the JSON.`;
async function classifySentimentLLM(messageBody) {
  try {
    const response = await llmGenerateText(SENTIMENT_SYSTEM_PROMPT, `Classify this response:

"${messageBody}"`);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
  } catch {
  }
  return classifySentimentKeywords(messageBody);
}
function classifySentimentKeywords(messageBody) {
  const text = messageBody.toLowerCase();
  const negativePatterns = [
    /not interested/i,
    /no thanks/i,
    /remove me/i,
    /unsubscribe/i,
    /stop (contacting|emailing|messaging)/i,
    /do not contact/i,
    /please don't/i,
    /not (?:a )?good (?:fit|time)/i,
    /f[*u]ck off/i,
    /leave me alone/i
  ];
  for (const pattern of negativePatterns) {
    if (pattern.test(text)) {
      return {
        sentiment: "negative",
        reasoning: `Matched negative pattern: "${pattern.source}"`,
        action: "cancel_sequence"
      };
    }
  }
  const positivePatterns = [
    /(?:yes|sure|sounds good|interested|love to|happy to|let's)/i,
    /(?:book|schedule|meeting|call|chat|demo|15.?min)/i,
    /(?:tell me more|learn more|send.+(?:info|details|deck))/i,
    /(?:great|awesome|perfect|wonderful|fantastic)/i,
    /(?:when.*available|free.*(?:this|next) week)/i
  ];
  let positiveCount = 0;
  for (const pattern of positivePatterns) {
    if (pattern.test(text)) positiveCount++;
  }
  if (positiveCount >= 2) {
    return {
      sentiment: "positive",
      reasoning: `Matched ${positiveCount} positive patterns \u2014 strong buying signals`,
      action: "escalate_human"
    };
  }
  if (positiveCount === 1) {
    return {
      sentiment: "positive",
      reasoning: "Single positive signal detected \u2014 likely interested",
      action: "escalate_human"
    };
  }
  const neutralPatterns = [
    /(?:maybe|perhaps|possibly|let me think)/i,
    /(?:follow up|reach out).*(?:later|next|month|quarter)/i,
    /(?:busy|swamped|slammed) (?:right now|at the moment)/i,
    /auto.?reply|out of (?:office|town)/i,
    /(?:thanks|thank you)(?!.*(?:interested|love|happy|book|schedule|call))/i
  ];
  for (const pattern of neutralPatterns) {
    if (pattern.test(text)) {
      return {
        sentiment: "neutral",
        reasoning: `Matched neutral pattern: "${pattern.source}" \u2014 non-committal response`,
        action: "continue_cadence"
      };
    }
  }
  return {
    sentiment: "neutral",
    reasoning: "No strong positive or negative signals detected \u2014 treating as neutral",
    action: "continue_cadence"
  };
}
async function runResponseMonitorAgent(leadId, channel, messageBody) {
  const startTime = Date.now();
  sseManager.emitAgentStatus(leadId, AGENT_NUMBER$1, AGENT_NAME$1, "running");
  try {
    let sentiment;
    let reasoning;
    let action;
    if (!messageBody) {
      sentiment = "no_reply";
      reasoning = "No response received within monitoring window";
      action = "nurture";
    } else {
      const { config } = await Promise.resolve().then(function () { return config$1; });
      const classification = config.simulationMode ? classifySentimentKeywords(messageBody) : await classifySentimentLLM(messageBody);
      sentiment = classification.sentiment;
      reasoning = classification.reasoning;
      action = classification.action;
    }
    const responseEvent = {
      leadId,
      channel,
      messageBody,
      sentiment,
      classificationReasoning: reasoning,
      receivedAt: (/* @__PURE__ */ new Date()).toISOString(),
      action
    };
    await responseEventsCol().insertOne({
      _id: nanoid(),
      leadId,
      channel,
      messageBody: messageBody || null,
      sentiment,
      classificationReasoning: reasoning,
      action,
      receivedAt: responseEvent.receivedAt
    });
    if (action === "cancel_sequence") {
      await leadsCol().updateOne(
        { _id: leadId },
        { $set: { status: "do_not_contact" } }
      );
    } else if (action === "escalate_human") {
      await leadsCol().updateOne(
        { _id: leadId },
        { $set: { status: "active" } }
      );
    }
    const durationMs = Date.now() - startTime;
    const summary = `${sentiment.toUpperCase()} \u2192 ${action.replace(/_/g, " ")}`;
    sseManager.emitAgentStatus(leadId, AGENT_NUMBER$1, AGENT_NAME$1, "complete", summary);
    sseManager.emit("response_update", leadId, responseEvent);
    console.log(`\u2705 Agent 9 complete in ${durationMs}ms \u2014 ${summary}`);
    return responseEvent;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    sseManager.emitAgentStatus(leadId, AGENT_NUMBER$1, AGENT_NAME$1, "error", void 0, errMsg);
    throw error;
  }
}
async function simulateNoReply(leadId, deliveryResults) {
  const firstDelivery = deliveryResults.find((d) => d.touchNumber === 1);
  const channel = firstDelivery?.channel || "email";
  return runResponseMonitorAgent(leadId, channel, void 0);
}

"use strict";
const AGENT_NUMBER = 10;
const AGENT_NAME = "Learning Loop";
const ADJUSTMENT_RULES = [
  {
    sentiment: "positive",
    direction: "reinforce",
    magnitude: 0.05,
    description: "Positive response \u2014 reinforcing dimensions that predicted high intent"
  },
  {
    sentiment: "neutral",
    direction: "slight_dampen",
    magnitude: 0.01,
    description: "Neutral response \u2014 minor reduction in confidence of top predictors"
  },
  {
    sentiment: "negative",
    direction: "dampen",
    magnitude: 0.03,
    description: "Negative response \u2014 dampening dimensions that predicted high intent incorrectly"
  },
  {
    sentiment: "no_reply",
    direction: "slight_dampen",
    magnitude: 0.02,
    description: "No reply \u2014 moderate reduction in confidence of scoring dimensions"
  }
];
async function calculateWeightUpdates(response, intent, strategy, persona) {
  const rule = ADJUSTMENT_RULES.find((r) => r.sentiment === response.sentiment);
  if (!rule) return [];
  const updates = [];
  const currentWeights = await scoringWeightsCol().find({}).toArray();
  const weightMap = new Map(currentWeights.map((w) => [w.dimension, w.weight]));
  const dimensionKeyMap = {
    "ICP Fit": "icpFit",
    "Seniority": "seniority",
    "Geography": "geography",
    "Industry Relevance": "industryRelevance",
    "Company Size": "companySize",
    "Funding Stage": "fundingStage",
    "Signal Strength": "signalStrength",
    "LinkedIn Activity": "linkedinActivity",
    "Engagement History": "engagementHistory"
  };
  for (const dim of intent.dimensions) {
    const dbKey = dimensionKeyMap[dim.name];
    if (!dbKey) continue;
    const currentWeight = weightMap.get(dbKey) ?? dim.weight;
    const isTopContributor = intent.topContributors.includes(dim.name);
    let delta = 0;
    switch (rule.direction) {
      case "reinforce":
        delta = isTopContributor ? rule.magnitude : rule.magnitude * 0.3;
        break;
      case "dampen":
        delta = isTopContributor ? -rule.magnitude : -rule.magnitude * 0.2;
        break;
      case "slight_dampen":
        delta = isTopContributor ? -rule.magnitude : -rule.magnitude * 0.5;
        break;
    }
    const newWeight = Math.max(0.01, Math.min(0.4, currentWeight + delta));
    if (Math.abs(delta) > 1e-3) {
      updates.push({
        dimension: dbKey,
        previousWeight: currentWeight,
        newWeight,
        delta: newWeight - currentWeight,
        reason: `${rule.description}${isTopContributor ? " (top contributor)" : ""}`
      });
    }
  }
  const totalWeight = updates.reduce((sum, u) => sum + u.newWeight, 0);
  const unchangedWeight = Array.from(weightMap.entries()).filter(([key]) => !updates.find((u) => u.dimension === key)).reduce((sum, [, w]) => sum + w, 0);
  const grandTotal = totalWeight + unchangedWeight;
  if (grandTotal > 0 && Math.abs(grandTotal - 1) > 0.01) {
    const normFactor = 1 / grandTotal;
    for (const update of updates) {
      update.newWeight = Math.round(update.newWeight * normFactor * 1e4) / 1e4;
      update.delta = update.newWeight - update.previousWeight;
    }
  }
  return updates;
}
function generateChannelHeuristics(response, strategy) {
  const heuristics = [];
  if (response.sentiment === "positive") {
    heuristics.push(
      `\u2705 ${strategy.primaryChannel} was effective for this lead profile \u2014 reinforce channel preference`
    );
    if (strategy.toneFramework) {
      heuristics.push(
        `\u2705 ${strategy.toneFramework} tone framework generated positive engagement`
      );
    }
  } else if (response.sentiment === "negative") {
    heuristics.push(
      `\u26A0\uFE0F ${strategy.primaryChannel} led to negative response \u2014 consider alternative channels for similar profiles`
    );
    heuristics.push(
      `\u26A0\uFE0F ${strategy.toneFramework} tone may not be appropriate for this persona type`
    );
  } else if (response.sentiment === "no_reply") {
    heuristics.push(
      `\u{1F4CA} No reply via ${strategy.primaryChannel} \u2014 ${strategy.secondaryChannel ? "try " + strategy.secondaryChannel + " as primary next time" : "consider adding a secondary channel"}`
    );
  }
  return heuristics;
}
function generateToneRules(response, strategy, persona) {
  const rules = [];
  if (response.sentiment === "positive") {
    rules.push(
      `${persona.archetype} + ${strategy.toneFramework} = effective combination \u2014 record as preferred`
    );
  } else if (response.sentiment === "negative") {
    rules.push(
      `${persona.archetype} + ${strategy.toneFramework} = poor combination \u2014 avoid in future`
    );
    const alternatives = {
      insight_led: "peer_problem",
      peer_problem: "relationship_first",
      challenger: "insight_led",
      relationship_first: "peer_problem",
      growth_urgency: "relationship_first"
    };
    const alt = alternatives[strategy.toneFramework];
    if (alt) {
      rules.push(`Consider "${alt}" for ${persona.archetype} personas instead`);
    }
  }
  return rules;
}
async function applyWeightUpdates(updates) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  for (const update of updates) {
    await scoringWeightsCol().updateOne(
      { dimension: update.dimension },
      {
        $set: {
          weight: update.newWeight,
          previousWeight: update.previousWeight,
          updatedAt: now,
          updatedBy: "agent_10"
        }
      }
    );
  }
}
async function runLearningLoopAgent(response, intent, strategy, persona) {
  const startTime = Date.now();
  sseManager.emitAgentStatus(response.leadId, AGENT_NUMBER, AGENT_NAME, "running");
  try {
    const weightUpdates = await calculateWeightUpdates(response, intent, strategy, persona);
    const heuristicUpdates = generateChannelHeuristics(response, strategy);
    const toneRuleUpdates = generateToneRules(response, strategy, persona);
    if (weightUpdates.length > 0) {
      await applyWeightUpdates(weightUpdates);
    }
    const result = {
      leadId: response.leadId,
      weightUpdates,
      heuristicUpdates,
      toneRuleUpdates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await learningHistoryCol().insertOne({
      _id: nanoid(),
      leadId: response.leadId,
      weightUpdates: JSON.stringify(weightUpdates),
      heuristicUpdates: JSON.stringify(heuristicUpdates),
      toneRuleUpdates: JSON.stringify(toneRuleUpdates),
      updatedAt: result.updatedAt
    });
    const durationMs = Date.now() - startTime;
    const summary = `${weightUpdates.length} weight updates | ${heuristicUpdates.length} heuristics | ${toneRuleUpdates.length} tone rules`;
    sseManager.emitAgentStatus(response.leadId, AGENT_NUMBER, AGENT_NAME, "complete", summary);
    sseManager.emit("learning_update", response.leadId, result);
    console.log(`\u2705 Agent 10 complete in ${durationMs}ms \u2014 ${summary}`);
    return result;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    sseManager.emitAgentStatus(response.leadId, AGENT_NUMBER, AGENT_NAME, "error", void 0, errMsg);
    throw error;
  }
}

"use strict";

"use strict";
const leadInputSchema = z.object({
  mode: z.enum(["targeted", "discovery"]),
  companyName: z.string().optional(),
  contactName: z.string().optional(),
  contactTitle: z.string().optional(),
  contactEmail: z.string().optional(),
  contactLinkedIn: z.string().optional(),
  location: z.string().optional(),
  additionalContext: z.string().optional(),
  productName: z.string().optional(),
  productDescription: z.string().optional(),
  targetIndustries: z.array(z.string()).optional(),
  targetCompanySize: z.string().optional(),
  targetGeographies: z.array(z.string()).optional(),
  idealCustomerProfile: z.string().optional(),
  maxResults: z.number().optional()
});
const anyJsonSchema = z.record(z.unknown());
const step1_leadIngestion = createStep({
  id: "step-1-lead-ingestion",
  inputSchema: leadInputSchema,
  outputSchema: z.object({ lead: anyJsonSchema }),
  execute: async ({ inputData }) => {
    const leads = await runLeadIngestionAgent(inputData);
    const lead = leads[0];
    return { lead };
  }
});
const step2_signalScout = createStep({
  id: "step-2-signal-scout",
  inputSchema: z.object({ lead: anyJsonSchema }),
  outputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema }),
  execute: async ({ inputData }) => {
    const signals = await runSignalScoutAgent(inputData.lead);
    return { lead: inputData.lead, signals };
  }
});
const step3_intentScorer = createStep({
  id: "step-3-intent-scorer",
  inputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema }),
  outputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema }),
  execute: async ({ inputData }) => {
    const intent = await runIntentScorerAgent(inputData.lead, inputData.signals);
    return { lead: inputData.lead, signals: inputData.signals, intent };
  }
});
const step4_personaAnalyst = createStep({
  id: "step-4-persona-analyst",
  inputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema }),
  outputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema }),
  execute: async ({ inputData }) => {
    const persona = await runPersonaAnalystAgent(inputData.lead);
    return { ...inputData, persona };
  }
});
const step5_strategyCommander = createStep({
  id: "step-5-strategy-commander",
  inputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema }),
  outputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema, strategy: anyJsonSchema }),
  execute: async ({ inputData }) => {
    const strategy = await runStrategyCommanderAgent(
      inputData.lead,
      inputData.signals,
      inputData.intent,
      inputData.persona
    );
    return { ...inputData, strategy };
  }
});
const step6_contentForge = createStep({
  id: "step-6-content-forge",
  inputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema, strategy: anyJsonSchema }),
  outputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema, strategy: anyJsonSchema, content: anyJsonSchema }),
  execute: async ({ inputData }) => {
    const content = await runContentForgeAgent(
      inputData.lead,
      inputData.signals,
      inputData.intent,
      inputData.persona,
      inputData.strategy
    );
    return { ...inputData, content };
  }
});
const step7_explainer = createStep({
  id: "step-7-explainer",
  inputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema, strategy: anyJsonSchema, content: anyJsonSchema }),
  outputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema, strategy: anyJsonSchema, content: anyJsonSchema, rationale: anyJsonSchema }),
  execute: async ({ inputData }) => {
    const rationale = await runExplainerAgent(
      inputData.lead,
      inputData.signals,
      inputData.intent,
      inputData.persona,
      inputData.strategy,
      inputData.content
    );
    return { ...inputData, rationale };
  }
});
const step8_delivery = createStep({
  id: "step-8-delivery",
  inputSchema: z.object({ lead: anyJsonSchema, strategy: anyJsonSchema, content: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema, rationale: anyJsonSchema }),
  outputSchema: z.object({ lead: anyJsonSchema, strategy: anyJsonSchema, content: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema, rationale: anyJsonSchema, delivery: z.array(anyJsonSchema) }),
  execute: async ({ inputData }) => {
    const delivery = await runDeliveryAgent(
      inputData.lead,
      inputData.strategy,
      inputData.content
    );
    return { ...inputData, delivery };
  }
});
const step9_responseMonitor = createStep({
  id: "step-9-response-monitor",
  inputSchema: z.object({ lead: anyJsonSchema, delivery: z.array(anyJsonSchema), strategy: anyJsonSchema, content: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema, rationale: anyJsonSchema }),
  outputSchema: z.object({ lead: anyJsonSchema, delivery: z.array(anyJsonSchema), strategy: anyJsonSchema, content: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema, rationale: anyJsonSchema, response: anyJsonSchema }),
  execute: async ({ inputData }) => {
    const lead = inputData.lead;
    const response = await simulateNoReply(lead.id, inputData.delivery);
    return { ...inputData, response };
  }
});
const step10_learningLoop = createStep({
  id: "step-10-learning-loop",
  inputSchema: z.object({ response: anyJsonSchema, intent: anyJsonSchema, strategy: anyJsonSchema, persona: anyJsonSchema, lead: anyJsonSchema, delivery: z.array(anyJsonSchema), content: anyJsonSchema, signals: anyJsonSchema, rationale: anyJsonSchema }),
  outputSchema: z.object({ learning: anyJsonSchema }),
  execute: async ({ inputData }) => {
    const learning = await runLearningLoopAgent(
      inputData.response,
      inputData.intent,
      inputData.strategy,
      inputData.persona
    );
    return { learning };
  }
});
const nervePipeline = createWorkflow({
  id: "nerve-pipeline",
  inputSchema: leadInputSchema,
  outputSchema: z.object({ learning: anyJsonSchema })
}).then(step1_leadIngestion).then(step2_signalScout).then(step3_intentScorer).then(step4_personaAnalyst).then(step5_strategyCommander).then(step6_contentForge).then(step7_explainer).then(step8_delivery).then(step9_responseMonitor).then(step10_learningLoop).commit();

"use strict";
const mastra = new Mastra({
  server: {
    port: 4111
    // Override PORT env var (3001 is used by the Hono API server)
  },
  agents: {
    leadIngestionAgent,
    signalScoutAgent,
    intentScorerAgent,
    personaAnalystAgent,
    strategyCommanderAgent,
    contentForgeAgent,
    explainerAgent,
    deliveryAgent,
    responseMonitorAgent,
    learningLoopAgent
  },
  workflows: {
    nervePipeline
  }
});

export { mastra };
