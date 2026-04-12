/**
 * NERVE Pipeline — Mastra Workflow
 *
 * Maps the 10-agent pipeline into a Mastra Workflow with steps.
 * Each step wraps the real agent function so the existing logic runs unchanged,
 * while Mastra Studio visualises the DAG, streams step status, and logs I/O.
 */
import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";

import {
  runLeadIngestionAgent,
  runSignalScoutAgent,
  runIntentScorerAgent,
  runPersonaAnalystAgent,
  runStrategyCommanderAgent,
  runContentForgeAgent,
  runExplainerAgent,
  runDeliveryAgent,
  runResponseMonitorAgent,
  simulateNoReply,
  runLearningLoopAgent,
} from "../../agents/index.js";

// ─── Zod schemas (kept minimal — real validation is inside each agent) ───

const leadInputSchema = z.object({
  mode: z.enum(["targeted", "discovery"]),
  companyName: z.string().optional(),
  contactName: z.string().optional(),
  contactTitle: z.string().optional(),
  contactEmail: z.string().optional(),
  contactLinkedIn: z.string().optional(),
  location: z.string().optional(),
  additionalContext: z.string().optional(),
  productName: z.string().optional(),
  productDescription: z.string().optional(),
  targetIndustries: z.array(z.string()).optional(),
  targetCompanySize: z.string().optional(),
  targetGeographies: z.array(z.string()).optional(),
  idealCustomerProfile: z.string().optional(),
  maxResults: z.number().optional(),
});

const anyJsonSchema = z.record(z.unknown());

// ═══════ Step 1: Lead Ingestion ═══════
const step1_leadIngestion = createStep({
  id: "step-1-lead-ingestion",
  inputSchema: leadInputSchema,
  outputSchema: z.object({ lead: anyJsonSchema }),
  execute: async ({ inputData }) => {
    const leads = await runLeadIngestionAgent(inputData as any);
    const lead = leads[0]; // take the first enriched lead
    return { lead: lead as any };
  },
});

// ═══════ Step 2: Signal Scout ═══════
const step2_signalScout = createStep({
  id: "step-2-signal-scout",
  inputSchema: z.object({ lead: anyJsonSchema }),
  outputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema }),
  execute: async ({ inputData }) => {
    const signals = await runSignalScoutAgent(inputData.lead as any);
    return { lead: inputData.lead, signals: signals as any };
  },
});

// ═══════ Step 3: Intent Scorer ═══════
const step3_intentScorer = createStep({
  id: "step-3-intent-scorer",
  inputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema }),
  outputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema }),
  execute: async ({ inputData }) => {
    const intent = await runIntentScorerAgent(inputData.lead as any, inputData.signals as any);
    return { lead: inputData.lead, signals: inputData.signals, intent: intent as any };
  },
});

// ═══════ Step 4: Persona Analyst ═══════
const step4_personaAnalyst = createStep({
  id: "step-4-persona-analyst",
  inputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema }),
  outputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema }),
  execute: async ({ inputData }) => {
    const persona = await runPersonaAnalystAgent(inputData.lead as any);
    return { ...inputData, persona: persona as any };
  },
});

// ═══════ Step 5: Strategy Commander ═══════
const step5_strategyCommander = createStep({
  id: "step-5-strategy-commander",
  inputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema }),
  outputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema, strategy: anyJsonSchema }),
  execute: async ({ inputData }) => {
    const strategy = await runStrategyCommanderAgent(
      inputData.lead as any,
      inputData.signals as any,
      inputData.intent as any,
      inputData.persona as any,
    );
    return { ...inputData, strategy: strategy as any };
  },
});

