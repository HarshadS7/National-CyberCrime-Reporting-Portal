import { nanoid } from "nanoid";
import { config } from "../config.js";
import { generatedContentCol } from "../db/index.js";
import { sseManager } from "../lib/sse.js";
import { llmGenerateText } from "../lib/llm.js";
import type {
  EnrichedLead,
  SignalBundle,
  IntentScore,
  PersonaProfile,
  OutreachStrategy,
  GeneratedContent,
  TouchContent,
  OutreachChannel,
  ToneFramework,
} from "../types/index.js";

const AGENT_NUMBER = 6;
const AGENT_NAME = "Content Forge";

// ─── Tone Framework Descriptions ───

const TONE_GUIDES: Record<ToneFramework, string> = {
  insight_led: `Insight-Led: Lead with a data point or industry insight the recipient hasn't considered. Frame your product as the answer to a strategic shift. Be concise, executive-level, ROI-focused.`,
  peer_problem: `Peer Problem: Speak as a technical peer who understands their specific pain. Reference concrete technical challenges. Be specific, credible, jargon-appropriate but not salesy.`,
  challenger: `Challenger: Question the status quo. Present a bold, slightly provocative perspective on their industry. Make them think differently. Be confident, visionary, not arrogant.`,
  relationship_first: `Relationship-First: Build rapport before pitching. Find genuine common ground. Be warm, conversational, zero-pressure. Focus on mutual value and long-term relationship.`,
  growth_urgency: `Growth Urgency: This is a time-sensitive opportunity. The lead is very hot — act with appropriate urgency without being desperate. Highlight competitive advantage and market timing.`,
};

const CHANNEL_GUIDES: Record<OutreachChannel, { maxLength: number; format: string }> = {
  linkedin_dm: {
    maxLength: 300,
    format: "Short, conversational, no subject line. Max 300 chars. Personal and direct. No HTML.",
  },
  email: {
    maxLength: 800,
    format: "Professional email with clear subject line. 3-5 short paragraphs max. Include a specific CTA. Plain text preferred.",
  },
  whatsapp: {
    maxLength: 200,
    format: "Ultra-short, mobile-friendly. Max 200 chars. Casual but professional. Use line breaks. No HTML.",
  },
};

// ─── Content Generation ───

