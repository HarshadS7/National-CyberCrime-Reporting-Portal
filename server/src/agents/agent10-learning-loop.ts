import { nanoid } from "nanoid";
import { scoringWeightsCol, learningHistoryCol } from "../db/index.js";
import { sseManager } from "../lib/sse.js";
import type {
  ResponseEvent,
  IntentScore,
  OutreachStrategy,
  PersonaProfile,
  LearningResult,
  WeightUpdate,
} from "../types/index.js";

const AGENT_NUMBER = 10;
const AGENT_NAME = "Learning Loop";

// ─── Weight Adjustment Rules ───
// Based on response outcome, adjust the scoring weights that contributed to
// the original intent score. This creates a feedback loop:
// positive response → reinforce contributing weights
// negative response → dampen contributing weights
// no_reply → slightly reduce confidence in top contributors

interface AdjustmentRule {
  sentiment: string;
  direction: "reinforce" | "dampen" | "slight_dampen";
  magnitude: number; // 0-1, how much to adjust
  description: string;
}

const ADJUSTMENT_RULES: AdjustmentRule[] = [
  {
    sentiment: "positive",
    direction: "reinforce",
    magnitude: 0.05,
    description: "Positive response — reinforcing dimensions that predicted high intent",
  },
  {
    sentiment: "neutral",
    direction: "slight_dampen",
    magnitude: 0.01,
    description: "Neutral response — minor reduction in confidence of top predictors",
  },
  {
    sentiment: "negative",
    direction: "dampen",
    magnitude: 0.03,
    description: "Negative response — dampening dimensions that predicted high intent incorrectly",
  },
  {
    sentiment: "no_reply",
    direction: "slight_dampen",
    magnitude: 0.02,
    description: "No reply — moderate reduction in confidence of scoring dimensions",
  },
];

// ─── Weight Update Logic ───

async function calculateWeightUpdates(
  response: ResponseEvent,
  intent: IntentScore,
  strategy: OutreachStrategy,
  persona: PersonaProfile
): Promise<WeightUpdate[]> {
  const rule = ADJUSTMENT_RULES.find((r) => r.sentiment === response.sentiment);
  if (!rule) return [];

  const updates: WeightUpdate[] = [];

  // Get current weights from DB
  const currentWeights = await scoringWeightsCol().find({}).toArray();
  const weightMap = new Map(currentWeights.map((w) => [w.dimension, w.weight]));

  // Map dimension names to DB keys
  const dimensionKeyMap: Record<string, string> = {
    "ICP Fit": "icpFit",
    "Seniority": "seniority",
    "Geography": "geography",
    "Industry Relevance": "industryRelevance",
    "Company Size": "companySize",
    "Funding Stage": "fundingStage",
    "Signal Strength": "signalStrength",
    "LinkedIn Activity": "linkedinActivity",
    "Engagement History": "engagementHistory",
  };

  // For each dimension in the intent score
  for (const dim of intent.dimensions) {
    const dbKey = dimensionKeyMap[dim.name];
    if (!dbKey) continue;

    const currentWeight = weightMap.get(dbKey) ?? dim.weight;
    const isTopContributor = intent.topContributors.includes(dim.name);

    let delta = 0;

    switch (rule.direction) {
      case "reinforce":
        // Positive: increase weight of top contributors, slightly boost others
        delta = isTopContributor ? rule.magnitude : rule.magnitude * 0.3;
        break;
      case "dampen":
        // Negative: decrease weight of top contributors (they were wrong)
        delta = isTopContributor ? -rule.magnitude : -rule.magnitude * 0.2;
        break;
      case "slight_dampen":
        // Neutral/no-reply: slight decrease across the board
        delta = isTopContributor ? -rule.magnitude : -rule.magnitude * 0.5;
        break;
    }

    // Clamp weight to [0.01, 0.40]
    const newWeight = Math.max(0.01, Math.min(0.40, currentWeight + delta));

    if (Math.abs(delta) > 0.001) {
      updates.push({
        dimension: dbKey,
        previousWeight: currentWeight,
        newWeight,
        delta: newWeight - currentWeight,
        reason: `${rule.description}${isTopContributor ? " (top contributor)" : ""}`,
      });
    }
  }

  // Normalize weights so they sum to 1.0
  const totalWeight = updates.reduce((sum, u) => sum + u.newWeight, 0);
  // Include unchanged dimensions in normalization
  const unchangedWeight = Array.from(weightMap.entries())
    .filter(([key]) => !updates.find((u) => u.dimension === key))
    .reduce((sum, [, w]) => sum + w, 0);

  const grandTotal = totalWeight + unchangedWeight;
  if (grandTotal > 0 && Math.abs(grandTotal - 1.0) > 0.01) {
    const normFactor = 1.0 / grandTotal;
    for (const update of updates) {
      update.newWeight = Math.round(update.newWeight * normFactor * 10000) / 10000;
      update.delta = update.newWeight - update.previousWeight;
    }
  }

  return updates;
}

