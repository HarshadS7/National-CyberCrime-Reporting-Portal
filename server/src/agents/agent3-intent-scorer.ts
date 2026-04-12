import { nanoid } from "nanoid";
import { scoringWeightsCol, intentScoresCol } from "../db/index.js";
import { sseManager } from "../lib/sse.js";
import type {
  EnrichedLead,
  SignalBundle,
  IntentScore,
  ScoreDimension,
  ScoringWeights,
} from "../types/index.js";
import { DEFAULT_SCORING_WEIGHTS } from "../types/index.js";

const AGENT_NUMBER = 3;
const AGENT_NAME = "Intent Scorer";

// ─── Load Dynamic Weights from DB ───

async function loadWeights(): Promise<ScoringWeights> {
  const rows = await scoringWeightsCol().find({}).toArray();

  if (rows.length === 0) {
    return { ...DEFAULT_SCORING_WEIGHTS };
  }

  const weights: Record<string, number> = {};
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
    engagementHistory: weights.engagementHistory ?? DEFAULT_SCORING_WEIGHTS.engagementHistory,
  };
}

// ─── Dimension Scorers (each returns 0-100) ───

function scoreIcpFit(lead: EnrichedLead): { score: number; reasoning: string } {
  let score = 50; // baseline
  const reasons: string[] = [];

  // Has verified email
  if (lead.contactEmail) {
    score += 10;
    reasons.push("Verified email available");
  }

  // Has LinkedIn
  if (lead.contactLinkedIn) {
    score += 10;
    reasons.push("LinkedIn profile found");
  }

  // Has company details
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
    reasoning: reasons.join(". ") || "Basic ICP match",
  };
}

function scoreSeniority(lead: EnrichedLead): { score: number; reasoning: string } {
  const seniorityScores: Record<string, number> = {
    "C-Level": 95,
    VP: 85,
    Director: 70,
    Manager: 55,
    "Individual Contributor": 30,
  };

  const score = seniorityScores[lead.seniority || ""] || 40;
  return {
    score,
    reasoning: `${lead.seniority || "Unknown"} seniority — ${lead.contactTitle}`,
  };
}

