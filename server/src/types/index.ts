// ─── Execution Modes ───
export type ExecutionMode = "targeted" | "discovery";

// Mode 1: Targeted — user provides a specific company to evaluate
export interface TargetedInput {
  mode: "targeted";
  companyName: string;
  contactName?: string;
  contactTitle?: string;
  contactEmail?: string;
  contactLinkedIn?: string;
  location?: string;
  additionalContext?: string;
}

// Mode 2: Discovery — system recommends companies based on user's product
export interface DiscoveryInput {
  mode: "discovery";
  productName: string;
  productDescription: string;
  targetIndustries: string[];
  targetCompanySize?: string; // e.g. "50-200", "200-1000", "1000+"
  targetGeographies?: string[];
  idealCustomerProfile?: string;
  maxResults?: number;
}

export type LeadInput = TargetedInput | DiscoveryInput;

// ─── Enriched Lead (output of Agent 1) ───
export interface EnrichedLead {
  id: string;
  // Company info
  companyName: string;
  companyDomain?: string;
  companySize?: string;
  industry?: string;
  fundingStage?: string;
  fundingAmount?: string;
  techStack?: string[];
  headquarters?: string;
  // Contact info
  contactName: string;
  contactTitle: string;
  contactEmail?: string;
  contactPhone?: string;
  contactLinkedIn?: string;
  seniority?: "C-Level" | "VP" | "Director" | "Manager" | "Individual Contributor";
  // Meta
  source: "targeted" | "discovery";
  enrichedAt: string;
  rawInput: TargetedInput | DiscoveryInput;
}

// ─── Signal (output of Agent 2) ───
export type SignalCategory =
  | "funding"
  | "product_launch"
  | "executive_hire"
  | "geographic_expansion"
  | "hiring_spike"
  | "linkedin_activity"
  | "partnership"
  | "award"
  | "other";

export type SignalStrength = "HIGH" | "MEDIUM" | "LOW";

export interface Signal {
  id: string;
  category: SignalCategory;
  title: string;
  description: string;
  source: string;
  sourceUrl?: string;
  dateDetected: string;
  recencyDays: number;
  strength: SignalStrength;
  recencyWeight: number; // 0-1, decays with age
}

export interface SignalBundle {
  leadId: string;
  signals: Signal[];
  topSignal: Signal | null;
  linkedinActivityScore: number; // 0-100
  overallSignalStrength: SignalStrength;
  generatedAt: string;
}

// ─── Intent Score (output of Agent 3) ───
export interface ScoreDimension {
  name: string;
  rawScore: number; // 0-100
  weight: number; // 0-1
  weightedScore: number; // rawScore * weight
  reasoning: string;
}

export interface IntentScore {
  leadId: string;
  compositeScore: number; // 0-100
  tier: "HOT" | "WARM" | "COOL" | "COLD";
  dimensions: ScoreDimension[];
  topContributors: string[]; // top 3 dimension names
  generatedAt: string;
}

// ─── Persona (output of Agent 4) ───
export type PersonaArchetype =
  | "strategic_executive"
  | "practitioner"
  | "innovator"
  | "networker";

export interface PersonaProfile {
  leadId: string;
  archetype: PersonaArchetype;
  archetypeLabel: string; // "Strategic Executive", etc.
  confidence: number; // 0-1
  traits: string[];
  communicationStyle: string;
  preferredTone: string;
  avoidInMessaging: string[];
  reasoning: string;
  generatedAt: string;
}

// ─── Strategy (output of Agent 5) ───
export type OutreachChannel = "linkedin_dm" | "email" | "whatsapp";
export type ToneFramework =
  | "insight_led"
  | "peer_problem"
  | "challenger"
  | "relationship_first"
  | "growth_urgency";

export interface TouchPoint {
  touchNumber: 1 | 2 | 3;
  channel: OutreachChannel;
  scheduledAt: string; // ISO timestamp
  dayOffset: number; // days from Touch 1
  toneFramework: ToneFramework;
}

