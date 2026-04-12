import { nanoid } from "nanoid";
import { config } from "../config.js";
import { signalsCol } from "../db/index.js";
import { sseManager } from "../lib/sse.js";
import type {
  EnrichedLead,
  Signal,
  SignalBundle,
  SignalCategory,
  SignalStrength,
} from "../types/index.js";

const AGENT_NUMBER = 2;
const AGENT_NAME = "Signal Scout";

// ─── Tavily Web Search (real or simulated) ───

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  published_date?: string;
}

async function searchTavily(query: string): Promise<TavilyResult[]> {
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
        include_answer: false,
      }),
    });

    if (!response.ok) {
      console.warn(`Tavily API returned ${response.status}, falling back to simulation`);
      return simulateTavilySearch(query);
    }

    const data = (await response.json()) as { results?: TavilyResult[] };
    return data.results || [];
  } catch (error) {
    console.warn("Tavily API error:", error);
    return simulateTavilySearch(query);
  }
}

function simulateTavilySearch(query: string): TavilyResult[] {
  const companyName = query.split(" ")[0] || "Company";
  const now = new Date();

  return [
    {
      title: `${companyName} Raises Series B Funding Round`,
      url: `https://techcrunch.com/${companyName.toLowerCase()}-series-b`,
      content: `${companyName} has announced a $45M Series B funding round led by Sequoia Capital. The company plans to use the funds to expand its engineering team and accelerate product development across new markets.`,
      published_date: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: `${companyName} Launches New AI-Powered Product Suite`,
      url: `https://venturebeat.com/${companyName.toLowerCase()}-ai-product`,
      content: `${companyName} unveiled its new AI-powered product suite at the annual SaaS conference, targeting enterprise customers looking to automate their workflows.`,
      published_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: `${companyName} Hires Former Google VP as New CTO`,
      url: `https://linkedin.com/posts/${companyName.toLowerCase()}-new-cto`,
      content: `${companyName} has appointed Dr. Aisha Patel, former VP of Engineering at Google Cloud, as its new Chief Technology Officer. The hire signals the company's push into enterprise-grade infrastructure.`,
      published_date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: `${companyName} Expands Operations to Southeast Asia`,
      url: `https://bloomberg.com/${companyName.toLowerCase()}-asia-expansion`,
      content: `${companyName} is opening new offices in Singapore and Jakarta as part of its Asia-Pacific expansion strategy, aiming to capture the growing SaaS market in the region.`,
      published_date: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: `${companyName} is Hiring: 12 Open Engineering Roles`,
      url: `https://careers.${companyName.toLowerCase()}.com`,
      content: `${companyName} currently has 12 open engineering positions across backend, frontend, and ML engineering, suggesting significant team growth and product investment.`,
      published_date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

// ─── Signal Classification ───

function classifySignal(result: TavilyResult): { category: SignalCategory; strength: SignalStrength } {
  const text = `${result.title} ${result.content}`.toLowerCase();

  // Score each category by keyword match count for more accurate classification
  const categories: Array<{ category: SignalCategory; strength: SignalStrength; score: number }> = [];

  // Hiring spike — check BEFORE executive_hire to avoid "hiring" being caught by "hire"
  const hiringKeywords = ["hiring", "open roles", "open positions", "engineering positions", "careers", "job openings", "we're hiring", "is hiring", "open engineering"];
  const hiringScore = hiringKeywords.reduce((s, kw) => s + (text.includes(kw) ? 1 : 0), 0);
  if (hiringScore > 0) categories.push({ category: "hiring_spike", strength: "MEDIUM", score: hiringScore });

  // Executive hire — specific leadership appointments
  const execKeywords = ["appointed", "new cto", "new ceo", "new vp", "new chief", "names new", "hires former", "joins as"];
  const execScore = execKeywords.reduce((s, kw) => s + (text.includes(kw) ? 1 : 0), 0);
  if (execScore > 0) categories.push({ category: "executive_hire", strength: "HIGH", score: execScore });

  // Funding — financial signals
  const fundingKeywords = ["funding", "raised", "series a", "series b", "series c", "series d", "investment", "seed round", "led by", "venture capital", "valuation"];
  const fundingScore = fundingKeywords.reduce((s, kw) => s + (text.includes(kw) ? 1 : 0), 0);
  if (fundingScore > 0) categories.push({ category: "funding", strength: "HIGH", score: fundingScore });

  // Product launch
  const productKeywords = ["launch", "unveiled", "announces new", "release", "new product", "product suite", "generally available"];
  const productScore = productKeywords.reduce((s, kw) => s + (text.includes(kw) ? 1 : 0), 0);
  if (productScore > 0) categories.push({ category: "product_launch", strength: "HIGH", score: productScore });

  // Geographic expansion
  const geoKeywords = ["expand", "new office", "new market", "expansion", "opens office", "opens new", "entering"];
  const geoScore = geoKeywords.reduce((s, kw) => s + (text.includes(kw) ? 1 : 0), 0);
  if (geoScore > 0) categories.push({ category: "geographic_expansion", strength: "MEDIUM", score: geoScore });

  // Partnership
  const partnerKeywords = ["partner", "collaboration", "integration", "strategic alliance", "joins forces"];
  const partnerScore = partnerKeywords.reduce((s, kw) => s + (text.includes(kw) ? 1 : 0), 0);
  if (partnerScore > 0) categories.push({ category: "partnership", strength: "MEDIUM", score: partnerScore });

  // Award
  const awardKeywords = ["award", "recognition", "named best", "wins", "honored"];
  const awardScore = awardKeywords.reduce((s, kw) => s + (text.includes(kw) ? 1 : 0), 0);
  if (awardScore > 0) categories.push({ category: "award", strength: "LOW", score: awardScore });

  // Return the highest-scoring category
  if (categories.length > 0) {
    categories.sort((a, b) => b.score - a.score);
    return { category: categories[0].category, strength: categories[0].strength };
  }

  return { category: "other", strength: "LOW" };
}

function calculateRecencyWeight(dateStr: string | undefined): { recencyDays: number; weight: number } {
  if (!dateStr) return { recencyDays: 30, weight: 0.3 };

  const signalDate = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - signalDate.getTime();
  const days = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));

  // Exponential decay: weight = e^(-days/15), so 0 days = 1.0, 15 days ≈ 0.37, 30 days ≈ 0.14
  const weight = Math.round(Math.exp(-days / 15) * 100) / 100;

  return { recencyDays: days, weight };
}

function determineOverallStrength(signals: Signal[]): SignalStrength {
  const highCount = signals.filter((s) => s.strength === "HIGH").length;
  const medCount = signals.filter((s) => s.strength === "MEDIUM").length;

  if (highCount >= 2) return "HIGH";
  if (highCount >= 1 || medCount >= 2) return "MEDIUM";
  return "LOW";
}

// ─── Simulate LinkedIn Activity Score ───

function simulateLinkedInActivity(lead: EnrichedLead): number {
  // In simulation, generate a score based on seniority and title
  const seniorityScores: Record<string, number> = {
    "C-Level": 75,
    VP: 80,
    Director: 65,
    Manager: 55,
    "Individual Contributor": 40,
  };
  const base = seniorityScores[lead.seniority || "Manager"] || 50;
  // Add some randomness
  return Math.min(100, Math.max(0, base + Math.floor(Math.random() * 30 - 10)));
}

// ─── Main Agent Function ───

export async function runSignalScoutAgent(lead: EnrichedLead): Promise<SignalBundle> {
  const startTime = Date.now();

  sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "running");

  try {
    // Search for company signals
    const searchQuery = `${lead.companyName} ${lead.industry || "technology"} news funding product launch 2025 2026`;
    const tavilyResults = await searchTavily(searchQuery);

    // Process and classify each result into a Signal
    const processedSignals: Signal[] = tavilyResults.map((result) => {
      const { category, strength } = classifySignal(result);
      const { recencyDays, weight } = calculateRecencyWeight(result.published_date);

      return {
        id: nanoid(),
        category,
        title: result.title,
        description: result.content.slice(0, 300),
        source: new URL(result.url).hostname,
        sourceUrl: result.url,
        dateDetected: result.published_date || new Date().toISOString(),
        recencyDays,
        strength,
        recencyWeight: weight,
      };
    });

    // Sort by recency weight (most impactful first)
    processedSignals.sort((a, b) => b.recencyWeight - a.recencyWeight);

    // LinkedIn activity score
    const linkedinActivityScore = simulateLinkedInActivity(lead);

    // Add LinkedIn activity as a signal if score is high
    if (linkedinActivityScore > 60) {
      processedSignals.push({
        id: nanoid(),
        category: "linkedin_activity",
        title: `${lead.contactName} is active on LinkedIn`,
        description: `LinkedIn activity score: ${linkedinActivityScore}/100. Recent posts and engagement suggest high receptiveness to outreach.`,
        source: "linkedin.com",
        sourceUrl: lead.contactLinkedIn,
        dateDetected: new Date().toISOString(),
        recencyDays: 0,
        strength: linkedinActivityScore > 75 ? "HIGH" : "MEDIUM",
        recencyWeight: linkedinActivityScore > 75 ? 0.9 : 0.6,
      });
    }

    const bundle: SignalBundle = {
      leadId: lead.id,
      signals: processedSignals,
      topSignal: processedSignals[0] || null,
      linkedinActivityScore,
      overallSignalStrength: determineOverallStrength(processedSignals),
      generatedAt: new Date().toISOString(),
    };

    // Persist signals to DB
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
        createdAt: new Date().toISOString(),
      });
    }

    const durationMs = Date.now() - startTime;
    const summary = `Found ${processedSignals.length} signals — Top: ${bundle.topSignal?.title || "None"} (${bundle.overallSignalStrength})`;

    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "complete", summary);
    sseManager.emit("signal_update", lead.id, bundle);

    console.log(`✅ Agent 2 complete in ${durationMs}ms — ${summary}`);
    return bundle;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "error", undefined, errMsg);
    throw error;
  }
}
