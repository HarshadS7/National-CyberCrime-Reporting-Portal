import { nanoid } from "nanoid";
import { db } from "../db/index.js";
import { agentRuns } from "../db/schema.js";
import { sseManager } from "../lib/sse.js";
import { llmGenerateText } from "../lib/llm.js";
import { eq, and } from "drizzle-orm";
import type {
  EnrichedLead,
  SignalBundle,
  IntentScore,
  PersonaProfile,
  OutreachStrategy,
  GeneratedContent,
  DecisionRationale,
  RationaleItem,
  AgentGraphData,
  AgentNode,
  AgentEdge,
} from "../types/index.js";

const AGENT_NUMBER = 7;
const AGENT_NAME = "Explainer";

// ─── Agent Graph Builder (for React Flow frontend) ───

function buildAgentGraph(leadId: string): AgentGraphData {
  // Query all agent runs for this lead
  const runs = db
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.leadId, leadId))
    .all();

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
    { num: 10, name: "Learning Loop", id: "agent-10" },
  ];

  const nodes: AgentNode[] = agentDefs.map((def) => {
    const run = runMap.get(def.num);
    return {
      agentId: def.id,
      agentName: def.name,
      agentNumber: def.num,
      status: run ? (run.status as "idle" | "running" | "complete" | "error") : "idle",
      startedAt: run?.startedAt || undefined,
      completedAt: run?.completedAt || undefined,
      outputSummary: run?.output ? summarizeOutput(def.num, run.output) : undefined,
      error: run?.error || undefined,
    };
  });

  // Define the DAG edges: 1 → 2,3,4(parallel) → 5 → 6,7(parallel) → 8 → 9 → 10
  const edges: AgentEdge[] = [
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
    { from: "agent-9", to: "agent-10", animated: true, dataFlowing: !!runMap.get(10) },
  ];

  return { nodes, edges };
}

function summarizeOutput(agentNumber: number, outputJson: string): string {
  try {
    const data = JSON.parse(outputJson);
    switch (agentNumber) {
      case 1: return `Enriched: ${data.companyName} — ${data.contactName}`;
      case 2: return `${data.signals?.length || 0} signals, top: ${data.topSignal?.title?.slice(0, 40) || "none"}`;
      case 3: return `Score: ${data.compositeScore}/100 (${data.tier})`;
      case 4: return `${data.archetypeLabel} (${Math.round((data.confidence || 0) * 100)}%)`;
      case 5: return `${data.primaryChannel} | ${data.toneFramework}`;
      case 6: return `${data.touches?.length || 0} touches generated`;
      case 8: return `Delivered: ${data.status || "pending"}`;
      case 9: return `Sentiment: ${data.sentiment || "pending"}`;
      case 10: return `${data.weightUpdates?.length || 0} weight updates`;
      default: return "Completed";
    }
  } catch {
    return "Completed";
  }
}

// ─── Plain-English Rationale Builder ───

function buildRationale(
  lead: EnrichedLead,
  signals: SignalBundle,
  intent: IntentScore,
  persona: PersonaProfile,
  strategy: OutreachStrategy,
  content: GeneratedContent
): RationaleItem[] {
  const items: RationaleItem[] = [];

  // Agent 1: Lead Ingestion
  items.push({
    agentName: "Lead Ingestion",
    decision: `Enriched ${lead.companyName} — ${lead.contactName} (${lead.contactTitle})`,
    explanation: `We pulled data on ${lead.companyName} from Apollo.io and identified ${lead.contactName} as the primary contact. ${lead.companySize ? `The company is ${lead.companySize} employees` : "Company size unknown"}${lead.fundingStage ? `, at ${lead.fundingStage} stage` : ""}${lead.industry ? `, operating in ${lead.industry}` : ""}.`,
    confidence: 0.95,
  });

  // Agent 2: Signal Scout
  items.push({
    agentName: "Signal Scout",
    decision: signals.topSignal
      ? `Found ${signals.signals.length} signals — strongest: "${signals.topSignal.title}"`
      : "No strong signals detected",
    explanation: signals.topSignal
      ? `We scanned the web for recent activity from ${lead.companyName}. The strongest signal is "${signals.topSignal.title}" (${signals.topSignal.strength} strength, ${signals.topSignal.recencyDays} days ago). ${signals.signals.length > 1 ? `We also found ${signals.signals.length - 1} additional signals.` : ""} Their LinkedIn activity score is ${signals.linkedinActivityScore}/100.`
      : `No significant recent signals found for ${lead.companyName}. LinkedIn activity score is ${signals.linkedinActivityScore}/100.`,
    confidence: signals.topSignal ? 0.85 : 0.5,
  });

  // Agent 3: Intent Scorer
  items.push({
    agentName: "Intent Scorer",
    decision: `Score: ${intent.compositeScore}/100 — ${intent.tier} lead`,
    explanation: `Using our 9-dimension weighted scoring model, ${lead.contactName} scored ${intent.compositeScore}/100, placing them in the ${intent.tier} tier. The top scoring factors were: ${intent.topContributors.join(", ")}. ${intent.tier === "HOT" ? "This is a high-priority lead that should be contacted quickly." : intent.tier === "WARM" ? "This lead shows solid potential and is worth pursuing." : intent.tier === "COOL" ? "This lead has some potential but may need more nurturing." : "This lead currently shows low intent — consider nurturing over time."}`,
    confidence: 0.9,
  });

  // Agent 4: Persona Analyst
  items.push({
    agentName: "Persona Analyst",
    decision: `${persona.archetypeLabel} archetype (${Math.round(persona.confidence * 100)}% confidence)`,
    explanation: `We classified ${lead.contactName} as a "${persona.archetypeLabel}" based on their title (${lead.contactTitle}), seniority (${lead.seniority || "unknown"}), and industry context. ${persona.reasoning} This means we should use a ${persona.preferredTone} approach and avoid ${persona.avoidInMessaging.slice(0, 2).join(" and ")}.`,
    confidence: persona.confidence,
  });

  // Agent 5: Strategy Commander
  items.push({
    agentName: "Strategy Commander",
    decision: `Channel: ${strategy.primaryChannel}${strategy.secondaryChannel ? " + " + strategy.secondaryChannel : ""} | Tone: ${strategy.toneFramework}`,
    explanation: strategy.decisions
      .map((d) => `${d.decision}: ${d.reasoning}`)
      .join(" "),
    confidence: 0.85,
  });

  // Agent 6: Content Forge
  items.push({
    agentName: "Content Forge",
    decision: `Generated ${content.touches.length}-touch cadence${content.linkedinPost ? " + LinkedIn post" : ""}`,
    explanation: `We crafted ${content.touches.length} personalized messages: ${content.touches.map((t) => `Touch ${t.touchNumber} via ${t.channel}`).join(", ")}. Each message was tailored to the ${persona.archetypeLabel} persona using the ${strategy.toneFramework.replace(/_/g, " ")} framework.${content.linkedinPost ? " A LinkedIn thought-leadership post was also generated to warm up the relationship." : ""}`,
    confidence: 0.8,
  });

  return items;
}

