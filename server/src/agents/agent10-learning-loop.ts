import { nanoid } from "nanoid";
import { db } from "../db/index.js";
import {
  scoringWeights as weightsTable,
  learningHistory,
} from "../db/schema.js";
import { sseManager } from "../lib/sse.js";
import { eq } from "drizzle-orm";
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

function calculateWeightUpdates(
  response: ResponseEvent,
  intent: IntentScore,
  strategy: OutreachStrategy,
  persona: PersonaProfile
): WeightUpdate[] {
  const rule = ADJUSTMENT_RULES.find((r) => r.sentiment === response.sentiment);
  if (!rule) return [];

  const updates: WeightUpdate[] = [];

  // Get current weights from DB
  const currentWeights = db.select().from(weightsTable).all();
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
      `✅ ${strategy.primaryChannel} was effective for this lead profile — reinforce channel preference`
    );
    if (strategy.toneFramework) {
      heuristics.push(
        `✅ ${strategy.toneFramework} tone framework generated positive engagement`
      );
    }
  } else if (response.sentiment === "negative") {
    heuristics.push(
      `⚠️ ${strategy.primaryChannel} led to negative response — consider alternative channels for similar profiles`
    );
    heuristics.push(
      `⚠️ ${strategy.toneFramework} tone may not be appropriate for this persona type`
    );
  } else if (response.sentiment === "no_reply") {
    heuristics.push(
      `📊 No reply via ${strategy.primaryChannel} — ${strategy.secondaryChannel ? "try " + strategy.secondaryChannel + " as primary next time" : "consider adding a secondary channel"}`
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

  if (response.sentiment === "positive") {
    rules.push(
      `${persona.archetype} + ${strategy.toneFramework} = effective combination — record as preferred`
    );
  } else if (response.sentiment === "negative") {
    rules.push(
      `${persona.archetype} + ${strategy.toneFramework} = poor combination — avoid in future`
    );
    // Suggest alternative tones
    const alternatives: Record<string, string> = {
      insight_led: "peer_problem",
      peer_problem: "relationship_first",
      challenger: "insight_led",
      relationship_first: "peer_problem",
      growth_urgency: "relationship_first",
    };
    const alt = alternatives[strategy.toneFramework];
    if (alt) {
      rules.push(`Consider "${alt}" for ${persona.archetype} personas instead`);
    }
  }

  return rules;
}

// ─── Apply Weight Updates to DB ───

function applyWeightUpdates(updates: WeightUpdate[]): void {
  const now = new Date().toISOString();

  for (const update of updates) {
    db.update(weightsTable)
      .set({
        weight: update.newWeight,
        previousWeight: update.previousWeight,
        updatedAt: now,
        updatedBy: "agent_10",
      })
      .where(eq(weightsTable.dimension, update.dimension))
      .run();
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
    const weightUpdates = calculateWeightUpdates(response, intent, strategy, persona);

    // 2. Generate channel heuristic updates
    const heuristicUpdates = generateChannelHeuristics(response, strategy);

    // 3. Generate tone rule updates
    const toneRuleUpdates = generateToneRules(response, strategy, persona);

    // 4. Apply weight updates to DB
    if (weightUpdates.length > 0) {
      applyWeightUpdates(weightUpdates);
    }

    const result: LearningResult = {
      leadId: response.leadId,
      weightUpdates,
      heuristicUpdates,
      toneRuleUpdates,
      updatedAt: new Date().toISOString(),
    };

    // 5. Persist learning history
    db.insert(learningHistory)
      .values({
        id: nanoid(),
        leadId: response.leadId,
        weightUpdates: JSON.stringify(weightUpdates),
        heuristicUpdates: JSON.stringify(heuristicUpdates),
        toneRuleUpdates: JSON.stringify(toneRuleUpdates),
        updatedAt: result.updatedAt,
      })
      .run();

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