function scoreGeography(lead: EnrichedLead): { score: number; reasoning: string } {
  const hq = (lead.headquarters || "").toLowerCase();

  // Higher scores for key tech hubs
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

function scoreIndustryRelevance(lead: EnrichedLead): { score: number; reasoning: string } {
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

function scoreCompanySize(lead: EnrichedLead): { score: number; reasoning: string } {
  const sizeScores: Record<string, number> = {
    "1-10": 30,
    "11-50": 55,
    "51-200": 80,
    "201-500": 90,
    "501-1000": 85,
    "1000+": 70,
  };

  const score = sizeScores[lead.companySize || ""] || 50;
  return {
    score,
    reasoning: `Company size: ${lead.companySize || "Unknown"} employees`,
  };
}

function scoreFundingStage(lead: EnrichedLead): { score: number; reasoning: string } {
  const stageScores: Record<string, number> = {
    Seed: 45,
    "Series A": 70,
    "Series B": 90,
    "Series C": 85,
    Growth: 75,
    Public: 50,
  };

  const score = stageScores[lead.fundingStage || ""] || 40;
  const extra = lead.fundingAmount ? ` (${lead.fundingAmount})` : "";
  return {
    score,
    reasoning: `${lead.fundingStage || "Unknown"} stage${extra}`,
  };
}

function scoreSignalStrength(signals: SignalBundle): { score: number; reasoning: string } {
  if (!signals || signals.signals.length === 0) {
    return { score: 20, reasoning: "No recent signals detected" };
  }

  const strengthMap = { HIGH: 30, MEDIUM: 20, LOW: 10 };
  let totalScore = 0;

  for (const signal of signals.signals) {
    const base = strengthMap[signal.strength];
    totalScore += base * signal.recencyWeight;
  }

  // Normalize to 0-100
  const score = Math.min(100, Math.round(totalScore));
  const topSignal = signals.topSignal;
  const reasoning = topSignal
    ? `${signals.signals.length} signals found — top: "${topSignal.title}" (${topSignal.strength}, ${topSignal.recencyDays}d ago)`
    : `${signals.signals.length} signals found`;

  return { score, reasoning };
}

function scoreLinkedinActivity(signals: SignalBundle): { score: number; reasoning: string } {
  const activityScore = signals?.linkedinActivityScore || 0;
  return {
    score: activityScore,
    reasoning: `LinkedIn activity score: ${activityScore}/100`,
  };
}

function scoreEngagementHistory(_lead: EnrichedLead): { score: number; reasoning: string } {
  // For new leads, no engagement history — return baseline
  // Agent 10 will update this weight based on previous campaign outcomes
  return {
    score: 50,
    reasoning: "No prior engagement history (new lead)",
  };
}

// ─── Main Agent Function ───

export async function runIntentScorerAgent(
  lead: EnrichedLead,
  signals: SignalBundle
): Promise<IntentScore> {
  const startTime = Date.now();

  sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "running");

  try {
    // Load dynamic weights from DB
    const weights = await loadWeights();

    // Score each dimension
    const dimensionResults: Array<{ name: string; result: { score: number; reasoning: string }; weight: number }> = [
      { name: "ICP Fit", result: scoreIcpFit(lead), weight: weights.icpFit },
      { name: "Seniority", result: scoreSeniority(lead), weight: weights.seniority },
      { name: "Geography", result: scoreGeography(lead), weight: weights.geography },
      { name: "Industry Relevance", result: scoreIndustryRelevance(lead), weight: weights.industryRelevance },
      { name: "Company Size", result: scoreCompanySize(lead), weight: weights.companySize },
      { name: "Funding Stage", result: scoreFundingStage(lead), weight: weights.fundingStage },
      { name: "Signal Strength", result: scoreSignalStrength(signals), weight: weights.signalStrength },
      { name: "LinkedIn Activity", result: scoreLinkedinActivity(signals), weight: weights.linkedinActivity },
      { name: "Engagement History", result: scoreEngagementHistory(lead), weight: weights.engagementHistory },
    ];

    // Build ScoreDimension array
    const dimensions: ScoreDimension[] = dimensionResults.map((d) => ({
      name: d.name,
      rawScore: d.result.score,
      weight: d.weight,
      weightedScore: Math.round(d.result.score * d.weight * 100) / 100,
      reasoning: d.result.reasoning,
    }));

    // Calculate composite score (sum of weighted scores, normalized)
    const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
    const rawComposite = dimensions.reduce((sum, d) => sum + d.weightedScore, 0);
    const compositeScore = Math.round(rawComposite / totalWeight);

    // Determine tier
    let tier: IntentScore["tier"];
    if (compositeScore >= 75) tier = "HOT";
    else if (compositeScore >= 55) tier = "WARM";
    else if (compositeScore >= 35) tier = "COOL";
    else tier = "COLD";

    // Top contributors
    const sorted = [...dimensions].sort((a, b) => b.weightedScore - a.weightedScore);
    const topContributors = sorted.slice(0, 3).map((d) => d.name);

    const intentScore: IntentScore = {
      leadId: lead.id,
      compositeScore,
      tier,
      dimensions,
      topContributors,
      generatedAt: new Date().toISOString(),
    };

    // Persist to DB
    await intentScoresCol().insertOne({
      _id: nanoid(),
      leadId: lead.id,
      compositeScore,
      tier,
      dimensions: JSON.stringify(dimensions),
      topContributors: JSON.stringify(topContributors),
      generatedAt: intentScore.generatedAt,
    });

    const durationMs = Date.now() - startTime;
    const summary = `Score: ${compositeScore}/100 (${tier}) — Top: ${topContributors.join(", ")}`;

    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "complete", summary);
    sseManager.emit("score_update", lead.id, intentScore);

    console.log(`✅ Agent 3 complete in ${durationMs}ms — ${summary}`);
    return intentScore;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "error", undefined, errMsg);
    throw error;
  }
}