function buildContentPrompt(
  lead: EnrichedLead,
  signals: SignalBundle,
  intent: IntentScore,
  persona: PersonaProfile,
  strategy: OutreachStrategy,
  touchNumber: 1 | 2 | 3,
  channel: OutreachChannel
): string {
  const toneGuide = TONE_GUIDES[strategy.toneFramework];
  const channelGuide = CHANNEL_GUIDES[channel];

  const topSignal = signals.topSignal
    ? `Their top signal: "${signals.topSignal.title}" (${signals.topSignal.category}, ${signals.topSignal.strength} strength)`
    : "No recent signals detected";

  const touchGuide =
    touchNumber === 1
      ? "This is the FIRST touch — introduce yourself and the value proposition. Hook with an insight."
      : touchNumber === 2
        ? "This is the SECOND touch (follow-up). Reference the first message briefly. Add new value — share a relevant case study, data point, or resource."
        : "This is the THIRD and FINAL touch. Create gentle urgency. Offer a concrete next step (e.g. '15-min call this Thursday?'). Make it easy to say yes or no.";

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

async function generateTouchContent(
  lead: EnrichedLead,
  signals: SignalBundle,
  intent: IntentScore,
  persona: PersonaProfile,
  strategy: OutreachStrategy,
  touchNumber: 1 | 2 | 3,
  channel: OutreachChannel
): Promise<TouchContent> {
  const prompt = buildContentPrompt(lead, signals, intent, persona, strategy, touchNumber, channel);

  const systemPrompt = `You are an elite B2B copywriter who writes hyper-personalized outreach messages. Every message must feel hand-crafted, not templated. Never use generic phrases like "I hope this finds you well" or "I wanted to reach out". Be specific, concise, and human.`;

  const response = await llmGenerateText(systemPrompt, prompt);

  let subject: string | undefined;
  let body: string;

  if (channel === "email") {
    const subjectMatch = response.match(/SUBJECT:\s*(.+?)(?:\n|$)/i);
    subject = subjectMatch ? subjectMatch[1].trim() : `Quick note for ${lead.contactName}`;
    body = response
      .replace(/SUBJECT:\s*.+?\n/i, "")
      .trim();
  } else {
    body = response.trim();
  }

  // Trim to max length
  const maxLen = CHANNEL_GUIDES[channel].maxLength;
  if (body.length > maxLen * 1.5) {
    body = body.slice(0, maxLen) + "...";
  }

  return {
    touchNumber,
    channel,
    subject,
    body,
    preview: body.slice(0, 100),
  };
}

// ─── LinkedIn Post + Headline (bonus content for visibility) ───

async function generateLinkedInPost(
  lead: EnrichedLead,
  signals: SignalBundle,
  persona: PersonaProfile
): Promise<string> {
  const systemPrompt = `You are a LinkedIn thought-leadership ghostwriter. Write posts that get engagement from B2B decision-makers. Posts should be 150-200 words, use short paragraphs, and end with a question or CTA.`;

  const prompt = `Write a LinkedIn post that would resonate with ${lead.contactTitle}s in the ${lead.industry || "tech"} industry. Topic should relate to: ${signals.topSignal?.title || "industry trends"}. The reader is a ${persona.archetypeLabel} archetype who values ${persona.traits.slice(0, 2).join(" and ")}.

Write as if YOU are posting (first person). The post should position the reader's company type as innovative. Do NOT mention any specific product or company name. Keep it to 150-200 words.`;

  return llmGenerateText(systemPrompt, prompt);
}

async function generateHeadlineSuggestion(
  lead: EnrichedLead,
  persona: PersonaProfile
): Promise<string> {
  const systemPrompt = `You suggest LinkedIn headline improvements for B2B professionals. Headlines should be value-oriented, specific, and under 120 characters.`;

  const prompt = `Suggest a LinkedIn headline for someone who wants to appeal to ${persona.archetypeLabel} personas like ${lead.contactTitle}s. Current context: selling to ${lead.industry || "technology"} companies. Return ONLY the headline text, nothing else.`;

  return llmGenerateText(systemPrompt, prompt);
}

// ─── Simulation Fallback ───

function simulateContent(
  lead: EnrichedLead,
  strategy: OutreachStrategy,
  persona: PersonaProfile,
  intent: IntentScore
): GeneratedContent {
  const touches: TouchContent[] = strategy.cadence.map((tp) => {
    const isEmail = tp.channel === "email";
    const isLinkedIn = tp.channel === "linkedin_dm";

    const templates: Record<string, Record<number, { subject?: string; body: string }>> = {
      email: {
        1: {
          subject: `${lead.companyName}'s ${lead.industry || "growth"} trajectory — quick thought`,
          body: `Hi ${lead.contactName},\n\nI noticed ${lead.companyName} has been making moves in ${lead.industry || "the industry"} — ${intent.tier === "HOT" ? "particularly impressive" : "interesting to see"} given the current market dynamics.\n\n${persona.archetype === "strategic_executive" ? "From a strategic perspective" : persona.archetype === "practitioner" ? "From a technical standpoint" : "Looking at the bigger picture"}, there's an angle I think could accelerate what your team is building.\n\nWorth a 15-minute conversation this week?\n\nBest,\nAlex from NERVE`,
        },
        2: {
          subject: `Re: Following up — ${lead.companyName}`,
          body: `Hi ${lead.contactName},\n\nWanted to share a quick data point: companies similar to ${lead.companyName} in ${lead.industry || "your space"} saw 40% improvement in outreach efficiency after optimizing their approach.\n\nI put together a brief analysis specific to your situation. Happy to walk through it in 10 minutes.\n\nCheers,\nAlex from NERVE`,
        },
        3: {
          subject: `Last note — ${lead.contactName}`,
          body: `Hi ${lead.contactName},\n\nI'll keep this short — I genuinely think there's mutual value in connecting, but I respect your time.\n\nIf the timing isn't right, no worries at all. If it is, here's my Calendly: calendly.com/nerve-demo\n\nEither way, wishing ${lead.companyName} continued success.\n\nBest,\nAlex from NERVE`,
        },
      },
      linkedin_dm: {
        1: { body: `Hey ${lead.contactName} 👋 Saw ${lead.companyName} is ${intent.tier === "HOT" ? "crushing it" : "making moves"} in ${lead.industry || "the space"}. ${persona.archetype === "strategic_executive" ? "Your leadership approach caught my eye." : "The technical work your team is doing is impressive."} Would love to connect and share a thought.` },
        2: { body: `Hi ${lead.contactName}, following up — I came across something specific to ${lead.companyName}'s situation that I think you'd find valuable. Mind if I share a quick insight?` },
        3: { body: `${lead.contactName} — last ping, promise! 😄 Open to a quick 10-min chat this week? If not, totally understand. Here either way.` },
      },
      whatsapp: {
        1: { body: `Hi ${lead.contactName}! 👋\n\nQuick one — saw ${lead.companyName}'s recent ${lead.industry || "growth"} moves. Have a relevant insight to share.\n\nOpen to a quick chat?` },
        2: { body: `Hey ${lead.contactName} 👋\n\nFollowing up — put together a brief analysis for ${lead.companyName}. Worth 5 mins?` },
        3: { body: `Hi ${lead.contactName} — final note! Open to connecting this week?\n\nNo pressure either way 🙏` },
      },
    };

    const channelKey = tp.channel === "linkedin_dm" ? "linkedin_dm" : tp.channel;
    const template = templates[channelKey]?.[tp.touchNumber] || { body: `Hi ${lead.contactName}, reaching out regarding ${lead.companyName}.` };

    return {
      touchNumber: tp.touchNumber,
      channel: tp.channel,
      subject: template.subject,
      body: template.body,
      preview: template.body.slice(0, 100),
    };
  });

  return {
    leadId: lead.id,
    touches,
    linkedinPost: `🚀 The ${lead.industry || "B2B"} landscape is shifting.\n\nCompanies that adapt their outreach strategy now will have a 6-month head start.\n\nHere's what I'm seeing:\n\n1. Personalization at scale isn't optional anymore\n2. Multi-channel beats single-channel 3x\n3. AI-driven signals > gut feelings\n\nThe teams winning right now? They're the ones treating outreach as a product, not a task.\n\nWhat's the biggest shift you've seen in how your buyers want to be reached?\n\n#B2B #SalesStrategy #OutreachInnovation`,
    linkedinHeadlineSuggestion: `Helping ${lead.industry || "B2B"} teams turn cold outreach into warm conversations | AI-Powered Personalization`,
    generatedAt: new Date().toISOString(),
  };
}

// ─── Main Agent Function ───

export async function runContentForgeAgent(
  lead: EnrichedLead,
  signals: SignalBundle,
  intent: IntentScore,
  persona: PersonaProfile,
  strategy: OutreachStrategy
): Promise<GeneratedContent> {
  const startTime = Date.now();

  sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "running");

  try {
    let content: GeneratedContent;

    // Check if LLM key is available — don't waste a test call
    const hasLlmKey = !!(config.groqApiKey && config.groqApiKey.length > 10);
    const isSimulated = !hasLlmKey || config.simulationMode;

    if (isSimulated) {
      // Use rich template-based simulation
      content = simulateContent(lead, strategy, persona, intent);
    } else {
      // Generate real content with Groq (Llama 3.3 70B)
      const touchPromises = strategy.cadence.map((tp) =>
        generateTouchContent(lead, signals, intent, persona, strategy, tp.touchNumber, tp.channel)
      );

      const [touches, linkedinPost, headlineSuggestion] = await Promise.all([
        Promise.all(touchPromises),
        generateLinkedInPost(lead, signals, persona).catch(() => undefined),
        generateHeadlineSuggestion(lead, persona).catch(() => undefined),
      ]);

      content = {
        leadId: lead.id,
        touches,
        linkedinPost: linkedinPost || undefined,
        linkedinHeadlineSuggestion: headlineSuggestion || undefined,
        generatedAt: new Date().toISOString(),
      };
    }

    // Persist each touch to DB
    for (const touch of content.touches) {
      await generatedContentCol().insertOne({
        _id: nanoid(),
        leadId: lead.id,
        touchNumber: touch.touchNumber,
        channel: touch.channel,
        subject: touch.subject || null,
        body: touch.body,
        preview: touch.preview,
        generatedAt: content.generatedAt,
      });
    }

    const durationMs = Date.now() - startTime;
    const summary = `${content.touches.length} touches generated | ${content.touches.map((t) => `T${t.touchNumber}:${t.channel}`).join(", ")}${content.linkedinPost ? " + LI post" : ""}`;

    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "complete", summary);
    sseManager.emit("content_update", lead.id, content);

    console.log(`✅ Agent 6 complete in ${durationMs}ms — ${summary}`);
    return content;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "error", undefined, errMsg);
    throw error;
  }
}
