import { nanoid } from "nanoid";
import { config } from "../config.js";
import { leadsCol } from "../db/index.js";
import { sseManager } from "../lib/sse.js";
import { llmGenerateText } from "../lib/llm.js";
import type {
  TargetedInput,
  DiscoveryInput,
  EnrichedLead,
  LeadInput,
} from "../types/index.js";

const AGENT_NUMBER = 1;
const AGENT_NAME = "Lead Ingestion";

// ─── Apollo Enrichment (real or simulated) ───

interface ApolloEnrichmentResult {
  companyDomain?: string;
  companySize?: string;
  industry?: string;
  fundingStage?: string;
  fundingAmount?: string;
  techStack?: string[];
  headquarters?: string;
  contactName: string;
  contactTitle: string;
  contactEmail?: string;
  contactPhone?: string;
  contactLinkedIn?: string;
  seniority?: string;
}

async function enrichViaApollo(
  companyName: string,
  contactName?: string
): Promise<ApolloEnrichmentResult> {
  if (config.simulationMode) {
    return simulateApolloEnrichment(companyName, contactName);
  }

  // Real Apollo API call
  try {
    const response = await fetch("https://api.apollo.io/api/v1/mixed_people/api_search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "X-Api-Key": config.apolloApiKey,
      },
      body: JSON.stringify({
        q_organization_name: companyName,
        q_person_name: contactName || undefined,
        per_page: 1,
      }),
    });

    if (!response.ok) {
      console.warn(`Apollo API returned ${response.status}, falling back to simulation`);
      return simulateApolloEnrichment(companyName, contactName);
    }

    const data = (await response.json()) as {
      people?: Array<{
        name?: string;
        title?: string;
        email?: string;
        phone_numbers?: Array<{ sanitized_number?: string }>;
        linkedin_url?: string;
        seniority?: string;
        organization?: {
          website_url?: string;
          estimated_num_employees?: number;
          industry?: string;
          funding_stage?: string;
          total_funding?: number;
          technologies?: string[];
          city?: string;
          country?: string;
        };
      }>;
    };
    const person = data.people?.[0];
    if (!person) {
      return simulateApolloEnrichment(companyName, contactName);
    }

    const org = person.organization;
    return {
      companyDomain: org?.website_url,
      companySize: org?.estimated_num_employees
        ? categorizeSize(org.estimated_num_employees)
        : undefined,
      industry: org?.industry,
      fundingStage: org?.funding_stage,
      fundingAmount: org?.total_funding ? `$${(org.total_funding / 1_000_000).toFixed(1)}M` : undefined,
      techStack: org?.technologies?.slice(0, 10),
      headquarters: org?.city && org?.country ? `${org.city}, ${org.country}` : undefined,
      contactName: person.name || contactName || "Unknown",
      contactTitle: person.title || "Unknown",
      contactEmail: person.email,
      contactPhone: person.phone_numbers?.[0]?.sanitized_number,
      contactLinkedIn: person.linkedin_url,
      seniority: person.seniority,
    };
  } catch (error) {
    console.warn("Apollo API error, falling back to simulation:", error);
    return simulateApolloEnrichment(companyName, contactName);
  }
}

function simulateApolloEnrichment(
  companyName: string,
  contactName?: string
): ApolloEnrichmentResult {
  const industries = ["SaaS", "FinTech", "HealthTech", "EdTech", "E-commerce", "DevTools", "AI/ML"];
  const stages = ["Seed", "Series A", "Series B", "Series C", "Growth", "Public"];
  const stacks = ["React", "Node.js", "Python", "AWS", "Kubernetes", "PostgreSQL", "Redis", "TypeScript"];
  const cities = ["Mumbai", "Bangalore", "San Francisco", "New York", "London", "Berlin", "Singapore"];

  const randomPick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const stage = randomPick(stages);

  const amounts: Record<string, string> = {
    Seed: "$2.5M",
    "Series A": "$12M",
    "Series B": "$45M",
    "Series C": "$120M",
    Growth: "$250M",
    Public: "N/A",
  };

  return {
    companyDomain: `${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
    companySize: randomPick(["11-50", "51-200", "201-500", "501-1000"]),
    industry: randomPick(industries),
    fundingStage: stage,
    fundingAmount: amounts[stage] || "$10M",
    techStack: stacks.sort(() => Math.random() - 0.5).slice(0, 4),
    headquarters: randomPick(cities),
    contactName: contactName || `${randomPick(["Rahul", "Priya", "Amit", "Sarah", "James"])} ${randomPick(["Sharma", "Patel", "Singh", "Chen", "Wilson"])}`,
    contactTitle: randomPick(["VP Sales", "CTO", "Head of Engineering", "VP Marketing", "Director of Product"]),
    contactEmail: `${(contactName || "contact").toLowerCase().replace(/\s+/g, ".")}@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
    contactPhone: "+91-9876543210",
    contactLinkedIn: `https://linkedin.com/in/${(contactName || "contact").toLowerCase().replace(/\s+/g, "-")}`,
    seniority: randomPick(["C-Level", "VP", "Director", "Manager"]),
  };
}