// ═══════ Step 6: Content Forge ═══════
const step6_contentForge = createStep({
  id: "step-6-content-forge",
  inputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema, strategy: anyJsonSchema }),
  outputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema, strategy: anyJsonSchema, content: anyJsonSchema }),
  execute: async ({ inputData }) => {
    const content = await runContentForgeAgent(
      inputData.lead as any,
      inputData.signals as any,
      inputData.intent as any,
      inputData.persona as any,
      inputData.strategy as any,
    );
    return { ...inputData, content: content as any };
  },
});

// ═══════ Step 7: Explainer ═══════
const step7_explainer = createStep({
  id: "step-7-explainer",
  inputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema, strategy: anyJsonSchema, content: anyJsonSchema }),
  outputSchema: z.object({ lead: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema, strategy: anyJsonSchema, content: anyJsonSchema, rationale: anyJsonSchema }),
  execute: async ({ inputData }) => {
    const rationale = await runExplainerAgent(
      inputData.lead as any,
      inputData.signals as any,
      inputData.intent as any,
      inputData.persona as any,
      inputData.strategy as any,
      inputData.content as any,
    );
    return { ...inputData, rationale: rationale as any };
  },
});

// ═══════ Step 8: Delivery ═══════
const step8_delivery = createStep({
  id: "step-8-delivery",
  inputSchema: z.object({ lead: anyJsonSchema, strategy: anyJsonSchema, content: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema, rationale: anyJsonSchema }),
  outputSchema: z.object({ lead: anyJsonSchema, strategy: anyJsonSchema, content: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema, rationale: anyJsonSchema, delivery: z.array(anyJsonSchema) }),
  execute: async ({ inputData }) => {
    const delivery = await runDeliveryAgent(
      inputData.lead as any,
      inputData.strategy as any,
      inputData.content as any,
    );
    return { ...inputData, delivery: delivery as any };
  },
});

// ═══════ Step 9: Response Monitor (simulates no-reply) ═══════
const step9_responseMonitor = createStep({
  id: "step-9-response-monitor",
  inputSchema: z.object({ lead: anyJsonSchema, delivery: z.array(anyJsonSchema), strategy: anyJsonSchema, content: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema, rationale: anyJsonSchema }),
  outputSchema: z.object({ lead: anyJsonSchema, delivery: z.array(anyJsonSchema), strategy: anyJsonSchema, content: anyJsonSchema, signals: anyJsonSchema, intent: anyJsonSchema, persona: anyJsonSchema, rationale: anyJsonSchema, response: anyJsonSchema }),
  execute: async ({ inputData }) => {
    const lead = inputData.lead as any;
    const response = await simulateNoReply(lead.id, inputData.delivery as any);
    return { ...inputData, response: response as any };
  },
});

// ═══════ Step 10: Learning Loop ═══════
const step10_learningLoop = createStep({
  id: "step-10-learning-loop",
  inputSchema: z.object({ response: anyJsonSchema, intent: anyJsonSchema, strategy: anyJsonSchema, persona: anyJsonSchema, lead: anyJsonSchema, delivery: z.array(anyJsonSchema), content: anyJsonSchema, signals: anyJsonSchema, rationale: anyJsonSchema }),
  outputSchema: z.object({ learning: anyJsonSchema }),
  execute: async ({ inputData }) => {
    const learning = await runLearningLoopAgent(
      inputData.response as any,
      inputData.intent as any,
      inputData.strategy as any,
      inputData.persona as any,
    );
    return { learning: learning as any };
  },
});

// ═══════ The Full Pipeline Workflow ═══════
export const nervePipeline = createWorkflow({
  id: "nerve-pipeline",
  inputSchema: leadInputSchema,
  outputSchema: z.object({ learning: anyJsonSchema }),
})
  .then(step1_leadIngestion)
  .then(step2_signalScout)
  .then(step3_intentScorer)
  .then(step4_personaAnalyst)
  .then(step5_strategyCommander)
  .then(step6_contentForge)
  .then(step7_explainer)
  .then(step8_delivery)
  .then(step9_responseMonitor)
  .then(step10_learningLoop)
  .commit();
