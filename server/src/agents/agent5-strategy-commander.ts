import { nanoid } from "nanoid";
import { strategiesCol } from "../db/index.js";
import { sseManager } from "../lib/sse.js";
import type {
  EnrichedLead,
  SignalBundle,
  IntentScore,
  PersonaProfile,
  OutreachStrategy,
  OutreachChannel,
  ToneFramework,
  TouchPoint,
  StrategyDecision,
} from "../types/index.js";

const AGENT_NUMBER = 5;
const AGENT_NAME = "Strategy Commander";

// ─── Channel Selection Logic ───

function selectPrimaryChannel(
  lead: EnrichedLead,
  signals: SignalBundle,
  intent: IntentScore,
  persona: PersonaProfile
): { primary: OutreachChannel; secondary?: OutreachChannel; decisions: StrategyDecision[] } {
  const decisions: StrategyDecision[] = [];

  // 1. LinkedIn priority: recent LinkedIn activity or C-level persona
  const hasLinkedIn = !!lead.contactLinkedIn;
  const linkedInActive = signals.linkedinActivityScore > 40;
  const isExecutive = persona.archetype === "strategic_executive";

  // 2. Email priority: verified email available
  const hasEmail = !!lead.contactEmail;

  // 3. WhatsApp priority: India-based + HOT lead
  const isIndia = (lead.headquarters || "").toLowerCase().includes("india") ||
    (lead.headquarters || "").toLowerCase().includes("bangalore") ||
    (lead.headquarters || "").toLowerCase().includes("mumbai") ||
    (lead.headquarters || "").toLowerCase().includes("delhi") ||
    (lead.headquarters || "").toLowerCase().includes("hyderabad");
  const isHot = intent.tier === "HOT";

  let primary: OutreachChannel;
  let secondary: OutreachChannel | undefined;

  // Decision tree
  if (hasLinkedIn && linkedInActive && isExecutive) {
    primary = "linkedin_dm";
    secondary = hasEmail ? "email" : undefined;
    decisions.push({
      decision: "LinkedIn DM as primary channel",
      reasoning: `${lead.contactName} (${lead.contactTitle}) is a ${persona.archetypeLabel} with active LinkedIn presence (score: ${signals.linkedinActivityScore}/100). LinkedIn DMs have 3x higher open rates for ${lead.seniority || "senior"}-level executives compared to cold email.`,
      factors: [`LinkedIn activity: ${signals.linkedinActivityScore}/100`, `Persona: ${persona.archetypeLabel}`, `Profile: ${lead.contactLinkedIn || "found"}`, `Email ${hasEmail ? lead.contactEmail : "not available"} as backup`],
    });
  } else if (isIndia && isHot) {
    primary = "whatsapp";
    secondary = hasEmail ? "email" : hasLinkedIn ? "linkedin_dm" : undefined;
    decisions.push({
      decision: "WhatsApp as primary channel",
      reasoning: `${lead.contactName} is based in ${lead.headquarters || "India"} and scored ${intent.compositeScore}/100 (HOT). WhatsApp has 95%+ open rates in India — ideal for high-urgency outreach to ${lead.contactTitle}s in the ${lead.industry || "tech"} space.`,
      factors: [`Location: ${lead.headquarters}`, `Intent score: ${intent.compositeScore}/100 (HOT)`, `Phone: ${lead.contactPhone || "available"}`, `Industry: ${lead.industry || "technology"}`],
    });
  } else if (hasEmail) {
    primary = "email";
    secondary = hasLinkedIn ? "linkedin_dm" : undefined;
    decisions.push({
      decision: "Email as primary channel",
      reasoning: `${lead.contactEmail} is verified for ${lead.contactName}. Email enables rich content delivery with tracking — ideal for the ${persona.preferredTone} approach needed for ${persona.archetypeLabel} personas at ${lead.companyName}.`,
      factors: [`Email: ${lead.contactEmail}`, `Persona: ${persona.archetypeLabel}`, hasLinkedIn ? `LinkedIn backup: ${lead.contactLinkedIn}` : "No LinkedIn profile found", `Company: ${lead.companyName} (${lead.companySize || "unknown"} employees)`],
    });
  } else if (hasLinkedIn) {
    primary = "linkedin_dm";
    secondary = undefined;
    decisions.push({
      decision: "LinkedIn DM as primary (only available channel)",
      reasoning: "No verified email — LinkedIn is the only reachable channel",
      factors: ["No email available", "Has LinkedIn profile"],
    });
  } else {
    primary = "email";
    decisions.push({
      decision: "Email as fallback primary",
      reasoning: "Limited contact info — email is the most reliable default",
      factors: ["No LinkedIn found", "Using company domain for outreach"],
    });
  }

  return { primary, secondary, decisions };
}

// ─── Tone Framework Selection ───