function categorizeSize(employees: number): string {
  if (employees <= 10) return "1-10";
  if (employees <= 50) return "11-50";
  if (employees <= 200) return "51-200";
  if (employees <= 500) return "201-500";
  if (employees <= 1000) return "501-1000";
  return "1000+";
}

// ─── Mode 2: Discovery — LLM recommends companies ───

async function discoverCompanies(
  input: DiscoveryInput
): Promise<Array<{ companyName: string; contactTitle: string; reason: string }>> {
  if (config.simulationMode && !config.geminiApiKey) {
    return simulateDiscovery(input);
  }

  const systemPrompt = `You are a B2B sales intelligence agent. Given a product description and target criteria, recommend real companies that would be ideal prospects. Return ONLY a JSON array of objects, each with "companyName", "contactTitle" (the ideal person to reach out to), and "reason" (one sentence on why they're a good fit). Return ${input.maxResults || 5} companies.`;

  const userMessage = `
Product: ${input.productName}
Description: ${input.productDescription}
Target Industries: ${input.targetIndustries.join(", ")}
Target Company Size: ${input.targetCompanySize || "Any"}
Target Geographies: ${input.targetGeographies?.join(", ") || "Global"}
ICP: ${input.idealCustomerProfile || "Not specified"}

Recommend real, specific companies that would benefit from this product.`;

  try {
    const response = await llmGenerateText(systemPrompt, userMessage);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as Array<{
        companyName: string;
        contactTitle: string;
        reason: string;
      }>;
    }
    return simulateDiscovery(input);
  } catch {
    return simulateDiscovery(input);
  }
}

function simulateDiscovery(
  input: DiscoveryInput
): Array<{ companyName: string; contactTitle: string; reason: string }> {
  const companies = [
    { companyName: "Freshworks", contactTitle: "VP Engineering", reason: `Strong fit — ${input.targetIndustries[0] || "SaaS"} company actively scaling their tech stack` },
    { companyName: "Razorpay", contactTitle: "Head of Platform", reason: "High-growth FinTech, recently raised Series F, expanding product suite" },
    { companyName: "Postman", contactTitle: "Director of Product", reason: "DevTools company with strong API-first culture, ideal for technical products" },
    { companyName: "Zerodha", contactTitle: "CTO", reason: "Tech-forward fintech with lean engineering team, values developer productivity" },
    { companyName: "Notion", contactTitle: "VP Sales", reason: "Productivity SaaS scaling rapidly, open to tools that improve workflow" },
  ];
  return companies.slice(0, input.maxResults || 5);
}

// ─── Deduplication ───

async function checkDuplicate(companyName: string, contactEmail?: string): Promise<boolean> {
  const existing = await leadsCol().find({ companyName }).toArray();

  if (existing.length === 0) return false;

  // Check if any active/processing leads exist for this company
  return existing.some(
    (l) =>
      l.status === "processing" ||
      l.status === "active" ||
      (contactEmail && l.contactEmail === contactEmail)
  );
}

// ─── Main Agent Function ───

