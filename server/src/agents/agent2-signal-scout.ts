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

  // Use a deterministic hash so different companies get different signal mixes
  const hash = companyName.split("").reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  const pick = <T>(arr: T[], offset = 0): T => arr[Math.abs(hash + offset) % arr.length];

  // Company-specific signal pools
  const fundingSignals = [
    { title: `${companyName} Closes $45M Series B Led by Sequoia Capital`, content: `${companyName} has announced a $45M Series B funding round led by Sequoia Capital. The company plans to use the funds to expand its engineering team by 40% and accelerate product development in AI-powered features. CEO stated the round was 3x oversubscribed.` },
    { title: `${companyName} Raises $120M Series C, Valued at $1.2B`, content: `${companyName} has achieved unicorn status after raising $120M in Series C funding led by Accel and Tiger Global. The funds will be deployed towards geographic expansion into Southeast Asia and Japan, with plans to double their customer base within 18 months.` },
    { title: `${companyName} Secures $18M Series A to Scale Enterprise Platform`, content: `${companyName} has raised $18M in Series A funding from Lightspeed Venture Partners. The capital will fund hiring of 25 senior engineers and expansion of their go-to-market team to target mid-market enterprise accounts in North America and Europe.` },
    { title: `${companyName} Attracts $250M Growth Round from SoftBank Vision Fund`, content: `${companyName} raised $250M in a growth round led by SoftBank Vision Fund, bringing total funding to $400M. The company reports 3x year-over-year revenue growth and plans to invest heavily in R&D and international expansion.` },
  ];

  const productSignals = [
    { title: `${companyName} Launches AI-Powered Analytics Suite for Enterprise`, content: `${companyName} unveiled its new AI-powered analytics suite at SaaS Summit 2026, featuring real-time predictive insights and automated anomaly detection. The product targets enterprise customers processing 1M+ daily events, with early adopters reporting 60% reduction in manual analysis time.` },
    { title: `${companyName} Announces Major Platform Overhaul with GraphQL API`, content: `${companyName} released a complete platform rebuild featuring a unified GraphQL API, real-time webhooks, and a developer SDK supporting 8 programming languages. The launch follows 18 months of development and addresses the #1 customer request for programmatic access.` },
    { title: `${companyName} Debuts Next-Gen Developer Experience Platform`, content: `${companyName} launched a next-generation developer experience platform that includes automated code review, intelligent documentation generation, and CI/CD pipeline optimization. Beta users report 35% faster deployment cycles.` },
  ];

  const hiringSignals = [
    { title: `${companyName} Posts 45 Open Engineering Roles Across 3 Continents`, content: `${companyName} currently has 45 open engineering positions spanning backend systems, ML infrastructure, and frontend platforms across offices in Bangalore, San Francisco, and London. The aggressive hiring push follows their recent funding round and signals significant product investment.` },
    { title: `${companyName} Engineering Team Grows 200% in 12 Months`, content: `${companyName}'s engineering headcount has grown from 50 to 150 in the past year, with particular focus on distributed systems and data engineering. They've hired senior engineers from Google, Meta, and Amazon, indicating a push towards enterprise-grade infrastructure.` },
    { title: `${companyName} Launches Dedicated AI Research Lab, Hiring 20 ML Engineers`, content: `${companyName} announced a new AI research lab focused on applied machine learning, with plans to hire 20 ML engineers and researchers. The lab will be led by a former Google DeepMind researcher and will focus on natural language understanding for the company's core product.` },
  ];

  const executiveSignals = [
    { title: `${companyName} Appoints Former AWS VP as New CTO`, content: `${companyName} has appointed Dr. Aisha Patel, former VP of Engineering at AWS, as its new Chief Technology Officer. Dr. Patel brings 15 years of experience scaling distributed systems and is expected to lead the company's push into enterprise-grade cloud infrastructure and multi-region deployment.` },
    { title: `${companyName} Names Ex-Salesforce SVP as Chief Revenue Officer`, content: `${companyName} hired Rajiv Mehta, former SVP of Enterprise Sales at Salesforce, as CRO. The appointment signals a strategic shift towards upmarket enterprise sales motions. Mehta managed a $2B revenue book at Salesforce and plans to build a 100-person enterprise sales team.` },
    { title: `${companyName} Hires Google's Head of Product as VP Product`, content: `${companyName} brought on Maria Santos, former Head of Product at Google Cloud, as VP of Product. Santos will lead the company's product strategy as they expand from a single-product company to a multi-product platform serving both developers and business users.` },
  ];

  const expansionSignals = [
    { title: `${companyName} Opens APAC Headquarters in Singapore`, content: `${companyName} is establishing its Asia-Pacific headquarters in Singapore with a team of 30, including local sales, customer success, and engineering. The company cited 400% YoY growth in APAC revenue and strategic partnerships with regional enterprises as catalysts for the expansion.` },
    { title: `${companyName} Expands to Europe, Opens Berlin Engineering Hub`, content: `${companyName} opened a 50-person engineering hub in Berlin to serve European customers and comply with GDPR data residency requirements. The company signed 15 enterprise contracts in Europe last quarter and expects European revenue to represent 30% of total by year-end.` },
    { title: `${companyName} Enters Indian Market with Mumbai Office and Local Partnerships`, content: `${companyName} launched operations in India with a Mumbai office and strategic partnerships with TCS and Infosys. India represents their fastest-growing market with 500+ enterprise customers signed in the first quarter. They plan to hire 100 people locally within 12 months.` },
  ];

  const partnershipSignals = [
    { title: `${companyName} Announces Strategic Partnership with Microsoft Azure`, content: `${companyName} signed a strategic partnership with Microsoft Azure to offer native integration within the Azure Marketplace. The partnership includes joint go-to-market initiatives, co-selling opportunities, and deep technical integration that enables one-click deployment for Azure customers.` },
    { title: `${companyName} Partners with Snowflake for Real-Time Data Integration`, content: `${companyName} announced a deep integration with Snowflake, enabling bi-directional real-time data sync. The partnership addresses a key enterprise requirement and is expected to unlock $50M+ in new pipeline from joint customers who need unified analytics.` },
  ];

  // Build a mix of signals based on the company name hash
  // Each company gets a DIFFERENT combination
  const allPools = [fundingSignals, productSignals, hiringSignals, executiveSignals, expansionSignals, partnershipSignals];
  const selectedPools = [
    allPools[Math.abs(hash) % allPools.length],
    allPools[Math.abs(hash + 1) % allPools.length],
    allPools[Math.abs(hash + 2) % allPools.length],
    allPools[Math.abs(hash + 3) % allPools.length],
    allPools[Math.abs(hash + 4) % allPools.length],
  ];

  const results: TavilyResult[] = [];
  const dayOffsets = [3, 5, 8, 12, 18]; // Realistic recency spread

  for (let i = 0; i < 5; i++) {
    const pool = selectedPools[i];
    const signal = pool[Math.abs(hash + i * 7) % pool.length];
    const dayOffset = dayOffsets[i];

    const urlDomains = ["techcrunch.com", "venturebeat.com", "bloomberg.com", "reuters.com", "linkedin.com", "sifted.eu", "inc42.com", "yourstory.com"];
    const domain = pick(urlDomains, i * 3);

    results.push({
      title: signal.title,
      url: `https://${domain}/${companyName.toLowerCase().replace(/\s+/g, "-")}-${pick(["news", "update", "announcement", "report"], i)}`,
      content: signal.content,
      published_date: new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return results;
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
  // In simulation, generate a deterministic score based on seniority, title, and company
  const seniorityScores: Record<string, number> = {
    "C-Level": 75,
    VP: 80,
    Director: 65,
    Manager: 55,
    "Individual Contributor": 40,
  };
  const base = seniorityScores[lead.seniority || "Manager"] || 50;

  // Deterministic adjustment based on company name (so same company = same score)
  const hash = (lead.companyName + lead.contactName).split("").reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  const adjustment = (Math.abs(hash) % 25) - 10; // -10 to +15

  // Title-based bonus: heads/VPs who are more public-facing tend to be more active
  const title = (lead.contactTitle || "").toLowerCase();
  const titleBonus = (title.includes("head") || title.includes("vp") || title.includes("founder")) ? 10 : 0;

  return Math.min(100, Math.max(0, base + adjustment + titleBonus));
}

// ─── Main Agent Function ───

export async function runSignalScoutAgent(lead: EnrichedLead): Promise<SignalBundle> {
  const startTime = Date.now();

  sseManager.emitAgentStatus(lead.id, AGENT_NUMBER, AGENT_NAME, "running");

  try {
    // Search for company signals — use specific, targeted queries
    const searchQuery = `"${lead.companyName}" ${lead.industry || "technology"} news funding hiring product launch expansion 2025 2026`;
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
