import { Hono } from "hono";
import { nanoid } from "nanoid";
import { sseManager } from "../lib/sse.js";
import {
  runLeadIngestionAgent,
  runSignalScoutAgent,
  runIntentScorerAgent,
  runPersonaAnalystAgent,
} from "../agents/index.js";
import { db } from "../db/index.js";
import { campaigns, agentRuns } from "../db/schema.js";
import { config } from "../config.js";
import type { TargetedInput, DiscoveryInput, EnrichedLead } from "../types/index.js";

const api = new Hono();

// ─── Health Check ───
api.get("/health", (c) => {
  return c.json({
    status: "ok",
    simulationMode: config.simulationMode,
    hasAnthropicKey: !!config.anthropicApiKey && config.anthropicApiKey !== "sk-ant-xxxxx",
    hasApolloKey: !!config.apolloApiKey && config.apolloApiKey !== "xxxxx",
    hasTavilyKey: !!config.tavilyApiKey && config.tavilyApiKey !== "tvly-xxxxx",
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
      console.error("Pipeline error:", err);
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
      console.error("Pipeline error:", err);
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

// ─── Pipeline Orchestration (Agents 1-4 for now) ───

async function runTargetedPipeline(pipelineId: string, input: TargetedInput) {
  // Agent 1: Lead Ingestion
  const enrichedLeads = await runLeadIngestionAgent(input);

  if (enrichedLeads.length === 0) {
    sseManager.emit("pipeline_complete", "pipeline", {
      pipelineId,
      status: "no_leads",
      message: "No new leads to process (duplicate detected)",
    });
    return;
  }

  // For targeted mode, process the single lead
  const lead = enrichedLeads[0];
  await runParallelAgents(pipelineId, lead);
}

async function runDiscoveryPipeline(pipelineId: string, input: DiscoveryInput) {
  // Agent 1: Lead Ingestion (discovery mode — recommends + enriches)
  const enrichedLeads = await runLeadIngestionAgent(input);

  if (enrichedLeads.length === 0) {
    sseManager.emit("pipeline_complete", "pipeline", {
      pipelineId,
      status: "no_leads",
      message: "No leads discovered",
    });
    return;
  }

  // Process each discovered lead through agents 2-4
  const results = [];
  for (const lead of enrichedLeads) {
    const result = await runParallelAgents(pipelineId, lead);
    results.push(result);
  }

  sseManager.emit("pipeline_complete", "pipeline", {
    pipelineId,
    status: "complete",
    leadsProcessed: results.length,
    results,
  });
}

async function runParallelAgents(pipelineId: string, lead: EnrichedLead) {
  // Create campaign record
  db.insert(campaigns)
    .values({
      id: pipelineId,
      leadId: lead.id,
      mode: lead.source,
      status: "running",
      currentAgent: 2,
      simulationMode: config.simulationMode,
      startedAt: new Date().toISOString(),
    })
    .onConflictDoNothing()
    .run();

  // Agents 2, 3, 4 run in PARALLEL (Agent 3 needs Agent 2's output)
  // But per spec: 2, 3, 4 fire simultaneously
  // Agent 3 (Intent Scorer) needs signals from Agent 2
  // So we run 2 first, then 3 and 4 in parallel
  // Actually, re-reading the spec: "Fires in parallel with Agents 2 and 4"
  // Agent 3 uses "signal weight from Agent 2" but also fires in parallel
  // For the parallel execution we'll run 2 first, then 3,4 in parallel
  // OR we run all three, and Agent 3 uses a partial/empty signal bundle initially

  // Strategy: Run Agent 2 first (fast, just API calls), then 3 & 4 in parallel
  // This gives Agent 3 the signal data it needs while still being fast

  // Agent 2: Signal Scout
  const signalBundle = await runSignalScoutAgent(lead);

  // Agents 3 & 4 in parallel
  const [intentScore, personaProfile] = await Promise.all([
    runIntentScorerAgent(lead, signalBundle),
    runPersonaAnalystAgent(lead),
  ]);

  // Log agent runs
  const now = new Date().toISOString();
  for (const agent of [
    { num: 2, name: "Signal Scout", output: signalBundle },
    { num: 3, name: "Intent Scorer", output: intentScore },
    { num: 4, name: "Persona Analyst", output: personaProfile },
  ]) {
    db.insert(agentRuns)
      .values({
        id: nanoid(),
        leadId: lead.id,
        agentNumber: agent.num,
        agentName: agent.name,
        status: "complete",
        output: JSON.stringify(agent.output),
        completedAt: now,
      })
      .run();
  }

  return {
    lead,
    signalBundle,
    intentScore,
    personaProfile,
  };
}

// ─── Get Lead Status ───
api.get("/leads/:id", async (c) => {
  const leadId = c.req.param("id");

  // Query all related data
  // For now just return a placeholder — full implementation when we have more agents
  return c.json({
    leadId,
    message: "Lead details endpoint — will return full pipeline state",
  });
});

// ─── Simulation Mode Toggle ───
api.post("/config/simulation", async (c) => {
  const { enabled } = await c.req.json<{ enabled: boolean }>();
  // Note: This only changes runtime config, not the .env file
  (config as { simulationMode: boolean }).simulationMode = enabled;
  return c.json({ simulationMode: config.simulationMode });
});

export { api };
