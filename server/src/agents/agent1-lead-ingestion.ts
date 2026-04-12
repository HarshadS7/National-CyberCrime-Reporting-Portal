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
  contactName?: string,
  contactTitle?: string,
  location?: string
): Promise<ApolloEnrichmentResult> {
  if (config.simulationMode) {
    return simulateApolloEnrichment(companyName, contactName, contactTitle, location);
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
      return simulateApolloEnrichment(companyName, contactName, contactTitle, location);
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
      return simulateApolloEnrichment(companyName, contactName, contactTitle, location);
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
    return simulateApolloEnrichment(companyName, contactName, contactTitle, location);
  }
}

function simulateApolloEnrichment(
  companyName: string,
  contactName?: string,
  contactTitle?: string,
  location?: string
): ApolloEnrichmentResult {
  // Known company database for realistic enrichment
  const knownCompanies: Record<string, { domain: string; size: string; industry: string; stage: string; amount: string; stack: string[]; hq: string }> = {
    freshworks: { domain: "freshworks.com", size: "1000+", industry: "B2B SaaS - Customer Engagement", stage: "Public", amount: "IPO ($1B+)", stack: ["Ruby on Rails", "React", "AWS", "Redis", "Kafka", "PostgreSQL"], hq: "Chennai, India" },
    razorpay: { domain: "razorpay.com", size: "1000+", industry: "FinTech - Payments", stage: "Series F", amount: "$741.5M", stack: ["Go", "Ruby", "React", "AWS", "Kubernetes", "MySQL"], hq: "Bangalore, India" },
    postman: { domain: "postman.com", size: "501-1000", industry: "DevTools - API Platform", stage: "Series D", amount: "$430M", stack: ["Node.js", "React", "Electron", "AWS", "MongoDB", "TypeScript"], hq: "San Francisco, USA" },
    zerodha: { domain: "zerodha.com", size: "201-500", industry: "FinTech - Trading Platform", stage: "Bootstrapped", amount: "Self-funded ($0 VC)", stack: ["Go", "PostgreSQL", "Redis", "Python", "Elixir", "Kafka"], hq: "Bangalore, India" },
    notion: { domain: "notion.so", size: "501-1000", industry: "B2B SaaS - Productivity", stage: "Series C", amount: "$343M", stack: ["React", "Node.js", "PostgreSQL", "AWS", "TypeScript", "Redis"], hq: "San Francisco, USA" },
    chargebee: { domain: "chargebee.com", size: "501-1000", industry: "B2B SaaS - Subscription Billing", stage: "Series G", amount: "$250M", stack: ["Java", "React", "Python", "AWS", "PostgreSQL", "Elasticsearch"], hq: "Chennai, India" },
    stripe: { domain: "stripe.com", size: "1000+", industry: "FinTech - Payment Infrastructure", stage: "Series I", amount: "$8.7B", stack: ["Ruby", "Go", "React", "AWS", "Kubernetes", "Scala"], hq: "San Francisco, USA" },
    shopify: { domain: "shopify.com", size: "1000+", industry: "E-commerce - Commerce Platform", stage: "Public", amount: "IPO", stack: ["Ruby on Rails", "React", "GraphQL", "GCP", "Kubernetes", "Lua"], hq: "Ottawa, Canada" },
    meesho: { domain: "meesho.com", size: "1000+", industry: "E-commerce - Social Commerce", stage: "Series F", amount: "$570M", stack: ["Java", "React Native", "Kubernetes", "AWS", "Kafka", "Redis"], hq: "Bangalore, India" },
    hasura: { domain: "hasura.io", size: "51-200", industry: "DevTools - GraphQL & Data Access", stage: "Series C", amount: "$100M", stack: ["Haskell", "React", "TypeScript", "PostgreSQL", "Docker", "Go"], hq: "San Francisco, USA" },
    unacademy: { domain: "unacademy.com", size: "1000+", industry: "EdTech - Online Learning", stage: "Series H", amount: "$440M", stack: ["Python", "React", "AWS", "Kubernetes", "Redis", "MongoDB"], hq: "Bangalore, India" },
    innovaccer: { domain: "innovaccer.com", size: "501-1000", industry: "HealthTech - Data Platform", stage: "Series E", amount: "$225M", stack: ["Python", "React", "AWS", "Snowflake", "Kubernetes", "PostgreSQL"], hq: "San Francisco, USA" },
    contentful: { domain: "contentful.com", size: "201-500", industry: "B2B SaaS - Content Platform", stage: "Series F", amount: "$325M", stack: ["Node.js", "React", "TypeScript", "AWS", "PostgreSQL", "Elasticsearch"], hq: "Berlin, Germany" },
  };

  const normalizedName = companyName.toLowerCase().replace(/\s+/g, "");
  const known = knownCompanies[normalizedName];

  // Use a deterministic hash for consistent results per company name
  const hash = companyName.split("").reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  const deterministicPick = <T>(arr: T[]): T => arr[Math.abs(hash) % arr.length];

  const industries = ["B2B SaaS", "FinTech", "HealthTech", "EdTech", "E-commerce", "DevTools", "AI/ML", "Cybersecurity", "MarTech", "HRTech"];
  const stages = ["Seed", "Series A", "Series B", "Series C", "Series D", "Growth", "Public"];
  const amounts: Record<string, string> = {
    Seed: "$2.5M", "Series A": "$12M", "Series B": "$45M", "Series C": "$120M", "Series D": "$200M", Growth: "$350M", Public: "IPO",
  };

  // Build tech stacks that are coherent (not random)
  const stackProfiles = [
    ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL", "Redis"],
    ["Vue.js", "Python", "Django", "GCP", "MySQL", "Celery"],
    ["Angular", "Java", "Spring Boot", "Azure", "MongoDB", "Kafka"],
    ["React", "Go", "gRPC", "AWS", "DynamoDB", "Kubernetes"],
    ["Next.js", "TypeScript", "Prisma", "Vercel", "PostgreSQL", "Redis"],
    ["React", "Python", "FastAPI", "AWS", "Snowflake", "Airflow"],
  ];

  const stage = known?.stage || deterministicPick(stages);
  const sizeOptions = ["11-50", "51-200", "201-500", "501-1000", "1000+"];

  // Infer seniority from provided title
  const inferredSeniority = inferSeniority(contactTitle);

  // Generate a realistic contact name based on company geography
  const indianFirstNames = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Ananya", "Arjun", "Kavitha", "Rohan", "Deepika"];
  const indianLastNames = ["Sharma", "Patel", "Gupta", "Nair", "Reddy", "Iyer", "Joshi", "Verma", "Bansal", "Srinivasan"];
  const westernFirstNames = ["James", "Sarah", "Michael", "Emily", "David", "Rachel", "Alex", "Jessica", "Chris", "Amanda"];
  const westernLastNames = ["Wilson", "Chen", "Martinez", "Kim", "O'Brien", "Anderson", "Thompson", "Lee", "Taylor", "Brown"];

  const hq = known?.hq || location || deterministicPick(["Bangalore, India", "San Francisco, USA", "New York, USA", "London, UK", "Berlin, Germany", "Singapore", "Mumbai, India"]);
  const isIndian = hq.toLowerCase().includes("india") || hq.toLowerCase().includes("bangalore") || hq.toLowerCase().includes("mumbai") || hq.toLowerCase().includes("chennai");

  const firstNames = isIndian ? indianFirstNames : westernFirstNames;
  const lastNames = isIndian ? indianLastNames : westernLastNames;

  const generatedContactName = contactName || `${deterministicPick(firstNames)} ${deterministicPick(lastNames)}`;
  const generatedTitle = contactTitle || deterministicPick(["VP of Engineering", "CTO", "Head of Engineering", "VP of Product", "Director of Engineering", "Head of Platform", "Chief Architect"]);
  const domain = known?.domain || `${normalizedName}.com`;
  const emailPrefix = generatedContactName.toLowerCase().replace(/\s+/g, ".");

  return {
    companyDomain: domain,
    companySize: known?.size || deterministicPick(sizeOptions),
    industry: known?.industry || deterministicPick(industries),
    fundingStage: stage,
    fundingAmount: known?.amount || amounts[stage] || "$10M",
    techStack: known?.stack || deterministicPick(stackProfiles),
    headquarters: hq,
    contactName: generatedContactName,
    contactTitle: generatedTitle,
    contactEmail: `${emailPrefix}@${domain}`,
    contactPhone: isIndian ? `+91-${9000000000 + Math.abs(hash) % 999999999}` : `+1-${2000000000 + Math.abs(hash) % 799999999}`,
    contactLinkedIn: `https://linkedin.com/in/${generatedContactName.toLowerCase().replace(/\s+/g, "-")}`,
    seniority: inferredSeniority || deterministicPick(["C-Level", "VP", "Director", "Manager"]),
  };
}

