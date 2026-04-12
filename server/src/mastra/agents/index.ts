/**
 * Mastra Agent definitions for NERVE / CortexReach
 *
 * Each Mastra Agent wraps the existing agent function as a tool,
 * giving the Mastra Studio playground full visibility into every agent.
 */
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// ─── Shared model string (Groq Llama 3.3 70B) ───
const MODEL = "groq/llama-3.3-70b-versatile" as const;

// ═══════ Agent 1: Lead Ingestion & Enrichment ═══════
export const leadIngestionAgent = new Agent({
  id: "agent-1-lead-ingestion",
  name: "Lead Ingestion & Enrichment",
  instructions: `You are Agent 1 — the Lead Ingestion & Enrichment agent in the NERVE pipeline.
Your job is to accept a company name (and optional contact info), enrich it via Apollo API,
validate the data, de-duplicate, and produce a fully enriched lead record.
You output structured JSON with company details, contact details, tech stack, funding stage, and seniority.`,
  model: MODEL,
});

// ═══════ Agent 2: Signal Scout ═══════
export const signalScoutAgent = new Agent({
  id: "agent-2-signal-scout",
  name: "Signal Scout",
  instructions: `You are Agent 2 — the Signal Scout in the NERVE pipeline.
Given an enriched lead, you scan the web via Tavily for recent signals:
funding rounds, product launches, executive hires, hiring spikes, LinkedIn activity,
partnerships, awards. You classify each signal by category, strength (HIGH/MEDIUM/LOW),
recency, and return a ranked SignalBundle.`,
  model: MODEL,
});

// ═══════ Agent 3: Intent Scorer ═══════
export const intentScorerAgent = new Agent({
  id: "agent-3-intent-scorer",
  name: "Intent Scorer",
  instructions: `You are Agent 3 — the Intent Scorer in the NERVE pipeline.
Given an enriched lead and its signal bundle, you compute a composite intent score (0-100)
across weighted dimensions: ICP fit, seniority, geography, industry relevance, company size,
funding stage, signal strength, LinkedIn activity, engagement history.
Classify the lead as HOT / WARM / COOL / COLD based on the composite score.`,
  model: MODEL,
});

// ═══════ Agent 4: Persona Analyst ═══════
export const personaAnalystAgent = new Agent({
  id: "agent-4-persona-analyst",
  name: "Persona Analyst",
  instructions: `You are Agent 4 — the Persona Analyst in the NERVE pipeline.
Given an enriched lead, analyze the contact's archetype (strategic_executive, practitioner,
innovator, networker), their personality traits, communication style, preferred tone,
and what to avoid in messaging. Produce a PersonaProfile with confidence score.`,
  model: MODEL,
});

// ═══════ Agent 5: Strategy Commander ═══════
export const strategyCommanderAgent = new Agent({
  id: "agent-5-strategy-commander",
  name: "Strategy Commander",
  instructions: `You are Agent 5 — the Strategy Commander, the central decision brain of the NERVE pipeline.
Given the enriched lead, signal bundle, intent score, and persona profile, decide:
1. Primary outreach channel (linkedin_dm / email / whatsapp)
2. Tone framework (insight_led / peer_problem / challenger / relationship_first / growth_urgency)
3. Optimal send timing (based on timezone + working hours)
4. 3-touch cadence schedule with channel + day offsets
Return an OutreachStrategy with explicit decisions and reasoning.`,
  model: MODEL,
});

// ═══════ Agent 6: Content Forge ═══════
export const contentForgeAgent = new Agent({
  id: "agent-6-content-forge",
  name: "Content Forge",
  instructions: `You are Agent 6 — the Content Forge in the NERVE pipeline.
Given lead, signals, intent, persona, and strategy, generate personalized outreach messages
for each touch in the cadence. Craft subject lines (for emails), message bodies, and optionally
a LinkedIn thought-leadership post and headline suggestion. Every message should reference
real signals and use the persona's preferred tone.`,
  model: MODEL,
});

// ═══════ Agent 7: Explainer ═══════
export const explainerAgent = new Agent({
  id: "agent-7-explainer",
  name: "Decision Trace & Explainability",
  instructions: `You are Agent 7 — the Explainer in the NERVE pipeline.
Given the full trace of all upstream agents (lead, signals, intent, persona, strategy, content),
produce a plain-English executive summary of WHY each decision was made.
For each agent's output, generate a RationaleItem with: agentName, decision, explanation, confidence.
This powers the explainability layer of the system.`,
  model: MODEL,
});

// ═══════ Agent 8: Delivery ═══════
export const deliveryAgent = new Agent({
  id: "agent-8-delivery",
  name: "Delivery & Execution",
  instructions: `You are Agent 8 — the Delivery agent in the NERVE pipeline.
Given the enriched lead, outreach strategy, and generated content, dispatch the first-touch
message via the appropriate platform:
- LinkedIn DM → HeyReach API
- Email → Resend API
- WhatsApp → AiSensy API
Track delivery receipts, message IDs, and status (sent/queued/failed/simulated).`,
  model: MODEL,
});

// ═══════ Agent 9: Response Monitor ═══════
export const responseMonitorAgent = new Agent({
  id: "agent-9-response-monitor",
  name: "Response Monitor",
  instructions: `You are Agent 9 — the Response Monitor in the NERVE pipeline.
When a prospect responds (or doesn't after a timeout), classify the sentiment
(positive / neutral / negative / no_reply) and recommend an action:
escalate_human, continue_cadence, cancel_sequence, or nurture.
Provide classification reasoning.`,
  model: MODEL,
});

// ═══════ Agent 10: Learning Loop ═══════
export const learningLoopAgent = new Agent({
  id: "agent-10-learning-loop",
  name: "Learning Loop",
  instructions: `You are Agent 10 — the Learning Loop in the NERVE pipeline.
Given the response event, original intent score, outreach strategy, and persona profile,
compute scoring weight adjustments (delta per dimension) to improve future predictions.
Also generate heuristic updates and tone rule adjustments.
This enables the system to compound its learning over every outreach cycle.`,
  model: MODEL,
});
