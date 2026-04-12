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
  intent: IntentScore,
  signals: SignalBundle
): GeneratedContent {
  // Extract signal context for personalization
  const topSignalRef = signals.topSignal
    ? `${signals.topSignal.title}`
    : `${lead.companyName}'s growth in ${lead.industry || "the market"}`;
  const techRef = lead.techStack?.length
    ? `your ${lead.techStack.slice(0, 2).join("/")} stack`
    : "your engineering infrastructure";
  const fundingRef = lead.fundingStage && lead.fundingAmount
    ? `${lead.fundingStage} (${lead.fundingAmount})`
    : lead.fundingStage || "growth stage";

  const touches: TouchContent[] = strategy.cadence.map((tp) => {
    const isEmail = tp.channel === "email";
    const isLinkedIn = tp.channel === "linkedin_dm";

    const templates: Record<string, Record<number, { subject?: string; body: string }>> = {
      email: {
        1: {
          subject: `${topSignalRef} — a thought for ${lead.contactTitle}s`,
          body: `Hi ${lead.contactName},\n\nI was reading about ${topSignalRef} and it got me thinking about ${lead.companyName}'s trajectory.${lead.companySize ? ` As a ${lead.companySize}-person ${lead.industry || "tech"} company` : ""} at the ${fundingRef} stage, you're likely navigating the challenge of scaling ${persona.archetype === "practitioner" ? techRef : persona.archetype === "strategic_executive" ? "revenue operations" : "your go-to-market motion"} without losing the agility that got you here.\n\n${persona.archetype === "strategic_executive" ? `As ${lead.contactTitle}, you probably see this from the ROI lens — every tool needs to demonstrably move the needle on revenue or efficiency.` : persona.archetype === "practitioner" ? `As ${lead.contactTitle}, you likely care most about whether a solution actually solves the specific pain or just adds another dashboard to ignore.` : persona.archetype === "innovator" ? `As ${lead.contactTitle}, you're probably thinking about how to leapfrog the competition rather than just keeping pace.` : `As ${lead.contactTitle}, I imagine building the right partnerships is key to scaling ${lead.companyName}'s reach.`}\n\nI have a specific angle on this — would it be worth 15 minutes this ${new Date().getDay() <= 2 ? "Thursday" : "Tuesday"}?\n\nBest,\nAlex`,
        },
        2: {
          subject: `Re: Quick data point for ${lead.companyName}`,
          body: `Hi ${lead.contactName},\n\nFollowing up with something concrete — ${lead.industry || "technology"} companies at the ${fundingRef} stage that optimized their outreach approach saw:\n\n• 40% higher response rates from ${lead.seniority || "senior"}-level decision-makers\n• 3x pipeline velocity in the first quarter\n• 60% reduction in time-to-meeting\n\nI mapped out how this applies specifically to ${lead.companyName}'s ${lead.companySize ? lead.companySize + "-person team" : "team"} — happy to share in a 10-minute walkthrough.\n\n${persona.archetype === "practitioner" ? "No fluff, just the data and a technical demo." : persona.archetype === "strategic_executive" ? "I'll focus strictly on the business impact numbers." : "Happy to keep it casual — just a conversation."}\n\nCheers,\nAlex`,
        },
        3: {
          subject: `Closing the loop — ${lead.contactName}`,
          body: `Hi ${lead.contactName},\n\nLast note from me — I genuinely believe there's a fit between what we're building and where ${lead.companyName} is headed${lead.industry ? ` in ${lead.industry}` : ""}, but I also respect your time.\n\n${persona.archetype === "strategic_executive" ? "If this quarter isn't right, I'd be happy to reconnect when it makes sense strategically." : persona.archetype === "practitioner" ? "If you'd rather see a technical deep-dive first, I can send over documentation instead." : "If the timing isn't ideal, completely understood — the door is always open."}\n\nEither way, here's my calendar if you'd like to chat: calendly.com/nerve-demo\n\nWishing ${lead.companyName} continued momentum.\n\nBest,\nAlex`,
        },
      },
      linkedin_dm: {
        1: { body: `Hey ${lead.contactName} 👋 Noticed ${topSignalRef}${lead.companySize ? ` — scaling a ${lead.companySize}-person ${lead.industry || "tech"} team is no joke` : ""}. ${persona.archetype === "strategic_executive" ? `As ${lead.contactTitle}, curious how you're thinking about the ROI on outreach as ${lead.companyName} grows.` : persona.archetype === "practitioner" ? `As a fellow ${lead.industry || "tech"} person, your team's approach with ${techRef} caught my eye.` : `Love what ${lead.companyName} is building.`} Mind if I share a quick insight?` },
        2: { body: `Hi ${lead.contactName}, quick follow-up — found a data point specific to ${lead.industry || "your space"} at the ${fundingRef} stage that I think ${lead.companyName} would find useful. Worth a 5-min look?` },
        3: { body: `${lead.contactName} — last ping! 😄 Happy to connect whenever timing is right for ${lead.companyName}. No pressure either way.` },
      },
      whatsapp: {
        1: { body: `Hi ${lead.contactName}! 👋\n\nSaw ${topSignalRef} — impressive moves at ${lead.companyName}.\n\nHave a ${lead.industry || "market"}-specific insight for ${lead.contactTitle}s.\n\nQuick chat this week?` },
        2: { body: `Hey ${lead.contactName} 👋\n\nPut together a brief ${lead.industry || "market"} analysis for ${lead.companyName}.\n\n${persona.archetype === "practitioner" ? "Technical deep-dive, no fluff." : "5 mins, pure value."}\n\nWorth a look?` },
        3: { body: `Hi ${lead.contactName} — final note! 🙏\n\nOpen to connecting whenever works for ${lead.companyName}.\n\nCalendly: calendly.com/nerve-demo` },
      },
    };

    const channelKey = tp.channel === "linkedin_dm" ? "linkedin_dm" : tp.channel;
    const template = templates[channelKey]?.[tp.touchNumber] || { body: `Hi ${lead.contactName}, reaching out regarding ${lead.companyName}'s ${lead.industry || "growth"} trajectory.` };

    return {
      touchNumber: tp.touchNumber,
      channel: tp.channel,
      subject: template.subject,
      body: template.body,
      preview: template.body.slice(0, 100),
    };
  });

  // Industry-specific LinkedIn post
  const industryInsights: Record<string, string> = {
    "FinTech": "Payment infrastructure is becoming a strategic moat, not just plumbing.\n\nThe companies winning in FinTech right now aren't just processing transactions faster — they're turning payment data into predictive intelligence.",
    "SaaS": "The SaaS growth playbook from 2020 is dead.\n\nProduct-led growth alone isn't enough anymore. The winners are combining PLG with AI-driven outbound that feels hand-crafted.",
    "HealthTech": "Healthcare's digital transformation isn't coming — it's here.\n\nBut most HealthTech teams are building 2024 solutions for 2026 problems. The gap? Real-time data unification.",
    "EdTech": "The future of education isn't just online — it's personalized at scale.\n\nThe EdTech companies winning aren't those with the most content. They're the ones with the best learning intelligence.",
    "DevTools": "Developer experience is the new competitive advantage.\n\nEvery minute a developer spends fighting tooling is a minute they're not shipping value. The DevTools companies understand this.",
    "AI/ML": "The AI hype cycle is maturing into the AI value cycle.\n\nThe companies that will win aren't those with the biggest models — they're the ones solving specific, painful problems for specific users.",
  };

  const matchedIndustry = Object.keys(industryInsights).find(
    (k) => (lead.industry || "").toLowerCase().includes(k.toLowerCase())
  );
  const industryHook = matchedIndustry
    ? industryInsights[matchedIndustry]
    : `The ${lead.industry || "B2B"} landscape is shifting faster than most teams can adapt.\n\nThe companies pulling ahead aren't just iterating — they're rethinking their entire approach to growth.`;

  return {
    leadId: lead.id,
    touches,
    linkedinPost: `🚀 ${industryHook}\n\nHere's what I'm seeing across ${lead.industry || "B2B"} companies at the ${fundingRef} stage:\n\n1. Personalization at scale is table stakes, not a differentiator\n2. Multi-channel outreach (${strategy.primaryChannel}${strategy.secondaryChannel ? " + " + strategy.secondaryChannel : ""}) outperforms single-channel by 3x\n3. Signal-driven timing beats scheduled cadences every time\n\nThe teams I see winning? They treat outreach like a product — with iteration, measurement, and user empathy.\n\nWhat's the biggest shift you've seen in how ${lead.industry || "B2B"} buyers want to be reached?\n\n#${(lead.industry || "B2B").replace(/[^a-zA-Z]/g, "")} #SalesStrategy #AI #Outreach`,
    linkedinHeadlineSuggestion: `Helping ${lead.industry || "B2B"} teams at ${lead.companySize || "growth-stage"} companies turn cold outreach into warm conversations | AI-Powered ${persona.archetype === "practitioner" ? "Technical Sales" : "Revenue Intelligence"}`,
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
      content = simulateContent(lead, strategy, persona, intent, signals);
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