function inferSeniority(title?: string): string | undefined {
  if (!title) return undefined;
  const t = title.toLowerCase();
  if (t.includes("chief") || t.includes("ceo") || t.includes("cto") || t.includes("cfo") || t.includes("coo") || t.includes("co-founder") || t.includes("founder")) return "C-Level";
  if (t.includes("vp") || t.includes("vice president")) return "VP";
  if (t.includes("director") || t.includes("head of")) return "Director";
  if (t.includes("manager") || t.includes("lead")) return "Manager";
  return undefined;
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

// Define the discovery recommendation type
interface DiscoveryRecommendation {
  companyName: string;
  contactName?: string;
  contactTitle: string;
  contactEmail?: string;
  reason: string;
  industry?: string;
  estimatedSize?: string;
  headquarters?: string;
}

async function discoverCompanies(
  input: DiscoveryInput
): Promise<DiscoveryRecommendation[]> {
  if (config.simulationMode && !config.groqApiKey) {
    return simulateDiscovery(input);
  }

  const systemPrompt = `You are an elite B2B sales intelligence analyst with deep knowledge of the global technology and business landscape. Given a product description and target criteria, recommend REAL, SPECIFIC companies that exist today and would be ideal prospects.

For EACH company, provide:
- "companyName": The real, full legal company name (not generic/made-up names)
- "contactName": A realistic full name for the ideal decision-maker (first + last name)
- "contactTitle": Their specific job title (e.g. "VP of Engineering", "Head of Data Platform", not just generic "CTO")
- "contactEmail": A realistic professional email in the format firstname.lastname@companydomain.com or first@companydomain.com
- "reason": 2-3 sentences explaining WHY this company needs this product — reference specific known facts about the company (their tech stack, recent news, growth stage, pain points, market position)
- "industry": The specific sub-industry (e.g. "B2B SaaS - Developer Tools" not just "SaaS")
- "estimatedSize": Employee count range (e.g. "201-500")
- "headquarters": City, Country

IMPORTANT RULES:
1. Return ${input.maxResults || 5} companies, each from a DIFFERENT sub-industry or market segment
2. Mix company sizes: include at least 1 startup (under 50), 1 mid-market (50-500), and 1 enterprise (500+)
3. Mix geographies: include companies from at least 2 different countries
4. Each reason must reference SPECIFIC, KNOWN facts about that company
5. Do NOT return fictional or placeholder companies
6. Return ONLY the JSON array, no other text.`;

  const userMessage = `
Product Name: ${input.productName}
Product Description: ${input.productDescription}
Target Industries: ${input.targetIndustries.join(", ")}
Target Company Size: ${input.targetCompanySize || "Any size — provide a mix of startup, mid-market, and enterprise"}
Target Geographies: ${input.targetGeographies?.join(", ") || "Global — include companies from India, US, Europe, and Southeast Asia"}
Ideal Customer Profile: ${input.idealCustomerProfile || "Companies that are actively growing, have recently raised funding or launched new products, and have a technical team that would benefit from this solution"}

Recommend ${input.maxResults || 5} real, specific, currently-operating companies. For each company, identify the most relevant decision-maker by name and title, explain specifically why they would need "${input.productName}", and include their location and industry sub-vertical.`;

  try {
    const response = await llmGenerateText(systemPrompt, userMessage);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Array<{
        companyName: string;
        contactName?: string;
        contactTitle: string;
        contactEmail?: string;
        reason: string;
        industry?: string;
        estimatedSize?: string;
        headquarters?: string;
      }>;
      return parsed.map((p) => ({
        companyName: p.companyName,
        contactName: p.contactName,
        contactTitle: p.contactTitle,
        contactEmail: p.contactEmail,
        reason: p.reason,
        industry: p.industry,
        estimatedSize: p.estimatedSize,
        headquarters: p.headquarters,
      }));
    }
    return simulateDiscovery(input);
  } catch {
    return simulateDiscovery(input);
  }
}