// ─── Channel Heuristic Updates ───

function generateChannelHeuristics(
  response: ResponseEvent,
  strategy: OutreachStrategy
): string[] {
  const heuristics: string[] = [];

  if (response.sentiment === "positive") {
    heuristics.push(
      `✅ ${strategy.primaryChannel} delivered a positive response — this channel is effective for leads in the ${strategy.timezone} timezone`
    );
    if (strategy.toneFramework) {
      heuristics.push(
        `✅ "${strategy.toneFramework.replace(/_/g, " ")}" tone framework generated positive engagement — reinforcing as preferred for similar persona types`
      );
    }
    if (strategy.secondaryChannel) {
      heuristics.push(
        `📊 ${strategy.secondaryChannel} was designated as backup but wasn't needed — primary channel was sufficient`
      );
    }
  } else if (response.sentiment === "negative") {
    heuristics.push(
      `⚠️ ${strategy.primaryChannel} led to negative response — consider ${strategy.secondaryChannel || "alternative channels"} as primary for similar lead profiles (${strategy.timezone} timezone, same seniority level)`
    );
    heuristics.push(
      `⚠️ "${strategy.toneFramework.replace(/_/g, " ")}" tone framework may have been too ${strategy.toneFramework === "growth_urgency" ? "aggressive" : strategy.toneFramework === "challenger" ? "provocative" : "direct"} for this persona — flag for manual review`
    );
    heuristics.push(
      `🔴 Lead marked as do-not-contact — removing from all active cadences and future campaigns`
    );
  } else if (response.sentiment === "no_reply") {
    heuristics.push(
      `📊 No reply via ${strategy.primaryChannel} after Touch 1 — ${strategy.secondaryChannel ? `recommend switching to ${strategy.secondaryChannel} for Touch 2` : "consider adding a secondary channel (LinkedIn DM or WhatsApp) for multi-channel approach"}`
    );
    heuristics.push(
      `⏰ Cadence timing (${strategy.timezone}, first send: ${strategy.sendTimestamp.slice(0, 10)}) may need adjustment — test sending at different times for this timezone`
    );
  } else {
    heuristics.push(
      `📊 Neutral response via ${strategy.primaryChannel} — continue cadence with Touch 2 via ${strategy.cadence[1]?.channel || strategy.primaryChannel} as planned`
    );
  }

  return heuristics;
}

// ─── Tone Rule Updates ───

