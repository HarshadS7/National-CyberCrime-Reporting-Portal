import { Hono } from "hono";
import { nanoid } from "nanoid";
import { sseManager } from "../lib/sse.js";
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
} from "../agents/index.js";
import { db } from "../db/index.js";
import { campaigns, agentRuns, leads, deliveryLogs, responseEvents } from "../db/schema.js";
import { config } from "../config.js";
import { eq } from "drizzle-orm";
import type {
  TargetedInput,
  DiscoveryInput,
  EnrichedLead,
  IntentScore,
  PersonaProfile,
  OutreachStrategy,
  LearningResult,
  OutreachChannel,
} from "../types/index.js";

const api = new Hono();

// ─── Health Check ───
api.get("/health", (c) => {
  return c.json({
    status: "ok",
    simulationMode: config.simulationMode,
    hasGeminiKey: !!config.geminiApiKey && config.geminiApiKey.length > 10,
    hasApolloKey: !!config.apolloApiKey && config.apolloApiKey.length > 5,
    hasTavilyKey: !!config.tavilyApiKey && config.tavilyApiKey.length > 5,
    hasResendKey: !!config.resendApiKey && config.resendApiKey.length > 5,
    hasHeyReachKey: !!config.heyreachApiKey && config.heyreachApiKey.length > 5,
    hasAiSensyKey: !!config.aisensyApiKey && config.aisensyApiKey.length > 5,
    connectedClients: sseManager.getClientCount(),
    timestamp: new Date().toISOString(),
  });
});

// ─── SSE Events Stream ───
api.get("/events", (c) => {
  const clientId = nanoid();

  return c.newResponse(
    new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const leadId = c.req.query("leadId");

        const client = {
          id: clientId,
          leadId: leadId || undefined,
          send: (event: { type: string; data: unknown; leadId: string; timestamp: string }) => {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          },
          close: () => {
            try {
              controller.close();
            } catch {
              // Already closed
            }
          },
        };

        sseManager.addClient(client);

        // Send initial connection event
        client.send({
          type: "connected",
          data: { clientId, simulationMode: config.simulationMode },
          leadId: "system",
          timestamp: new Date().toISOString(),
        });
      },
      cancel() {
        sseManager.removeClient(clientId);
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    }
  );
});

// ─── Mode 1: Targeted Execution ───
// User provides a specific company name to evaluate
api.post("/leads/execute", async (c) => {
  try {
    const body = await c.req.json<{
      companyName: string;
      contactName?: string;
      contactTitle?: string;
      contactEmail?: string;
      contactLinkedIn?: string;
      location?: string;
      additionalContext?: string;
    }>();

    if (!body.companyName) {
      return c.json({ error: "companyName is required" }, 400);
    }

    const input: TargetedInput = {
      mode: "targeted",
      companyName: body.companyName,
      contactName: body.contactName,
      contactTitle: body.contactTitle,
      contactEmail: body.contactEmail,
      contactLinkedIn: body.contactLinkedIn,
      location: body.location,
      additionalContext: body.additionalContext,
    };

    // Run pipeline asynchronously
    const pipelineId = nanoid();
    runTargetedPipeline(pipelineId, input).catch((err) => {
      console.error("❌ Pipeline error:", err);
      sseManager.emit("error", "pipeline", { pipelineId, error: String(err) });
    });

    return c.json({
      pipelineId,
      mode: "targeted",
      companyName: body.companyName,
      status: "started",
      message: "Pipeline started — connect to /api/events for real-time updates",
    });
  } catch (error) {
    return c.json({ error: "Invalid request body" }, 400);
  }
});