// ─── LLM-Enhanced Summary ───

async function generateSummary(
  lead: EnrichedLead,
  rationale: RationaleItem[],
  intent: IntentScore,
  strategy: OutreachStrategy
): Promise<string> {
  const systemPrompt = `You are a sales strategy advisor explaining AI-driven outreach decisions to a human operator. Write in plain English, 2-3 sentences max. Be specific, not generic.`;

  const userMessage = `Summarize the outreach plan for ${lead.contactName} (${lead.contactTitle} at ${lead.companyName}):
- Intent: ${intent.tier} (${intent.compositeScore}/100)
- Channel: ${strategy.primaryChannel}
- Tone: ${strategy.toneFramework}
- Touches: ${strategy.cadence.length} over ${strategy.cadence[strategy.cadence.length - 1]?.dayOffset || 7} days

Write a 2-3 sentence executive summary of why we're reaching out to this person, through this channel, in this way.`;

  const response = await llmGenerateText(systemPrompt, userMessage);

  // Handle simulated/quota responses
  if (response.startsWith("[SIMULATED]") || response.startsWith("[QUOTA_EXCEEDED]")) {
    return `We're reaching ${lead.contactName} at ${lead.companyName} via ${strategy.primaryChannel} using a ${strategy.toneFramework.replace(/_/g, " ")} approach. They scored ${intent.compositeScore}/100 (${intent.tier}), making them ${intent.tier === "HOT" ? "a high-priority target for immediate outreach" : intent.tier === "WARM" ? "a solid prospect worth engaging" : "a lead to nurture carefully"}. The ${strategy.cadence.length}-touch cadence will unfold over ${strategy.cadence[strategy.cadence.length - 1]?.dayOffset || 7} days.`;
  }

  return response;
}

// ─── Main Agent Function ───

export async function runExplainerAgent(
  lead: EnrichedLead,
  signals: SignalBundle,
  intent: IntentScore,
  persona: PersonaProfile,
  strategy: OutreachStrategy,
  content: GeneratedContent
): Promise<DecisionRationale> {
  const startTime = Date.now();

  sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "running");

  try {
    // Build structured rationale
    const explanations = buildRationale(lead, signals, intent, persona, strategy, content);

    // Build agent graph data
    const graphData = buildAgentGraph(lead.id);

    // Generate executive summary
    const summary = await generateSummary(lead, explanations, intent, strategy);

    const rationale: DecisionRationale = {
      leadId: lead.id,
      explanations,
      summary,
      graphData,
      generatedAt: new Date().toISOString(),
    };

    const durationMs = Date.now() - startTime;
    const outputSummary = `${explanations.length} rationale items | ${graphData.nodes.filter((n) => n.status === "complete").length}/${graphData.nodes.length} agents complete`;

    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "complete", outputSummary);
    sseManager.emit("rationale_update", lead.id, rationale);

    console.log(`✅ Agent 7 complete in ${durationMs}ms — ${outputSummary}`);
    return rationale;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "error", undefined, errMsg);
    throw error;
  }
}
