/**
 * Mastra Entry Point — NERVE / CortexReach
 *
 * Registers all 10 agents and the pipeline workflow with Mastra.
 * Run `npx mastra dev` from the server/ directory to open Mastra Studio at localhost:4111
 */
import { Mastra } from "@mastra/core/mastra";

import {
  leadIngestionAgent,
  signalScoutAgent,
  intentScorerAgent,
  personaAnalystAgent,
  strategyCommanderAgent,
  contentForgeAgent,
  explainerAgent,
  deliveryAgent,
  responseMonitorAgent,
  learningLoopAgent,
} from "./agents/index.js";

import { nervePipeline } from "./workflows/nerve-pipeline.js";

export const mastra = new Mastra({
  server: {
    port: 4111, // Override PORT env var (3001 is used by the Hono API server)
  },
  agents: {
    leadIngestionAgent,
    signalScoutAgent,
    intentScorerAgent,
    personaAnalystAgent,
    strategyCommanderAgent,
    contentForgeAgent,
    explainerAgent,
    deliveryAgent,
    responseMonitorAgent,
    learningLoopAgent,
  },
  workflows: {
    nervePipeline,
  },
});