export async function runLeadIngestionAgent(input: LeadInput): Promise<EnrichedLead[]> {
  const startTime = Date.now();
  const enrichedLeads: EnrichedLead[] = [];

  sseManager.emitAgentStatus("pipeline", AGENT_NUMBER, AGENT_NAME, "running");

  try {
    if (input.mode === "targeted") {
      // Mode 1: Targeted — enrich the specific company
      const targeted = input as TargetedInput;

      // Check for duplicates
      const isDuplicate = await checkDuplicate(targeted.companyName, targeted.contactEmail);
      if (isDuplicate) {
        sseManager.emit("agent_status", "pipeline", {
          agentNumber: AGENT_NUMBER,
          agentName: AGENT_NAME,
          status: "complete",
          outputSummary: `Duplicate detected for ${targeted.companyName} — skipping`,
        });
        return [];
      }

      const enrichment = await enrichViaApollo(targeted.companyName, targeted.contactName);
      const lead = buildEnrichedLead(enrichment, targeted);
      enrichedLeads.push(lead);
    } else {
      // Mode 2: Discovery — LLM recommends companies, then enrich each
      const discovery = input as DiscoveryInput;

      sseManager.emit("agent_status", "pipeline", {
        agentNumber: AGENT_NUMBER,
        agentName: AGENT_NAME,
        status: "running",
        outputSummary: "Discovering ideal target companies...",
      });

      const recommendations = await discoverCompanies(discovery);

      for (const rec of recommendations) {
        const isDuplicate = await checkDuplicate(rec.companyName);
        if (isDuplicate) continue;

        const enrichment = await enrichViaApollo(rec.companyName);
        // Override contact title with the recommended one
        enrichment.contactTitle = rec.contactTitle;

        const lead = buildEnrichedLead(enrichment, {
          ...discovery,
          _companyName: rec.companyName,
          _reason: rec.reason,
        } as DiscoveryInput & { _companyName: string; _reason: string });
        enrichedLeads.push(lead);
      }
    }

    // Persist all enriched leads to DB
    for (const lead of enrichedLeads) {
      await leadsCol().insertOne({
        _id: lead.id,
        companyName: lead.companyName,
        companyDomain: lead.companyDomain,
        companySize: lead.companySize,
        industry: lead.industry,
        fundingStage: lead.fundingStage,
        fundingAmount: lead.fundingAmount,
        techStack: JSON.stringify(lead.techStack),
        headquarters: lead.headquarters,
        contactName: lead.contactName,
        contactTitle: lead.contactTitle,
        contactEmail: lead.contactEmail,
        contactPhone: lead.contactPhone,
        contactLinkedIn: lead.contactLinkedIn,
        seniority: lead.seniority,
        source: lead.source,
        status: "processing",
        rawInput: JSON.stringify(lead.rawInput),
        enrichedAt: lead.enrichedAt,
        createdAt: new Date().toISOString(),
      });
    }

    const durationMs = Date.now() - startTime;
    const summary =
      input.mode === "targeted"
        ? `Enriched ${enrichedLeads[0]?.companyName || "lead"} — ${enrichedLeads[0]?.contactName}, ${enrichedLeads[0]?.contactTitle}`
        : `Discovered & enriched ${enrichedLeads.length} target companies`;

    sseManager.emitAgentStatus("pipeline", AGENT_NUMBER, AGENT_NAME, "complete", summary);
    sseManager.emit("score_update", "pipeline", {
      agent: AGENT_NAME,
      leads: enrichedLeads.map((l) => ({
        id: l.id,
        company: l.companyName,
        contact: l.contactName,
        title: l.contactTitle,
      })),
      durationMs,
    });

    console.log(`✅ Agent 1 complete in ${durationMs}ms — ${summary}`);
    return enrichedLeads;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    sseManager.emitAgentStatus("pipeline", AGENT_NUMBER, AGENT_NAME, "error", undefined, errMsg);
    throw error;
  }
}

// ─── Helper: build enriched lead object ───

function buildEnrichedLead(
  enrichment: ApolloEnrichmentResult,
  input: TargetedInput | (DiscoveryInput & { _companyName?: string; _reason?: string })
): EnrichedLead {
  const companyName =
    input.mode === "targeted"
      ? (input as TargetedInput).companyName
      : (input as DiscoveryInput & { _companyName?: string })._companyName || "Unknown";

  return {
    id: nanoid(),
    companyName,
    companyDomain: enrichment.companyDomain,
    companySize: enrichment.companySize,
    industry: enrichment.industry,
    fundingStage: enrichment.fundingStage,
    fundingAmount: enrichment.fundingAmount,
    techStack: enrichment.techStack,
    headquarters: enrichment.headquarters,
    contactName: enrichment.contactName,
    contactTitle: enrichment.contactTitle,
    contactEmail: enrichment.contactEmail,
    contactPhone: enrichment.contactPhone,
    contactLinkedIn: enrichment.contactLinkedIn,
    seniority: enrichment.seniority as EnrichedLead["seniority"],
    source: input.mode,
    enrichedAt: new Date().toISOString(),
    rawInput: input,
  };
}