function generateToneRules(
  response: ResponseEvent,
  strategy: OutreachStrategy,
  persona: PersonaProfile
): string[] {
  const rules: string[] = [];

  const toneLabel = strategy.toneFramework.replace(/_/g, " ");

  if (response.sentiment === "positive") {
    rules.push(
      `📗 ${persona.archetypeLabel} persona + "${toneLabel}" tone = EFFECTIVE — recording as preferred combination (confidence: ${Math.round(persona.confidence * 100)}%)`
    );
    rules.push(
      `📗 Traits that responded well: ${persona.traits.slice(0, 3).join(", ")} — prioritize these in future persona matching`
    );
  } else if (response.sentiment === "negative") {
    rules.push(
      `📕 ${persona.archetypeLabel} persona + "${toneLabel}" tone = INEFFECTIVE — flagging this combination to avoid in future`
    );
    // Suggest alternative tones with reasoning
    const alternatives: Record<string, { tone: string; reason: string }> = {
      insight_led: { tone: "peer_problem", reason: "Switch from strategic-level to technical peer-level messaging — may resonate better with this persona" },
      peer_problem: { tone: "relationship_first", reason: "Technical approach was rejected — try building relationship first before discussing solutions" },
      challenger: { tone: "insight_led", reason: "Challenger tone was too provocative — dial back to insight-led, data-driven approach" },
      relationship_first: { tone: "peer_problem", reason: "Relationship approach didn't land — try being more specific about their technical pain points" },
      growth_urgency: { tone: "relationship_first", reason: "Urgency-based approach felt pushy — switch to low-pressure, relationship-first messaging" },
    };
    const alt = alternatives[strategy.toneFramework];
    if (alt) {
      rules.push(`📕 Recommendation: Use "${alt.tone.replace(/_/g, " ")}" for ${persona.archetypeLabel} personas instead — ${alt.reason}`);
    }
    rules.push(
      `📕 Messaging to avoid for this persona type: ${persona.avoidInMessaging.join(", ")}`
    );
  } else if (response.sentiment === "neutral") {
    rules.push(
      `📒 ${persona.archetypeLabel} + "${toneLabel}" = INCONCLUSIVE — maintain current approach for Touch 2 but increase specificity`
    );
  } else {
    rules.push(
      `📒 No reply with "${toneLabel}" tone for ${persona.archetypeLabel} persona — insufficient data to adjust tone rules. Continue cadence.`
    );
  }

  return rules;
}

// ─── Apply Weight Updates to DB ───

async function applyWeightUpdates(updates: WeightUpdate[]): Promise<void> {
  const now = new Date().toISOString();

  for (const update of updates) {
    await scoringWeightsCol().updateOne(
      { dimension: update.dimension },
      {
        $set: {
          weight: update.newWeight,
          previousWeight: update.previousWeight,
          updatedAt: now,
          updatedBy: "agent_10",
        },
      }
    );
  }
}

// ─── Main Agent Function ───

export async function runLearningLoopAgent(
  response: ResponseEvent,
  intent: IntentScore,
  strategy: OutreachStrategy,
  persona: PersonaProfile
): Promise<LearningResult> {
  const startTime = Date.now();

  sseManager.emitAgentStatus(response.leadId, AGENT_NUMBER, AGENT_NAME, "running");

  try {
    // 1. Calculate weight adjustments
    const weightUpdates = await calculateWeightUpdates(response, intent, strategy, persona);

    // 2. Generate channel heuristic updates
    const heuristicUpdates = generateChannelHeuristics(response, strategy);

    // 3. Generate tone rule updates
    const toneRuleUpdates = generateToneRules(response, strategy, persona);

    // 4. Apply weight updates to DB
    if (weightUpdates.length > 0) {
      await applyWeightUpdates(weightUpdates);
    }

    const result: LearningResult = {
      leadId: response.leadId,
      weightUpdates,
      heuristicUpdates,
      toneRuleUpdates,
      updatedAt: new Date().toISOString(),
    };

    // 5. Persist learning history
    await learningHistoryCol().insertOne({
      _id: nanoid(),
      leadId: response.leadId,
      weightUpdates: JSON.stringify(weightUpdates),
      heuristicUpdates: JSON.stringify(heuristicUpdates),
      toneRuleUpdates: JSON.stringify(toneRuleUpdates),
      updatedAt: result.updatedAt,
    });

    const durationMs = Date.now() - startTime;
    const summary = `${weightUpdates.length} weight updates | ${heuristicUpdates.length} heuristics | ${toneRuleUpdates.length} tone rules`;

    sseManager.emitAgentStatus(response.leadId, AGENT_NUMBER, AGENT_NAME, "complete", summary);
    sseManager.emit("learning_update", response.leadId, result);

    console.log(`✅ Agent 10 complete in ${durationMs}ms — ${summary}`);
    return result;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    sseManager.emitAgentStatus(response.leadId, AGENT_NUMBER, AGENT_NAME, "error", undefined, errMsg);
    throw error;
  }
}