// ─── Mode 2: Discovery ───
// System recommends companies based on product details
api.post("/leads/discover", async (c) => {
  try {
    const body = await c.req.json<{
      productName: string;
      productDescription: string;
      targetIndustries: string[];
      targetCompanySize?: string;
      targetGeographies?: string[];
      idealCustomerProfile?: string;
      maxResults?: number;
    }>();

    if (!body.productName || !body.productDescription || !body.targetIndustries?.length) {
      return c.json(
        { error: "productName, productDescription, and targetIndustries are required" },
        400
      );
    }

    const input: DiscoveryInput = {
      mode: "discovery",
      productName: body.productName,
      productDescription: body.productDescription,
      targetIndustries: body.targetIndustries,
      targetCompanySize: body.targetCompanySize,
      targetGeographies: body.targetGeographies,
      idealCustomerProfile: body.idealCustomerProfile,
      maxResults: body.maxResults || 5,
    };

    const pipelineId = nanoid();
    runDiscoveryPipeline(pipelineId, input).catch((err) => {
      console.error("❌ Pipeline error:", err);
      sseManager.emit("error", "pipeline", { pipelineId, error: String(err) });
    });

    return c.json({
      pipelineId,
      mode: "discovery",
      productName: body.productName,
      status: "started",
      message: "Discovery pipeline started — connect to /api/events for real-time updates",
    });
  } catch (error) {
    return c.json({ error: "Invalid request body" }, 400);
  }
});

// ═══════════════════════════════════════════════════════════════════
//  PIPELINE ORCHESTRATION — Full 10-Agent DAG
//
//  Agent 1 → 2 → parallel(3, 4) → 5 → parallel(6, 7) → 8 → 9 → 10
//
//  Conditional branches after Agent 9:
//    positive  → escalate_human (stop cadence, notify sales)
//    negative  → cancel_sequence (do-not-contact, stop outreach)
//    neutral   → continue_cadence (proceed with Touch 2/3)
//    no_reply  → nurture (long-term drip)
// ═══════════════════════════════════════════════════════════════════

async function runTargetedPipeline(pipelineId: string, input: TargetedInput) {
  console.log(`\n🚀 Pipeline ${pipelineId} started — Targeted: ${input.companyName}`);

  const enrichedLeads = await runLeadIngestionAgent(input);

  if (enrichedLeads.length === 0) {
    sseManager.emit("pipeline_complete", "pipeline", {
      pipelineId,
      status: "no_leads",
      message: "No new leads to process (duplicate detected)",
    });
    return;
  }

  const lead = enrichedLeads[0];
  await runFullPipeline(pipelineId, lead);
}

async function runDiscoveryPipeline(pipelineId: string, input: DiscoveryInput) {
  console.log(`\n🚀 Pipeline ${pipelineId} started — Discovery: ${input.productName}`);

  const enrichedLeads = await runLeadIngestionAgent(input);

  if (enrichedLeads.length === 0) {
    sseManager.emit("pipeline_complete", "pipeline", {
      pipelineId,
      status: "no_leads",
      message: "No leads discovered",
    });
    return;
  }

  const results = [];
  for (const lead of enrichedLeads) {
    const result = await runFullPipeline(pipelineId, lead);
    results.push(result);
  }

  sseManager.emit("pipeline_complete", "pipeline", {
    pipelineId,
    status: "complete",
    leadsProcessed: results.length,
  });
}