export interface OutreachStrategy {
  leadId: string;
  primaryChannel: OutreachChannel;
  secondaryChannel?: OutreachChannel;
  sendTimestamp: string; // ISO — when Touch 1 fires
  timezone: string;
  toneFramework: ToneFramework;
  cadence: TouchPoint[];
  decisions: StrategyDecision[];
  generatedAt: string;
}

export interface StrategyDecision {
  decision: string;
  reasoning: string;
  factors: string[];
}

// ─── Content (output of Agent 6) ───
export interface GeneratedContent {
  leadId: string;
  touches: TouchContent[];
  linkedinPost?: string;
  linkedinHeadlineSuggestion?: string;
  generatedAt: string;
}

export interface TouchContent {
  touchNumber: 1 | 2 | 3;
  channel: OutreachChannel;
  subject?: string; // email only
  body: string;
  preview: string; // first 100 chars
}

// ─── Rationale (output of Agent 7) ───
export interface DecisionRationale {
  leadId: string;
  explanations: RationaleItem[];
  summary: string;
  graphData: AgentGraphData;
  generatedAt: string;
}

export interface RationaleItem {
  agentName: string;
  decision: string;
  explanation: string;
  confidence: number;
}

// ─── Agent Graph (for frontend React Flow) ───
export type AgentStatus = "idle" | "running" | "complete" | "error";

export interface AgentNode {
  agentId: string;
  agentName: string;
  agentNumber: number;
  status: AgentStatus;
  startedAt?: string;
  completedAt?: string;
  outputSummary?: string;
  error?: string;
}

export interface AgentEdge {
  from: string;
  to: string;
  animated: boolean;
  dataFlowing: boolean;
}

export interface AgentGraphData {
  nodes: AgentNode[];
  edges: AgentEdge[];
}

// ─── Delivery (output of Agent 8) ───
export interface DeliveryResult {
  leadId: string;
  touchNumber: number;
  channel: OutreachChannel;
  status: "sent" | "queued" | "failed" | "simulated";
  messageId?: string;
  sentAt: string;
  simulationMode: boolean;
  rawApiResponse?: unknown;
}

// ─── Response (input to Agent 9) ───
export type ResponseSentiment = "positive" | "neutral" | "negative" | "no_reply";

export interface ResponseEvent {
  leadId: string;
  channel: OutreachChannel;
  messageBody?: string;
  sentiment: ResponseSentiment;
  classificationReasoning: string;
  receivedAt: string;
  action: "escalate_human" | "continue_cadence" | "cancel_sequence" | "nurture";
}

// ─── Learning Update (output of Agent 10) ───
export interface WeightUpdate {
  dimension: string;
  previousWeight: number;
  newWeight: number;
  delta: number;
  reason: string;
}

export interface LearningResult {
  leadId: string;
  weightUpdates: WeightUpdate[];
  heuristicUpdates: string[];
  toneRuleUpdates: string[];
  updatedAt: string;
}

// ─── SSE Events ───
export type SSEEventType =
  | "agent_status"
  | "score_update"
  | "signal_update"
  | "strategy_update"
  | "content_update"
  | "rationale_update"
  | "delivery_update"
  | "response_update"
  | "learning_update"
  | "error"
  | "pipeline_complete";

export interface SSEEvent {
  type: SSEEventType;
  leadId: string;
  data: unknown;
  timestamp: string;
}

// ─── Scoring Weights (persisted in DB, updated by Agent 10) ───
export interface ScoringWeights {
  icpFit: number;
  seniority: number;
  geography: number;
  industryRelevance: number;
  companySize: number;
  fundingStage: number;
  signalStrength: number;
  linkedinActivity: number;
  engagementHistory: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  icpFit: 0.15,
  seniority: 0.12,
  geography: 0.08,
  industryRelevance: 0.13,
  companySize: 0.08,
  fundingStage: 0.12,
  signalStrength: 0.15,
  linkedinActivity: 0.07,
  engagementHistory: 0.10,
};
