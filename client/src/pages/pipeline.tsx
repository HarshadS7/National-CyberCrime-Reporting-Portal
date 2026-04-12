import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSSE } from "@/hooks/use-sse";
import { api } from "@/lib/api";
import type { LeadDetail } from "@/lib/types";
import AgentGraph from "@/components/agent-graph";
import RightPanel from "@/components/right-panel";
import ActivityLog from "@/components/activity-log";
import SimulateReply from "@/components/simulate-reply";
import { Button } from "@/components/ui/button";
import { GlowingBadge, StatusDot } from "@/components/ui/motion";
import {
  ArrowLeft,
  Wifi,
  WifiOff,
  RefreshCw,
  Building2,
  User,
  Zap,
  ToggleLeft,
  ToggleRight,
  Circle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function PipelinePage() {
  const { id } = useParams<{ id: string }>();
  const { events, connected, clear } = useSSE(id);
  const [detail, setDetail] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [simMode, setSimMode] = useState(true);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const d = await api.getLead(id);
      setDetail(d);
    } catch {
      // lead may not exist yet
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const realEvents = events.filter((e) => e.type !== "connected");
  useEffect(() => {
    const hasComplete = events.some((e) => e.type === "pipeline_complete");
    if (hasComplete) {
      const timer = setTimeout(fetchDetail, 500);
      return () => clearTimeout(timer);
    }
    if (realEvents.length > 0 || detail) {
      const interval = setInterval(fetchDetail, 3000);
      return () => clearInterval(interval);
    }
  }, [events, realEvents.length, detail, fetchDetail]);

  async function toggleSimulation() {
    try {
      const res = await api.setSimulation(!simMode);
      setSimMode(res.simulationMode);
    } catch {
      /* ignore */
    }
  }

  const lead = detail?.lead;
  const pipelineComplete = events.some((e) => e.type === "pipeline_complete");
  const isRunning = realEvents.length > 0 && !pipelineComplete;
  const completedAgents = detail?.agentRuns?.filter((r) => r.status === "complete").length || 0;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-2.5 border-b border-border/40 flex items-center gap-3 bg-card/20 backdrop-blur-sm">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs hover:bg-primary/10 hover:text-primary">
            <ArrowLeft className="size-3" /> Back
          </Button>
        </Link>

        <div className="h-4 w-px bg-border/40" />

        {lead ? (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 min-w-0"
          >
            <div className="size-6 rounded-md bg-primary/15 flex items-center justify-center">
              <Building2 className="size-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold truncate">{lead.companyName}</span>
            {lead.contactName && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <User className="size-3 text-muted-foreground/60" />
                <span className="text-xs text-muted-foreground truncate">{lead.contactName}</span>
              </>
            )}
          </motion.div>
        ) : (
          <span className="text-sm text-muted-foreground">
            {loading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="size-3 animate-spin" /> Loading…
              </span>
            ) : (
              "Pipeline"
            )}
          </span>
        )}

        {/* Pipeline Status */}
        <div className="flex items-center gap-1.5 ml-2">
          {pipelineComplete ? (
            <GlowingBadge variant="emerald" pulse>
              <CheckCircle2 className="size-2.5 mr-1" /> Complete
            </GlowingBadge>
          ) : isRunning ? (
            <GlowingBadge variant="purple" pulse>
              <StatusDot status="running" /> Running — {completedAgents}/10
            </GlowingBadge>
          ) : (
            <GlowingBadge variant="cyan">
              <Circle className="size-2.5 mr-1" /> Idle
            </GlowingBadge>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Simulation toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 h-7 text-xs hover:bg-blue-500/10"
            onClick={toggleSimulation}
          >
            {simMode ? (
              <ToggleRight className="size-3.5 text-blue-400" />
            ) : (
              <ToggleLeft className="size-3.5 text-muted-foreground" />
            )}
            <span className="font-mono text-[10px]">SIM {simMode ? "ON" : "OFF"}</span>
          </Button>

          {/* Connection indicator */}
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium border ${
              connected
                ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                : "border-red-500/30 bg-red-500/5 text-red-400"
            }`}
          >
            {connected ? <Wifi className="size-2.5" /> : <WifiOff className="size-2.5" />}
            {connected ? "SSE Live" : "Disconnected"}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-primary/10"
            onClick={() => {
              clear();
              fetchDetail();
            }}
          >
            <RefreshCw className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Main Content — 3 Column Layout ──────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left + Center: Graph + Activity */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Agent Graph */}
          <div className="flex-1 min-h-0">
            <AgentGraph sseEvents={events} agentRuns={detail?.agentRuns} />
          </div>

          {/* Bottom bar: Activity + Simulate */}
          <div className="shrink-0 h-56 border-t border-border/40 flex">
            {/* Activity Log */}
            <div className="flex-1 overflow-hidden">
              <div className="px-3 py-1.5 border-b border-border/40 flex items-center gap-2 bg-card/20 backdrop-blur-sm">
                <div className="size-4 rounded bg-primary/15 flex items-center justify-center">
                  <Zap className="size-2.5 text-primary" />
                </div>
                <span className="text-xs font-medium">Activity Feed</span>
                <div className="ml-auto flex items-center gap-1.5">
                  {isRunning && (
                    <span className="relative flex size-1.5">
                      <span className="absolute inline-flex size-full rounded-full bg-primary/60 animate-ping" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                    </span>
                  )}
                  <span className="text-[9px] font-mono text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">
                    {realEvents.length}
                  </span>
                </div>
              </div>
              <div className="h-[calc(100%-32px)]">
                <ActivityLog events={events} />
              </div>
            </div>

            {/* Simulate Reply Panel */}
            <div className="w-72 shrink-0 border-l border-border/40 p-3 flex flex-col justify-center bg-card/10">
              <SimulateReply
                leadId={id || ""}
                channel={
                  detail?.agentOutputs
                    ? ((detail.agentOutputs as Record<string, Record<string, unknown>>)["5"]
                        ?.primaryChannel as "email" | "linkedin_dm" | "whatsapp") || "email"
                    : "email"
                }
                disabled={!pipelineComplete && !detail?.agentRuns?.some((r) => r.agentNumber === 8 && r.status === "complete")}
                onSent={() => {
                  setTimeout(fetchDetail, 1000);
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 shrink-0 border-l border-border/40 overflow-hidden bg-card/10 backdrop-blur-sm">
          <RightPanel sseEvents={events} detail={detail} />
        </div>
      </div>
    </div>
  );
}