async function runFullPipeline(pipelineId: string, lead: EnrichedLead) {
  const pipelineStart = Date.now();

  // Create campaign record
  db.insert(campaigns)
    .values({
      id: `${pipelineId}-${lead.id}`,
      leadId: lead.id,
      mode: lead.source,
      status: "running",
      currentAgent: 1,
      simulationMode: config.simulationMode,
      startedAt: new Date().toISOString(),
    })
    .onConflictDoNothing()
    .run();

  // ── Agent 1: Lead Ingestion (already ran) ──
  logAgentRun(lead.id, 1, "Lead Ingestion", lead);

  // ── Agent 2: Signal Scout ──
  updateCampaignAgent(lead.id, 2);
  const signalBundle = await runSignalScoutAgent(lead);
  logAgentRun(lead.id, 2, "Signal Scout", signalBundle);

  // ── Agents 3 & 4 in parallel ──
  updateCampaignAgent(lead.id, 3);
  const [intentScore, personaProfile] = await Promise.all([
    runIntentScorerAgent(lead, signalBundle),
    runPersonaAnalystAgent(lead),
  ]);
  logAgentRun(lead.id, 3, "Intent Scorer", intentScore);
  logAgentRun(lead.id, 4, "Persona Analyst", personaProfile);

  // ── Agent 5: Strategy Commander ──
  updateCampaignAgent(lead.id, 5);
  const strategy = await runStrategyCommanderAgent(lead, signalBundle, intentScore, personaProfile);
  logAgentRun(lead.id, 5, "Strategy Commander", strategy);

  // ── Agents 6 & 7 in parallel ──
  updateCampaignAgent(lead.id, 6);
  const [content, rationale] = await Promise.all([
    runContentForgeAgent(lead, signalBundle, intentScore, personaProfile, strategy),
    runExplainerAgent(lead, signalBundle, intentScore, personaProfile, strategy, {
      // Placeholder content for Agent 7 — runs in parallel with 6
      leadId: lead.id,
      touches: [],
      generatedAt: new Date().toISOString(),
    }),
  ]);
  logAgentRun(lead.id, 6, "Content Forge", content);
  logAgentRun(lead.id, 7, "Explainer", rationale);

  // ── Agent 8: Delivery ──
  updateCampaignAgent(lead.id, 8);
  const deliveryResults = await runDeliveryAgent(lead, strategy, content);
  logAgentRun(lead.id, 8, "Delivery Agent", { results: deliveryResults });

  // ── Agent 9: Response Monitor ──
  // In a live system, this waits for webhooks (POST /api/webhook/response).
  // For the pipeline demo, we simulate a "no_reply" to complete the flow.
  updateCampaignAgent(lead.id, 9);
  const responseEvent = await simulateNoReply(lead.id, deliveryResults);
  logAgentRun(lead.id, 9, "Response Monitor", responseEvent);

  // ── Conditional Branch ──
  switch (responseEvent.action) {
    case "escalate_human":
      console.log(`🟢 POSITIVE: ${lead.contactName} — escalating to human sales rep`);
      sseManager.emit("branch_decision", lead.id, {
        pipelineId,
        action: "escalate_human",
        message: `Positive response from ${lead.contactName} — handed off to sales team`,
      });
      break;

    case "cancel_sequence":
      console.log(`🔴 NEGATIVE: ${lead.contactName} — stopping all outreach, marked do-not-contact`);
      sseManager.emit("branch_decision", lead.id, {
        pipelineId,
        action: "cancel_sequence",
        message: `Negative response — ${lead.contactName} marked as do-not-contact`,
      });
      break;

    case "nurture":
      console.log(`🟡 NO REPLY: ${lead.contactName} — entering nurture sequence`);
      sseManager.emit("branch_decision", lead.id, {
        pipelineId,
        action: "nurture",
        message: `No reply from ${lead.contactName} — added to nurture sequence`,
      });
      break;

    case "continue_cadence":
      console.log(`🔵 NEUTRAL: ${lead.contactName} — continuing cadence (Touch 2/3)`);
      sseManager.emit("branch_decision", lead.id, {
        pipelineId,
        action: "continue_cadence",
        message: `Neutral response — continuing ${strategy.cadence.length}-touch cadence`,
      });
      break;
  }

  // ── Agent 10: Learning Loop (runs regardless of outcome) ──
  updateCampaignAgent(lead.id, 10);
  const learningResult: LearningResult = await runLearningLoopAgent(
    responseEvent,
    intentScore,
    strategy,
    personaProfile
  );
  logAgentRun(lead.id, 10, "Learning Loop", learningResult);

  // Finalize campaign
  const finalStatus = responseEvent.action === "cancel_sequence" ? "cancelled" : "completed";
  db.update(campaigns)
    .set({
      status: finalStatus,
      currentAgent: 10,
      completedAt: new Date().toISOString(),
    })
    .where(eq(campaigns.leadId, lead.id))
    .run();

  const totalMs = Date.now() - pipelineStart;
  console.log(`\n🏁 Pipeline complete for ${lead.contactName} @ ${lead.companyName} in ${totalMs}ms`);
  console.log(`   Score: ${intentScore.compositeScore}/100 (${intentScore.tier}) | Channel: ${strategy.primaryChannel} | Outcome: ${responseEvent.action}`);

  sseManager.emit("pipeline_complete", lead.id, {
    pipelineId,
    status: finalStatus,
    action: responseEvent.action,
    totalDurationMs: totalMs,
    summary: {
      lead: `${lead.contactName} @ ${lead.companyName}`,
      score: intentScore.compositeScore,
      tier: intentScore.tier,
      channel: strategy.primaryChannel,
      outcome: responseEvent.action,
    },
  });

  return {
    lead,
    signalBundle,
    intentScore,
    personaProfile,
    strategy,
    content,
    rationale,
    deliveryResults,
    responseEvent,
    learningResult,
    totalDurationMs: totalMs,
  };
}