function simulateDiscovery(
  input: DiscoveryInput
): Array<{ companyName: string; contactName?: string; contactTitle: string; contactEmail?: string; reason: string; industry?: string; estimatedSize?: string; headquarters?: string }> {
  // Build a pool of realistic companies mapped to industries
  const industryCompanyMap: Record<string, Array<{ companyName: string; contactName: string; contactTitle: string; industry: string; size: string; hq: string; reason: string }>> = {
    SaaS: [
      { companyName: "Freshworks", contactName: "Jyoti Bansal", contactTitle: "VP of Engineering", industry: "B2B SaaS - Customer Engagement", size: "1000+", hq: "Chennai, India", reason: "Freshworks is actively expanding their AI-powered CRM suite and recently acquired DevRev. Their 5000+ engineering team needs tools that accelerate product velocity across 13 product lines." },
      { companyName: "Chargebee", contactName: "Rajaraman Santhanam", contactTitle: "Head of Platform Engineering", industry: "B2B SaaS - Subscription Billing", size: "501-1000", hq: "Chennai, India", reason: "Chargebee is scaling post-Series G ($250M) and migrating to microservices. Their billing platform processes $16B+ in revenue, creating complex infrastructure needs." },
      { companyName: "Notion", contactName: "Jake Moffatt", contactTitle: "Director of Product Engineering", industry: "B2B SaaS - Productivity", size: "501-1000", hq: "San Francisco, USA", reason: "Notion is rapidly expanding beyond notes into enterprise workflows, databases, and AI. Their 500+ person team is scaling infrastructure to handle 30M+ users." },
      { companyName: "Contentful", contactName: "Stefan Judis", contactTitle: "VP of Developer Experience", industry: "B2B SaaS - Content Platform", size: "201-500", hq: "Berlin, Germany", reason: "Contentful's headless CMS serves 4000+ enterprise customers. Their move into composable content architecture creates demand for advanced developer tooling." },
    ],
    FinTech: [
      { companyName: "Razorpay", contactName: "Arvind Narayanan", contactTitle: "Head of Platform Architecture", industry: "FinTech - Payments", size: "1000+", hq: "Bangalore, India", reason: "Razorpay processes $90B+ annually and recently launched RazorpayX for business banking. Their engineering team of 800+ needs tools to manage payment reliability at scale." },
      { companyName: "Stripe", contactName: "Emily Zhang", contactTitle: "Senior Director of Infrastructure", industry: "FinTech - Payment Infrastructure", size: "1000+", hq: "San Francisco, USA", reason: "Stripe powers millions of businesses globally and processes hundreds of billions in payments. Their infrastructure team constantly evaluates tools for developer productivity and reliability." },
      { companyName: "Zerodha", contactName: "Kailash Nadh", contactTitle: "CTO", industry: "FinTech - Trading Platform", size: "201-500", hq: "Bangalore, India", reason: "Zerodha handles 15M+ daily orders with a lean 50-person engineering team using Go and PostgreSQL. They value developer productivity tools that reduce complexity." },
      { companyName: "Pine Labs", contactName: "Sanjeev Kumar", contactTitle: "VP of Technology", industry: "FinTech - Merchant Payments", size: "501-1000", hq: "Noida, India", reason: "Pine Labs serves 450K+ merchants and recently merged with Fave. Their tech team is integrating multiple platforms and needs unified development tooling." },
    ],
    HealthTech: [
      { companyName: "Innovaccer", contactName: "Sandeep Gupta", contactTitle: "VP of Engineering", industry: "HealthTech - Data Platform", size: "501-1000", hq: "San Francisco, USA", reason: "Innovaccer's healthcare data platform unifies records for 96M+ lives. Their engineering team is building HIPAA-compliant AI features, requiring robust development infrastructure." },
      { companyName: "PharmEasy", contactName: "Dharmil Sheth", contactTitle: "Head of Technology", industry: "HealthTech - Digital Pharmacy", size: "1000+", hq: "Mumbai, India", reason: "PharmEasy serves 20M+ customers across India with same-day medicine delivery. Their tech platform handles 500K+ daily orders requiring high-reliability systems." },
      { companyName: "Tempus AI", contactName: "Ryan Fukushima", contactTitle: "Director of Platform Engineering", industry: "HealthTech - Precision Medicine", size: "1000+", hq: "Chicago, USA", reason: "Tempus processes one of the world's largest clinical and molecular datasets. Their engineering team builds ML pipelines for genomic analysis at massive scale." },
    ],
    EdTech: [
      { companyName: "Unacademy", contactName: "Vivek Sinha", contactTitle: "VP of Engineering", industry: "EdTech - Online Learning", size: "1000+", hq: "Bangalore, India", reason: "Unacademy's live learning platform serves 60M+ learners with real-time video infrastructure. Their engineering team needs tools to manage live-streaming scale and content delivery." },
      { companyName: "Coursera", contactName: "Shravan Goli", contactTitle: "Director of Engineering", industry: "EdTech - Online Learning Platform", size: "1000+", hq: "Mountain View, USA", reason: "Coursera serves 136M+ learners and 7000+ institutions. Their platform team is investing heavily in AI-powered learning paths and needs scalable infrastructure." },
    ],
    DevTools: [
      { companyName: "Postman", contactName: "Ankit Sobti", contactTitle: "CTO", industry: "DevTools - API Platform", size: "501-1000", hq: "San Francisco, USA", reason: "Postman's API platform is used by 30M+ developers. Their engineering team builds collaboration tools and API testing infrastructure requiring high-quality developer tooling." },
      { companyName: "Hasura", contactName: "Rajoshi Ghosh", contactTitle: "Head of Product Engineering", industry: "DevTools - GraphQL & Data Access", size: "51-200", hq: "San Francisco, USA", reason: "Hasura powers instant GraphQL APIs for startups and enterprises alike. Their lean but highly technical team values tools that amplify developer productivity." },
      { companyName: "Zeplin", contactName: "Pelin Kenez", contactTitle: "VP of Engineering", industry: "DevTools - Design-to-Code", size: "51-200", hq: "Istanbul, Turkey", reason: "Zeplin bridges design and development for thousands of product teams. Their engineering team is rebuilding their platform with modern architecture." },
    ],
    "E-commerce": [
      { companyName: "Meesho", contactName: "Sanjeev Barnwal", contactTitle: "CTO & Co-founder", industry: "E-commerce - Social Commerce", size: "1000+", hq: "Bangalore, India", reason: "Meesho serves 150M+ monthly transacting users in India's tier-2/3 cities. Their platform handles millions of daily transactions requiring robust backend infrastructure." },
      { companyName: "Shopify", contactName: "Allan Leinwand", contactTitle: "VP of Infrastructure Engineering", industry: "E-commerce - Commerce Platform", size: "1000+", hq: "Ottawa, Canada", reason: "Shopify powers 4.6M+ merchants globally. Their engineering team constantly evaluates tools to improve developer productivity across their massive monorepo and distributed systems." },
    ],
    "AI/ML": [
      { companyName: "Hugging Face", contactName: "Julien Chaumond", contactTitle: "CTO & Co-founder", industry: "AI/ML - Model Hub", size: "201-500", hq: "New York, USA", reason: "Hugging Face hosts 500K+ models and is the GitHub of ML. Their infrastructure team is scaling to handle petabytes of model weights and billions of API calls." },
      { companyName: "Weights & Biases", contactName: "Chris Van Pelt", contactTitle: "CTO & Co-founder", industry: "AI/ML - MLOps", size: "201-500", hq: "San Francisco, USA", reason: "W&B is the leading ML experiment tracking platform. Their engineering team builds infrastructure for tracking millions of ML experiments at enterprise scale." },
    ],
  };

  // Match input industries to available pools
  const matchedCompanies: typeof industryCompanyMap["SaaS"] = [];
  for (const targetIndustry of input.targetIndustries) {
    const key = Object.keys(industryCompanyMap).find(
      (k) => k.toLowerCase().includes(targetIndustry.toLowerCase()) || targetIndustry.toLowerCase().includes(k.toLowerCase())
    );
    if (key) {
      matchedCompanies.push(...industryCompanyMap[key]);
    }
  }

  // If no matches, pull from all industries
  if (matchedCompanies.length === 0) {
    for (const companies of Object.values(industryCompanyMap)) {
      matchedCompanies.push(...companies);
    }
  }

  // Shuffle and pick diverse results (different industries)
  const shuffled = matchedCompanies.sort(() => Math.random() - 0.5);
  const seen = new Set<string>();
  const results: typeof matchedCompanies = [];
  for (const company of shuffled) {
    if (!seen.has(company.industry) || results.length < (input.maxResults || 5)) {
      seen.add(company.industry);
      results.push(company);
    }
    if (results.length >= (input.maxResults || 5)) break;
  }

  return results.map((c) => ({
    companyName: c.companyName,
    contactName: c.contactName,
    contactTitle: c.contactTitle,
    contactEmail: `${c.contactName.toLowerCase().replace(/\s+/g, ".")}@${c.companyName.toLowerCase().replace(/\s+/g, "")}.com`,
    reason: `${c.reason} This aligns with ${input.productName}'s value proposition in ${input.targetIndustries[0] || "technology"}.`,
    industry: c.industry,
    estimatedSize: c.size,
    headquarters: c.hq,
  }));
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

      const enrichment = await enrichViaApollo(targeted.companyName, targeted.contactName, targeted.contactTitle, targeted.location);
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
        const isDuplicate = await checkDuplicate(rec.companyName, rec.contactEmail);
        if (isDuplicate) continue;

        const enrichment = await enrichViaApollo(rec.companyName, rec.contactName, rec.contactTitle, rec.headquarters);

        // Override enrichment with discovery-provided data when available
        if (rec.contactName) enrichment.contactName = rec.contactName;
        if (rec.contactEmail) enrichment.contactEmail = rec.contactEmail;
        if (rec.industry) enrichment.industry = rec.industry;
        if (rec.estimatedSize) enrichment.companySize = rec.estimatedSize;
        if (rec.headquarters) enrichment.headquarters = rec.headquarters;

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
