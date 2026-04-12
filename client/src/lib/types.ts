// ─── Frontend types mirroring backend ───

export type AgentStatus = "idle" | "running" | "complete" | "error";
export type OutreachChannel = "linkedin_dm" | "email" | "whatsapp";
export type ResponseSentiment = "positive" | "neutral" | "negative" | "no_reply";
export type ToneFramework = "insight_led" | "peer_problem" | "challenger" | "relationship_first" | "growth_urgency";
export type IntentTier = "HOT" | "WARM" | "COOL" | "COLD";
export type SignalStrength = "HIGH" | "MEDIUM" | "LOW";
export type PersonaArchetype = "strategic_executive" | "practitioner" | "innovator" | "networker";

export interface Lead {
  id: string;
  companyName: string;
  companyDomain?: string;
  companySize?: string;
  industry?: string;
  fundingStage?: string;
  fundingAmount?: string;
  techStack?: string;
  headquarters?: string;
  contactName: string;
  contactTitle: string;
  contactEmail?: string;
  contactPhone?: string;
  contactLinkedIn?: string;
  seniority?: string;
  source: "targeted" | "discovery";
  status: string;
  rawInput?: string;
  enrichedAt?: string;
  createdAt?: string;
}

export interface Signal {
  id: string;
  category: string;
  title: string;
  description: string;
  source: string;
  sourceUrl?: string;
  dateDetected: string;
  recencyDays: number;
  strength: SignalStrength;
  recencyWeight: number;
}

export interface SignalBundle {
  leadId: string;
  signals: Signal[];
  topSignal: Signal | null;
  linkedinActivityScore: number;
  overallSignalStrength: SignalStrength;
  generatedAt: string;
}

export interface ScoreDimension {
  name: string;
  rawScore: number;
  weight: number;
  weightedScore: number;
  reasoning: string;
}

export interface IntentScore {
  leadId: string;
  compositeScore: number;
  tier: IntentTier;
  dimensions: ScoreDimension[];
  topContributors: string[];
  generatedAt: string;
}

export interface PersonaProfile {
  leadId: string;
  archetype: PersonaArchetype;
  archetypeLabel: string;
  confidence: number;
  traits: string[];
  communicationStyle: string;
  preferredTone: string;
  avoidInMessaging: string[];
  reasoning: string;
  generatedAt: string;
}

export interface TouchPoint {
  touchNumber: 1 | 2 | 3;
  channel: OutreachChannel;
  scheduledAt: string;
  dayOffset: number;
  toneFramework: ToneFramework;
}

export interface StrategyDecision {
  decision: string;
  reasoning: string;
  factors: string[];
}

export interface OutreachStrategy {
  leadId: string;
  primaryChannel: OutreachChannel;
  secondaryChannel?: OutreachChannel;
  sendTimestamp: string;
  timezone: string;
  toneFramework: ToneFramework;
  cadence: TouchPoint[];
  decisions: StrategyDecision[];
  generatedAt: string;
}

export interface TouchContent {
  touchNumber: 1 | 2 | 3;
  channel: OutreachChannel;
  subject?: string;
  body: string;
  preview: string;
}

export interface GeneratedContent {
  leadId: string;
  touches: TouchContent[];
  linkedinPost?: string;
  linkedinHeadlineSuggestion?: string;
  generatedAt: string;
}

export interface RationaleItem {
  agentName: string;
  decision: string;
  explanation: string;
  confidence: number;
}

export interface DecisionRationale {
  leadId: string;
  explanations: RationaleItem[];
  summary: string;
  graphData: {
    nodes: AgentNodeData[];
    edges: AgentEdgeData[];
  };
  generatedAt: string;
}

export interface AgentNodeData {
  agentId: string;
  agentName: string;
  agentNumber: number;
  status: AgentStatus;
  startedAt?: string;
  completedAt?: string;
  outputSummary?: string;
  error?: string;
}

export interface AgentEdgeData {
  from: string;
  to: string;
  animated: boolean;
  dataFlowing: boolean;
}

export interface DeliveryResult {
  leadId: string;
  touchNumber: number;
  channel: OutreachChannel;
  status: "sent" | "queued" | "failed" | "simulated";
  messageId?: string;
  sentAt: string;
  simulationMode: boolean;
}

export interface ResponseEvent {
  leadId: string;
  channel: OutreachChannel;
  messageBody?: string;
  sentiment: ResponseSentiment;
  classificationReasoning: string;
  receivedAt: string;
  action: "escalate_human" | "continue_cadence" | "cancel_sequence" | "nurture";
}

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

export interface AgentRun {
  id: string;
  leadId: string;
  agentNumber: number;
  agentName: string;
  status: string;
  input?: string | null;
  output?: string | null;
  error?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  durationMs?: number | null;
}

export interface LeadDetail {
  lead: Lead;
  agentRuns: AgentRun[];
  agentOutputs: Record<string, unknown>;
  deliveries: DeliveryResult[];
  responses: ResponseEvent[];
}

export interface SSEEvent {
  type: string;
  leadId: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface HealthCheck {
  status: string;
  simulationMode: boolean;
  hasGroqKey: boolean;
  hasApolloKey: boolean;
  hasTavilyKey: boolean;
  hasResendKey: boolean;
  hasHeyReachKey: boolean;
  hasAiSensyKey: boolean;
  connectedClients: number;
  timestamp: string;
}