// ─── Helpers ───

function logAgentRun(leadId: string, agentNumber: number, agentName: string, output: unknown) {
  db.insert(agentRuns)
    .values({
      id: nanoid(),
      leadId,
      agentNumber,
      agentName,
      status: "complete",
      output: JSON.stringify(output),
      completedAt: new Date().toISOString(),
    })
    .run();
}

function updateCampaignAgent(leadId: string, agentNumber: number) {
  db.update(campaigns)
    .set({ currentAgent: agentNumber })
    .where(eq(campaigns.leadId, leadId))
    .run();
}

// ─── Webhook: Receive Response Events ───
// External services (email replies, LinkedIn messages, WhatsApp) post here
api.post("/webhook/response", async (c) => {
  try {
    const body = await c.req.json<{
      leadId: string;
      channel: OutreachChannel;
      messageBody?: string;
    }>();

    if (!body.leadId || !body.channel) {
      return c.json({ error: "leadId and channel are required" }, 400);
    }

    // Verify lead exists
    const lead = db.select().from(leads).where(eq(leads.id, body.leadId)).get();
    if (!lead) {
      return c.json({ error: "Lead not found" }, 404);
    }

    // Run Agent 9 (Response Monitor) with real message
    const responseEvent = await runResponseMonitorAgent(body.leadId, body.channel, body.messageBody);
    logAgentRun(body.leadId, 9, "Response Monitor", responseEvent);

    // Retrieve prior agent outputs for Agent 10
    const agentRunsData = db.select().from(agentRuns).where(eq(agentRuns.leadId, body.leadId)).all();
    const agent3Output = agentRunsData.find((r) => r.agentNumber === 3);
    const agent4Output = agentRunsData.find((r) => r.agentNumber === 4);
    const agent5Output = agentRunsData.find((r) => r.agentNumber === 5);

    if (agent3Output?.output && agent4Output?.output && agent5Output?.output) {
      const intent = JSON.parse(agent3Output.output) as IntentScore;
      const persona = JSON.parse(agent4Output.output) as PersonaProfile;
      const strategy = JSON.parse(agent5Output.output) as OutreachStrategy;

      // Run Agent 10 (Learning Loop)
      const learning = await runLearningLoopAgent(responseEvent, intent, strategy, persona);
      logAgentRun(body.leadId, 10, "Learning Loop", learning);
    }

    return c.json({
      status: "processed",
      sentiment: responseEvent.sentiment,
      action: responseEvent.action,
      reasoning: responseEvent.classificationReasoning,
    });
  } catch (error) {
    return c.json({ error: "Failed to process webhook" }, 500);
  }
});

// ─── Get Lead Full State ───
api.get("/leads/:id", async (c) => {
  const leadId = c.req.param("id");

  const lead = db.select().from(leads).where(eq(leads.id, leadId)).get();
  if (!lead) {
    return c.json({ error: "Lead not found" }, 404);
  }

  const runs = db.select().from(agentRuns).where(eq(agentRuns.leadId, leadId)).all();
  const deliveries = db.select().from(deliveryLogs).where(eq(deliveryLogs.leadId, leadId)).all();
  const responses = db.select().from(responseEvents).where(eq(responseEvents.leadId, leadId)).all();

  // Parse agent outputs
  const agentOutputs: Record<number, unknown> = {};
  for (const run of runs) {
    if (run.output) {
      try {
        agentOutputs[run.agentNumber] = JSON.parse(run.output);
      } catch {
        agentOutputs[run.agentNumber] = run.output;
      }
    }
  }

  return c.json({
    lead,
    agentRuns: runs,
    agentOutputs,
    deliveries,
    responses,
  });
});

// ─── Get All Leads ───
api.get("/leads", async (c) => {
  const allLeads = db.select().from(leads).all();
  return c.json({ leads: allLeads, count: allLeads.length });
});

// ─── Simulation Mode Toggle ───
api.post("/config/simulation", async (c) => {
  const { enabled } = await c.req.json<{ enabled: boolean }>();
  // Note: This only changes runtime config, not the .env file
  (config as { simulationMode: boolean }).simulationMode = enabled;
  return c.json({ simulationMode: config.simulationMode });
});

export { api };
