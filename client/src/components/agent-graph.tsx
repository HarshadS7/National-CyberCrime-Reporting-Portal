import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AgentNode, type AgentNodePayload } from "./agent-node";
import type { AgentStatus, SSEEvent, AgentRun } from "@/lib/types";

const nodeTypes = { agent: AgentNode };

// DAG layout positions (hand-placed for the pipeline shape)
const AGENT_DEFS: { id: string; num: number; label: string; short: string; x: number; y: number }[] = [
  { id: "a1", num: 1, label: "Lead Ingestion", short: "Lead Ingestion", x: 0, y: 120 },
  { id: "a2", num: 2, label: "Signal Scout", short: "Signal Scout", x: 200, y: 120 },
  { id: "a3", num: 3, label: "Intent Scorer", short: "Intent Scorer", x: 400, y: 40 },
  { id: "a4", num: 4, label: "Persona Analyst", short: "Persona Analyst", x: 400, y: 200 },
  { id: "a5", num: 5, label: "Strategy Commander", short: "Strategy Cmdr", x: 620, y: 120 },
  { id: "a6", num: 6, label: "Content Forge", short: "Content Forge", x: 840, y: 40 },
  { id: "a7", num: 7, label: "Explainer", short: "Explainer", x: 840, y: 200 },
  { id: "a8", num: 8, label: "Delivery", short: "Delivery", x: 1060, y: 120 },
  { id: "a9", num: 9, label: "Response Monitor", short: "Resp. Monitor", x: 1280, y: 120 },
  { id: "a10", num: 10, label: "Learning Loop", short: "Learning Loop", x: 1500, y: 120 },
];

const EDGE_DEFS: [string, string][] = [
  ["a1", "a2"],
  ["a2", "a3"],
  ["a2", "a4"],
  ["a3", "a5"],
  ["a4", "a5"],
  ["a5", "a6"],
  ["a5", "a7"],
  ["a6", "a8"],
  ["a7", "a8"],
  ["a8", "a9"],
  ["a9", "a10"],
];

function buildNodes(statuses: Record<number, AgentStatus>, summaries: Record<number, string>): Node[] {
  return AGENT_DEFS.map((a) => ({
    id: a.id,
    type: "agent",
    position: { x: a.x, y: a.y },
    draggable: false,
    data: {
      agentNumber: a.num,
      label: a.label,
      shortLabel: a.short,
      status: statuses[a.num] || "idle",
      outputSummary: summaries[a.num] || undefined,
    } satisfies AgentNodePayload,
  }));
}

function buildEdges(statuses: Record<number, AgentStatus>): Edge[] {
  return EDGE_DEFS.map(([from, to], i) => {
    const fromNum = AGENT_DEFS.find((a) => a.id === from)!.num;
    const toNum = AGENT_DEFS.find((a) => a.id === to)!.num;
    const fromComplete = statuses[fromNum] === "complete";
    const toActive = statuses[toNum] === "running" || statuses[toNum] === "complete";

    // Dynamic styling based on state
    let stroke = "rgba(80, 80, 100, 0.2)";
    let strokeWidth = 1.5;
    let animated = false;

    if (fromComplete && toActive) {
      stroke = "rgba(16, 185, 129, 0.7)"; // emerald glow
      strokeWidth = 2.5;
      animated = true;
    } else if (fromComplete) {
      stroke = "rgba(16, 185, 129, 0.4)";
      strokeWidth = 2;
    }

    // Running edge gets purple glow
    if (statuses[toNum] === "running" && fromComplete) {
      stroke = "rgba(168, 85, 247, 0.7)"; // purple glow
      animated = true;
    }

    return {
      id: `e${i}`,
      source: from,
      target: to,
      animated,
      style: {
        stroke,
        strokeWidth,
        filter: animated ? "drop-shadow(0 0 4px rgba(168, 85, 247, 0.4))" : undefined,
      },
    };
  });
}

interface Props {
  sseEvents: SSEEvent[];
  agentRuns?: AgentRun[];
}

export default function AgentGraph({ sseEvents, agentRuns }: Props) {
  const { statuses, summaries } = useMemo(() => {
    const st: Record<number, AgentStatus> = {};
    const sm: Record<number, string> = {};

    if (agentRuns) {
      for (const run of agentRuns) {
        st[run.agentNumber] = run.status === "complete" ? "complete" : "idle";
        if (run.output) {
          try {
            const o = JSON.parse(run.output);
            sm[run.agentNumber] = extractSummary(run.agentNumber, o);
          } catch {
            /* skip */
          }
        }
      }
    }

    for (const ev of sseEvents) {
      if (ev.type === "agent_status") {
        const d = ev.data as { agentNumber?: number; status?: AgentStatus; summary?: string };
        if (d.agentNumber) {
          st[d.agentNumber] = d.status || "running";
          if (d.summary) sm[d.agentNumber] = d.summary;
        }
      }
      if (ev.type === "score_update") st[3] = "complete";
      if (ev.type === "strategy_update") st[5] = "complete";
      if (ev.type === "content_update") st[6] = "complete";
      if (ev.type === "delivery_update") st[8] = "complete";
      if (ev.type === "response_update") st[9] = "complete";
      if (ev.type === "learning_update") st[10] = "complete";
      if (ev.type === "pipeline_complete") {
        for (let i = 1; i <= 10; i++) st[i] = "complete";
      }
    }

    return { statuses: st, summaries: sm };
  }, [sseEvents, agentRuns]);

  const initialNodes = useMemo(() => buildNodes(statuses, summaries), [statuses, summaries]);
  const initialEdges = useMemo(() => buildEdges(statuses), [statuses]);

  const [, , onNodesChange] = useNodesState(initialNodes);
  const [, , onEdgesChange] = useEdgesState(initialEdges);

  const effectiveNodes = useMemo(() => buildNodes(statuses, summaries), [statuses, summaries]);
  const effectiveEdges = useMemo(() => buildEdges(statuses), [statuses]);

  const onInit = useCallback(() => {}, []);

  return (
    <div className="h-full w-full overflow-hidden relative">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <ReactFlow
        nodes={effectiveNodes}
        edges={effectiveEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={1.5}
        className="bg-transparent"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(120, 120, 160, 0.12)"
        />
      </ReactFlow>
    </div>
  );
}

function extractSummary(num: number, o: Record<string, unknown>): string {
  switch (num) {
    case 1: return `${o.contactName || "Lead"} @ ${o.companyName || "?"}`;
    case 2: return `${(o.signals as unknown[])?.length || 0} signals`;
    case 3: return `${o.compositeScore}/100 (${o.tier})`;
    case 4: return `${o.archetypeLabel}`;
    case 5: return `${o.primaryChannel} | ${o.toneFramework}`;
    case 6: return `${(o.touches as unknown[])?.length || 0} touches`;
    case 7: return `${(o.explanations as unknown[])?.length || 0} rationale items`;
    case 8: {
      const results = o.results as unknown[] | undefined;
      return `${results?.length || 0} deliveries`;
    }
    case 9: return `${o.sentiment} → ${o.action}`;
    case 10: return `${(o.weightUpdates as unknown[])?.length || 0} updates`;
    default: return "";
  }
}
