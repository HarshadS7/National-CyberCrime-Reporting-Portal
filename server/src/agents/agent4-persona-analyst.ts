import { nanoid } from "nanoid";
import { config } from "../config.js";
import { personaProfilesCol } from "../db/index.js";
import { sseManager } from "../lib/sse.js";
import { llmGenerateText } from "../lib/llm.js";
import type {
  EnrichedLead,
  PersonaProfile,
  PersonaArchetype,
} from "../types/index.js";

const AGENT_NUMBER = 4;
const AGENT_NAME = "Persona Analyst";

// ─── LLM-Based Classification ───

const SYSTEM_PROMPT = `You are an expert B2B buyer persona analyst. Given a lead's professional details, classify them into EXACTLY ONE of four communication archetypes:

1. "strategic_executive" — C-level / VP / senior leadership who respond to insight-led, ROI-focused, big-picture messaging. They care about business impact, competitive advantage, and revenue growth.

2. "practitioner" — Hands-on technical leaders (Engineering Managers, Tech Leads, Senior ICs) who respond to peer-level, problem-specific messaging. They care about technical quality, efficiency, and solving real problems.

3. "innovator" — Forward-thinking leaders (Heads of Product, Innovation Officers, startup founders) who respond to challenger framing that questions the status quo. They care about disruption, new approaches, and being first-movers.

4. "networker" — Relationship-oriented leaders (Business Development, Partnerships, Community leads) who respond to relationship-first, low-pressure messaging. They care about mutual value, connections, and long-term partnerships.

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

async function classifyWithLLM(lead: EnrichedLead): Promise<PersonaProfile> {
  const userMessage = `Classify this lead:
- Name: ${lead.contactName}
- Title: ${lead.contactTitle}
- Seniority: ${lead.seniority || "Unknown"}
- Company: ${lead.companyName}
- Domain: ${lead.companyDomain || "Unknown"}
- Industry: ${lead.industry || "Unknown"}
- Company Size: ${lead.companySize || "Unknown"} employees
- Funding Stage: ${lead.fundingStage || "Unknown"}${lead.fundingAmount ? ` (${lead.fundingAmount})` : ""}
- Headquarters: ${lead.headquarters || "Unknown"}
- Tech Stack: ${lead.techStack?.join(", ") || "Unknown"}
- LinkedIn: ${lead.contactLinkedIn || "Not available"}

Context for classification: What does "${lead.contactTitle}" at a ${lead.companySize || "mid-size"}-employee ${lead.industry || "tech"} company (${lead.fundingStage || "growth"} stage) tell you about their daily priorities, communication style, and what messaging would resonate?`;

  try {
    const response = await llmGenerateText(SYSTEM_PROMPT, userMessage);

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as {
        archetype: PersonaArchetype;
        archetypeLabel: string;
        confidence: number;
        traits: string[];
        communicationStyle: string;
        preferredTone: string;
        avoidInMessaging: string[];
        reasoning: string;
      };

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
        generatedAt: new Date().toISOString(),
      };
    }

    // If JSON parsing fails, fallback to rule-based
    return classifyWithRules(lead);
  } catch {
    // Fallback to rule-based classification
    return classifyWithRules(lead);
  }
}

// ─── Rule-Based Fallback (used when LLM is unavailable or in simulation) ───

function classifyWithRules(lead: EnrichedLead): PersonaProfile {
  const title = (lead.contactTitle || "").toLowerCase();
  const seniority = lead.seniority || "";

  let archetype: PersonaArchetype;
  let archetypeLabel: string;
  let confidence: number;
  let traits: string[];
  let communicationStyle: string;
  let preferredTone: string;
  let avoidInMessaging: string[];
  let reasoning: string;

  // Classification rules
  if (
    seniority === "C-Level" ||
    seniority === "VP" ||
    title.includes("chief") ||
    title.includes("vp ") ||
    title.includes("vice president") ||
    title.includes("head of")
  ) {
    archetype = "strategic_executive";
    archetypeLabel = "Strategic Executive";
    confidence = 0.85;
    traits = ["ROI-focused", "Big-picture thinker", "Time-constrained", "Decision maker"];
    communicationStyle = "Concise, data-backed, outcome-oriented";
    preferredTone = "Insight-led, executive-level, ROI-focused";
    avoidInMessaging = ["Technical jargon", "Feature lists", "Long messages", "Generic pitches"];
    reasoning = `${lead.contactTitle} at ${lead.companyName} is a senior leader (${seniority}). Executives at this level respond best to insight-led messaging that demonstrates ROI and strategic value rather than technical details.`;
  } else if (
    title.includes("engineer") ||
    title.includes("developer") ||
    title.includes("architect") ||
    title.includes("technical") ||
    title.includes("cto") ||
    (seniority === "Director" && title.includes("engineering"))
  ) {
    archetype = "practitioner";
    archetypeLabel = "Practitioner";
    confidence = 0.80;
    traits = ["Detail-oriented", "Technically curious", "Problem-solver", "Values efficiency"];
    communicationStyle = "Technical, specific, peer-to-peer";
    preferredTone = "Peer-level, problem-specific, technically credible";
    avoidInMessaging = ["Marketing fluff", "Buzzwords", "Vague claims", "Pressure tactics"];
    reasoning = `${lead.contactTitle} is a technical practitioner who will respond best to peer-level messaging that addresses specific technical challenges and demonstrates credibility.`;
  } else if (
    title.includes("product") ||
    title.includes("innovation") ||
    title.includes("founder") ||
    title.includes("strategy")
  ) {
    archetype = "innovator";
    archetypeLabel = "Innovator";
    confidence = 0.75;
    traits = ["Forward-thinking", "Risk-tolerant", "Status-quo challenger", "Visionary"];
    communicationStyle = "Bold, thought-provoking, challenging";
    preferredTone = "Challenger framing, questions assumptions, paints a new future";
    avoidInMessaging = ["Conservative language", "Incremental improvements", "Risk-averse framing"];
    reasoning = `${lead.contactTitle} in ${lead.industry || "tech"} is likely an innovator archetype — they respond to messaging that challenges conventional approaches and paints a vision of what's possible.`;
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
    generatedAt: new Date().toISOString(),
  };
}

// ─── Main Agent Function ───

export async function runPersonaAnalystAgent(lead: EnrichedLead): Promise<PersonaProfile> {
  const startTime = Date.now();

  sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "running");

  try {
    let profile: PersonaProfile;

    // Use LLM if available and not in simulation, otherwise fall back to rules
    if (!config.simulationMode && config.groqApiKey && config.groqApiKey !== "" && config.groqApiKey.length > 10) {
      profile = await classifyWithLLM(lead);
    } else {
      profile = classifyWithRules(lead);
    }

    // Persist to DB
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
      generatedAt: profile.generatedAt,
    });

    const durationMs = Date.now() - startTime;
    const summary = `Archetype: ${profile.archetypeLabel} (${Math.round(profile.confidence * 100)}% confidence) — Tone: ${profile.preferredTone.slice(0, 50)}`;

    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "complete", summary);
    sseManager.emit("score_update", lead.id, {
      agent: AGENT_NAME,
      persona: profile,
    });

    console.log(`✅ Agent 4 complete in ${durationMs}ms — ${summary}`);
    return profile;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "error", undefined, errMsg);
    throw error;
  }
}