function selectToneFramework(
  persona: PersonaProfile,
  intent: IntentScore
): { tone: ToneFramework; decision: StrategyDecision } {
  const toneMap: Record<string, ToneFramework> = {
    strategic_executive: "insight_led",
    practitioner: "peer_problem",
    innovator: "challenger",
    networker: "relationship_first",
  };

  let tone = toneMap[persona.archetype] || "insight_led";

  // Override: HOT leads with urgency signals get growth_urgency
  if (intent.tier === "HOT" && intent.compositeScore >= 85) {
    tone = "growth_urgency";
  }

  const toneLabels: Record<ToneFramework, string> = {
    insight_led: "Insight-Led (data, ROI, strategic value)",
    peer_problem: "Peer Problem (technical empathy, problem-specific)",
    challenger: "Challenger (question status quo, bold vision)",
    relationship_first: "Relationship-First (mutual value, low-pressure)",
    growth_urgency: "Growth Urgency (time-sensitive opportunity)",
  };

  return {
    tone,
    decision: {
      decision: `Tone: ${toneLabels[tone]}`,
      reasoning: `Based on ${persona.archetypeLabel} persona (${Math.round(persona.confidence * 100)}% confidence) and ${intent.tier} intent`,
      factors: [
        `Persona: ${persona.archetypeLabel}`,
        `Intent: ${intent.tier} (${intent.compositeScore}/100)`,
        `Preferred tone: ${persona.preferredTone}`,
      ],
    },
  };
}

// ─── Timing & Cadence Logic ───

function buildCadence(
  lead: EnrichedLead,
  primary: OutreachChannel,
  secondary: OutreachChannel | undefined,
  tone: ToneFramework,
  intent: IntentScore
): { cadence: TouchPoint[]; sendTimestamp: string; timezone: string; decision: StrategyDecision } {
  // Determine timezone from headquarters
  const hq = (lead.headquarters || "").toLowerCase();
  let timezone = "America/New_York"; // default
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

  // Optimal send time: Tuesday 9:30 AM local time
  const now = new Date();
  const currentDay = now.getUTCDay(); // 0=Sun, 1=Mon, 2=Tue, ..., 6=Sat
  let daysUntilTuesday = (2 - currentDay + 7) % 7; // Next Tuesday (day 2)
  if (daysUntilTuesday === 0) daysUntilTuesday = 7; // If today is Tuesday, schedule for next Tuesday

  const sendDate = new Date(now);
  sendDate.setUTCDate(sendDate.getUTCDate() + daysUntilTuesday);
  sendDate.setUTCHours(9 - offsetHours, 30, 0, 0); // 9:30 AM local

  const sendTimestamp = sendDate.toISOString();

  // Cadence intervals based on intent tier
  const intervals: Record<string, [number, number, number]> = {
    HOT: [0, 2, 5],      // Aggressive: Touch 1, +2 days, +5 days
    WARM: [0, 3, 7],     // Moderate
    COOL: [0, 5, 12],    // Patient
    COLD: [0, 7, 14],    // Very patient
  };

  const [d1, d2, d3] = intervals[intent.tier] || intervals.WARM;

  // Build 3-touch cadence with channel variation
  const touch1Date = new Date(sendDate);
  const touch2Date = new Date(sendDate);
  touch2Date.setUTCDate(touch2Date.getUTCDate() + d2);
  const touch3Date = new Date(sendDate);
  touch3Date.setUTCDate(touch3Date.getUTCDate() + d3);

  const cadence: TouchPoint[] = [
    {
      touchNumber: 1,
      channel: primary,
      scheduledAt: touch1Date.toISOString(),
      dayOffset: d1,
      toneFramework: tone,
    },
    {
      touchNumber: 2,
      channel: secondary || primary, // Switch channel if available
      scheduledAt: touch2Date.toISOString(),
      dayOffset: d2,
      toneFramework: tone,
    },
    {
      touchNumber: 3,
      channel: primary, // Return to primary for final touch
      scheduledAt: touch3Date.toISOString(),
      dayOffset: d3,
      toneFramework: tone,
    },
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
        `First send: ${sendTimestamp}`,
      ],
    },
  };
}

// ─── Main Agent Function ───

export async function runStrategyCommanderAgent(
  lead: EnrichedLead,
  signals: SignalBundle,
  intent: IntentScore,
  persona: PersonaProfile
): Promise<OutreachStrategy> {
  const startTime = Date.now();

  sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "running");

  try {
    // 1. Select channels
    const { primary, secondary, decisions: channelDecisions } = selectPrimaryChannel(lead, signals, intent, persona);

    // 2. Select tone framework
    const { tone, decision: toneDecision } = selectToneFramework(persona, intent);

    // 3. Build cadence with timing
    const { cadence, sendTimestamp, timezone, decision: cadenceDecision } = buildCadence(
      lead, primary, secondary, tone, intent
    );

    const allDecisions = [...channelDecisions, toneDecision, cadenceDecision];

    const strategy: OutreachStrategy = {
      leadId: lead.id,
      primaryChannel: primary,
      secondaryChannel: secondary,
      sendTimestamp,
      timezone,
      toneFramework: tone,
      cadence,
      decisions: allDecisions,
      generatedAt: new Date().toISOString(),
    };

    // Persist to DB
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
      generatedAt: strategy.generatedAt,
    });

    const durationMs = Date.now() - startTime;
    const summary = `${primary}${secondary ? " + " + secondary : ""} | ${tone} | ${cadence.length}-touch over ${cadence[cadence.length - 1].dayOffset}d`;

    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "complete", summary);
    sseManager.emit("strategy_update", lead.id, strategy);

    console.log(`✅ Agent 5 complete in ${durationMs}ms — ${summary}`);
    return strategy;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "error", undefined, errMsg);
    throw error;
  }
}
