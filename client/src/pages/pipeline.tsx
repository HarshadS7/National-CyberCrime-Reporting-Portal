import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSSE } from "@/hooks/use-sse";
import { api } from "@/lib/api";
import type { LeadDetail, AgentRun } from "@/lib/types";
import { PhaseContainer } from "@/components/pipeline/phase-container";
import type { PhaseStatus } from "@/components/pipeline/phase-container";
import {
  ThinkingIndicator,
  OutcomeCard,
  OutcomeRow,
  DataChip,
  MetricTile,
  StreamItem,
  AgentTile,
  ScoreBar,
} from "@/components/pipeline/phase-outputs";
import { StreamingText } from "@/components/ui/motion";
import SimulateReply from "@/components/simulate-reply";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
  Building2,
  User,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Globe,
  DollarSign,
  Users,
  Code2,
  TrendingUp,
  Radar,
  Target,
  Brain,
  Zap,
  Lightbulb,
  Send,
  MessageSquare,
  Eye,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Volume2,
  Calendar,
  ArrowRight,
  RefreshCw,
  Loader2,
  FileText,
  Sparkles,
  Shield,
} from "lucide-react";

/* ─── Helpers ─── */
function parseAgentOutput(run?: AgentRun): Record<string, unknown> {
  if (!run?.output) return {};
  try {
    return typeof run.output === "string" ? JSON.parse(run.output) : (run.output as Record<string, unknown>);
  } catch {
    return {};
  }
}

function getAgentRun(runs: AgentRun[], num: number): AgentRun | undefined {
  return runs.find((r) => r.agentNumber === num);
}

function agentStatus(runs: AgentRun[], num: number, currentRunning: number | null): PhaseStatus {
  const run = getAgentRun(runs, num);
  if (run?.status === "complete") return "complete";
  if (run?.status === "error") return "error";
  if (currentRunning === num) return "running";
  return "idle";
}

function phaseStatus(agents: number[], runs: AgentRun[], currentRunning: number | null): PhaseStatus {
  const allComplete = agents.every((n) => getAgentRun(runs, n)?.status === "complete");
  if (allComplete) return "complete";
  const anyRunning = agents.some((n) => currentRunning === n);
  if (anyRunning) return "running";
  const anyError = agents.some((n) => getAgentRun(runs, n)?.status === "error");
  if (anyError) return "error";
  return "idle";
}

/* ─── Phase Definitions ─── */
const PHASES = [
  { id: 1, label: "Ingest",     agents: [1],       icon: "Users" },
  { id: 2, label: "Intel",      agents: [2, 3, 4], icon: "Radar" },
  { id: 3, label: "Strategy",   agents: [5],       icon: "Lightbulb" },
  { id: 4, label: "Content",    agents: [6],       icon: "FileText" },
  { id: 5, label: "Explain",    agents: [7],       icon: "Eye" },
  { id: 6, label: "Deliver",    agents: [8],       icon: "Send" },
  { id: 7, label: "Learn",      agents: [9, 10],   icon: "GraduationCap" },
] as const;

/* ─── Main Pipeline Page ─── */
export default function PipelinePage() {
  const { id } = useParams<{ id: string }>();
  const { events, connected, clear } = useSSE(id);
  const [detail, setDetail] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentAgent, setCurrentAgent] = useState<number | null>(null);
  const [activePhase, setActivePhase] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Track SSE events for current running agent
  useEffect(() => {
    const agentEvents = events.filter((e) => e.type === "agent_status");
    for (const e of agentEvents) {
      const d = e.data as { agentNumber?: number; status?: string };
      if (d.status === "running" && d.agentNumber) {
        setCurrentAgent(d.agentNumber);
        // Auto-advance to the phase containing this agent
        const targetPhase = PHASES.find((p) => p.agents.includes(d.agentNumber!));
        if (targetPhase) setActivePhase(targetPhase.id);
      }
    }
    const complete = events.some((e) => e.type === "pipeline_complete");
    if (complete) setCurrentAgent(null);
  }, [events]);

  // Poll for updates
  const pipelineComplete = events.some((e) => e.type === "pipeline_complete");
  useEffect(() => {
    if (pipelineComplete) {
      const t = setTimeout(fetchDetail, 500);
      return () => clearTimeout(t);
    }
    const hasActivity = events.filter((e) => e.type !== "connected").length > 0;
    if (hasActivity || detail) {
      const interval = setInterval(fetchDetail, 2000);
      return () => clearInterval(interval);
    }
  }, [events, pipelineComplete, detail, fetchDetail]);

  const runs = detail?.agentRuns || [];
  const lead = detail?.lead;
  const isRunning = !pipelineComplete && events.filter((e) => e.type !== "connected").length > 0;
  const completedCount = runs.filter((r) => r.status === "complete").length;

  // Parse all agent outputs
  const o1 = useMemo(() => parseAgentOutput(getAgentRun(runs, 1)), [runs]);
  const o2 = useMemo(() => parseAgentOutput(getAgentRun(runs, 2)), [runs]);
  const o3 = useMemo(() => parseAgentOutput(getAgentRun(runs, 3)), [runs]);
  const o4 = useMemo(() => parseAgentOutput(getAgentRun(runs, 4)), [runs]);
  const o5 = useMemo(() => parseAgentOutput(getAgentRun(runs, 5)), [runs]);
  const o6 = useMemo(() => parseAgentOutput(getAgentRun(runs, 6)), [runs]);
  const o7 = useMemo(() => parseAgentOutput(getAgentRun(runs, 7)), [runs]);
  const o8 = useMemo(() => parseAgentOutput(getAgentRun(runs, 8)), [runs]);
  const o9 = useMemo(() => parseAgentOutput(getAgentRun(runs, 9)), [runs]);
  const o10 = useMemo(() => parseAgentOutput(getAgentRun(runs, 10)), [runs]);

  // Navigation helpers
  const canGoNext = activePhase < 7;
  const canGoPrev = activePhase > 1;
  const goNext = useCallback(() => {
    if (canGoNext) {
      setActivePhase((p) => p + 1);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [canGoNext]);
  const goPrev = useCallback(() => {
    if (canGoPrev) {
      setActivePhase((p) => p - 1);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [canGoPrev]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); goPrev(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  // Phase status for each step
  const phaseStatuses = useMemo(
    () => PHASES.map((p) => phaseStatus(p.agents as unknown as number[], runs, currentAgent)),
    [runs, currentAgent]
  );

  // Show simulate reply on last phase when pipeline is complete
  const showSimulate = pipelineComplete && activePhase === 7;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Top Bar ── */}
      <div className="shrink-0 px-5 py-3 border-b-2 border-black flex items-center gap-3 bg-white">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
            <ArrowLeft className="size-3" /> Back
          </Button>
        </Link>
        <div className="h-6 w-0.5 bg-black ml-2 mr-2" />

        {lead ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <div className="flex items-center gap-2 border-2 border-black bg-white px-3 py-1 shadow-[2px_2px_0_0_#000]">
              <Building2 className="size-4 text-black" />
              <span className="text-sm font-black uppercase">{lead.companyName}</span>
            </div>
            {lead.contactName && (
              <span className="text-xs font-bold text-muted-foreground border border-black px-2 py-0.5">{lead.contactName}</span>
            )}
          </motion.div>
        ) : loading ? (
          <span className="flex items-center gap-1.5 text-sm font-bold uppercase">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </span>
        ) : null}

        {/* Pipeline Status */}
        <div className="ml-3">
          {pipelineComplete ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-black uppercase border-2 border-black bg-[#599D77] text-white shadow-[2px_2px_0_0_#000]">
              <CheckCircle2 className="size-3.5" /> Complete — {completedCount}/10 Agents
            </span>
          ) : isRunning ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-black uppercase border-2 border-black bg-secondary text-black shadow-[2px_2px_0_0_#000]">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 bg-primary" />
              </span>
              Running — {completedCount}/10
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-black uppercase border-2 border-black bg-white text-black shadow-[2px_2px_0_0_#000]">
              Idle
            </span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 border-2 border-black px-2.5 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0_0_#000] ${
              connected
                ? "bg-[#599D77] text-white"
                : "bg-destructive text-white"
            }`}
          >
            {connected ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
            {connected ? "Live" : "Offline"}
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all" onClick={() => { clear(); fetchDetail(); }}>
            <RefreshCw className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Phase Stepper Bar ── */}
      <div className="shrink-0 px-5 py-4 border-b-2 border-black bg-secondary">
        <div className="max-w-4xl mx-auto flex items-center gap-1">
          {PHASES.map((phase, idx) => {
            const st = phaseStatuses[idx];
            const isActive = activePhase === phase.id;
            return (
              <div key={phase.id} className="flex items-center flex-1 min-w-0">
                <button
                  onClick={() => { setActivePhase(phase.id); scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 w-full min-w-0 border-2 border-black ${
                    isActive
                      ? st === "running"
                        ? "bg-[#FFDA5C] shadow-[4px_4px_0_0_#000]"
                        : st === "complete"
                        ? "bg-[#599D77] text-white shadow-[2px_2px_0_0_#000]"
                        : "bg-primary text-white shadow-[2px_2px_0_0_#000]"
                      : "bg-white shadow-[2px_2px_0_0_#000] hover:shadow-[4px_4px_0_0_#000]"
                  }`}
                >
                  {/* Step indicator */}
                  <div
                    className={`size-6 rounded-md flex items-center justify-center shrink-0 border-2 border-black text-[10px] font-black transition-all ${
                      st === "complete"
                        ? "bg-white text-[#599D77]"
                        : st === "running"
                        ? "bg-white text-black"
                        : st === "error"
                        ? "bg-white text-destructive"
                        : isActive
                        ? "bg-white text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {st === "complete" ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : st === "running" ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      phase.id
                    )}
                  </div>
                  <span
                    className={`text-xs font-black uppercase tracking-wider truncate ${
                      isActive
                        ? st === "running" ? "text-black" : st === "complete" ? "text-white" : "text-white"
                        : "text-black"
                    }`}
                  >
                    {phase.label}
                  </span>
                </button>
                {/* Connector line */}
                {idx < PHASES.length - 1 && (
                  <div className={`w-4 h-0.5 shrink-0 mx-1 border-b-2 border-black`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Phase-Wise Content ── */}
      <div className="flex-1 overflow-auto" ref={scrollRef}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">

          {/* ═══════ PHASE 1: Lead Ingestion ═══════ */}
          {activePhase === 1 && (
          <motion.div key="phase-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
          <PhaseContainer
            phaseNumber={1}
            title="Lead Ingestion & Enrichment"
            subtitle="Agent 1 — Accepts lead input, enriches via Apollo API, validates & deduplicates"
            icon={<Users className="size-5" />}
            status={phaseStatus([1], runs, currentAgent)}
            accentColor="emerald"
            integrations={["Apollo API"]}
          >
            {phaseStatus([1], runs, currentAgent) === "running" && (
              <ThinkingIndicator label="Enriching lead data via Apollo…" />
            )}
            {phaseStatus([1], runs, currentAgent) === "complete" && (
              <div className="space-y-4">
                {/* Company Info */}
                <OutcomeCard title="Company Profile">
                  <div className="grid grid-cols-2 gap-x-6">
                    <OutcomeRow icon={<Building2 className="size-3" />} label="Company" value={o1.companyName as string || "—"} accent="text-foreground" />
                    <OutcomeRow icon={<Globe className="size-3" />} label="Domain" value={o1.companyDomain as string || "—"} mono />
                    <OutcomeRow icon={<Users className="size-3" />} label="Size" value={o1.companySize as string || "—"} />
                    <OutcomeRow icon={<Briefcase className="size-3" />} label="Industry" value={o1.industry as string || "—"} />
                    <OutcomeRow icon={<DollarSign className="size-3" />} label="Funding" value={`${o1.fundingStage || "—"} ${o1.fundingAmount ? `(${o1.fundingAmount})` : ""}`} accent="text-emerald-400" />
                    <OutcomeRow icon={<MapPin className="size-3" />} label="Headquarters" value={o1.headquarters as string || "—"} />
                  </div>
                </OutcomeCard>

                {/* Contact Info */}
                <OutcomeCard title="Contact Details">
                  <div className="grid grid-cols-2 gap-x-6">
                    <OutcomeRow icon={<User className="size-3" />} label="Name" value={o1.contactName as string || "—"} accent="text-foreground" />
                    <OutcomeRow icon={<Briefcase className="size-3" />} label="Title" value={o1.contactTitle as string || "—"} />
                    <OutcomeRow icon={<Mail className="size-3" />} label="Email" value={o1.contactEmail as string || "—"} mono accent="text-cyan-400" />
                    <OutcomeRow icon={<Phone className="size-3" />} label="Phone" value={o1.contactPhone as string || "—"} mono />
                    <OutcomeRow icon={<Linkedin className="size-3" />} label="LinkedIn" value={o1.contactLinkedIn as string || "—"} mono accent="text-blue-400" />
                    <OutcomeRow icon={<Shield className="size-3" />} label="Seniority" value={o1.seniority as string || "—"} accent="text-purple-400" />
                  </div>
                </OutcomeCard>

                {/* Tech Stack */}
                {o1.techStack && (
                  <OutcomeCard title="Tech Stack">
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(o1.techStack) ? o1.techStack : (() => { try { return JSON.parse(o1.techStack as string); } catch { return []; } })()).map((t: string) => (
                        <DataChip key={t} variant="cyan">
                          <Code2 className="size-2.5" /> {t}
                        </DataChip>
                      ))}
                    </div>
                  </OutcomeCard>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <MetricTile label="Source" value={o1.source as string || "targeted"} icon={<Target className="size-4" />} />
                  <MetricTile label="Seniority Level" value={o1.seniority as string || "—"} icon={<Shield className="size-4" />} />
                  <MetricTile label="Funding Stage" value={o1.fundingStage as string || "—"} icon={<DollarSign className="size-4" />} accentColor="emerald" />
                </div>
              </div>
            )}
          </PhaseContainer>
          </motion.div>
          )}

          {/* ═══════ PHASE 2: Intelligence Gathering (Agents 2, 3, 4 parallel) ═══════ */}
          {activePhase === 2 && (
          <motion.div key="phase-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
          <PhaseContainer
            phaseNumber={2}
            title="Intelligence Gathering"
            subtitle="Agents 2, 3, 4 — Signal scouting, intent scoring, and persona profiling run in parallel"
            icon={<Radar className="size-5" />}
            status={phaseStatus([2, 3, 4], runs, currentAgent)}
            accentColor="purple"
            integrations={["Tavily API", "LinkedIn"]}
          >
            {phaseStatus([2, 3, 4], runs, currentAgent) === "running" && (
              <ThinkingIndicator label="Scanning signals, scoring intent, profiling persona…" />
            )}
            <div className="grid grid-cols-3 gap-4">
              {/* Agent 2: Signal Scout */}
              <AgentTile
                name="Signal Scout"
                status={agentStatus(runs, 2, currentAgent) === "complete" ? "complete" : agentStatus(runs, 2, currentAgent) === "running" ? "running" : "idle"}
                icon={<Radar className="size-4" />}
              >
                {agentStatus(runs, 2, currentAgent) === "complete" && o2.signals && (
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono text-emerald-400">{(o2.signals as unknown[]).length} signals detected</span>
                    </div>
                    {(o2.signals as Array<Record<string, unknown>>).slice(0, 4).map((sig, i) => (
                      <StreamItem key={i} delay={i * 0.1}>
                        <div className="rounded-lg border border-border/15 bg-card/20 p-2.5 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <DataChip variant={sig.severity === "HIGH" || sig.relevance === "HIGH" ? "red" : sig.severity === "MEDIUM" || sig.relevance === "MEDIUM" ? "orange" : "default"}>
                              {(sig.severity || sig.relevance || "—") as string}
                            </DataChip>
                            <DataChip variant="purple">{(sig.type || sig.classification || "signal") as string}</DataChip>
                          </div>
                          <p className="text-[10px] text-foreground/80 leading-relaxed">{(sig.title || sig.headline || "") as string}</p>
                        </div>
                      </StreamItem>
                    ))}
                  </div>
                )}
              </AgentTile>

              {/* Agent 3: Intent Scorer */}
              <AgentTile
                name="Intent Scorer"
                status={agentStatus(runs, 3, currentAgent) === "complete" ? "complete" : agentStatus(runs, 3, currentAgent) === "running" ? "running" : "idle"}
                icon={<Target className="size-4" />}
              >
                {agentStatus(runs, 3, currentAgent) === "complete" && (
                  <div className="space-y-3 mt-1">
                    {/* Score Circle */}
                    <div className="flex items-center gap-3">
                      <div className="relative size-16">
                        <svg className="size-16 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
                          <motion.circle
                            cx="50" cy="50" r="40" fill="none" strokeWidth="6" strokeLinecap="round"
                            className={
                              (o3.tier || o3.priority) === "HOT" ? "stroke-red-400" :
                              (o3.tier || o3.priority) === "WARM" ? "stroke-orange-400" : "stroke-cyan-400"
                            }
                            initial={{ strokeDasharray: "0 251" }}
                            animate={{ strokeDasharray: `${((o3.compositeScore as number || o3.totalScore as number || 0) / 100) * 251} 251` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-lg font-bold font-mono">{(o3.compositeScore || o3.totalScore || 0) as number}</span>
                          <span className="text-[8px] text-muted-foreground">/100</span>
                        </div>
                      </div>
                      <div>
                        <DataChip variant={(o3.tier || o3.priority) === "HOT" ? "red" : (o3.tier || o3.priority) === "WARM" ? "orange" : "cyan"}>
                          {(o3.tier || o3.priority || "—") as string}
                        </DataChip>
                      </div>
                    </div>

                    {/* Top dimensions */}
                    {(o3.dimensions as Array<Record<string, unknown>> || o3.topFactors as Array<Record<string, unknown>> || []).slice(0, 4).map((dim: Record<string, unknown>, i: number) => (
                      <StreamItem key={i} delay={i * 0.08}>
                        <ScoreBar
                          label={(dim.name || dim.dimension || `Factor ${i + 1}`) as string}
                          value={(dim.rawScore || dim.score || 0) as number}
                          max={10}
                          color={(o3.tier || o3.priority) === "HOT" ? "red" : "orange"}
                        />
                      </StreamItem>
                    ))}
                  </div>
                )}
              </AgentTile>

              {/* Agent 4: Persona Analyst */}
              <AgentTile
                name="Persona Analyst"
                status={agentStatus(runs, 4, currentAgent) === "complete" ? "complete" : agentStatus(runs, 4, currentAgent) === "running" ? "running" : "idle"}
                icon={<Brain className="size-4" />}
              >
                {agentStatus(runs, 4, currentAgent) === "complete" && (
                  <div className="space-y-2.5 mt-1">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">Archetype</p>
                      <DataChip variant="purple">
                        {((o4.archetype || "") as string).replace(/_/g, " ")}
                      </DataChip>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">Confidence</p>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-muted/20 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-purple-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${((o4.confidence as number || o4.confidenceScore as number || 0.85) * 100)}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                        <span className="text-[10px] font-mono">{Math.round((o4.confidence as number || o4.confidenceScore as number || 0.85) * 100)}%</span>
                      </div>
                    </div>
                    {o4.messagingGuidelines && (
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1">Recommended Tone</p>
                        <p className="text-[11px] text-foreground/80">
                          {((o4.messagingGuidelines as Record<string, string>)?.tone || "—")}
                        </p>
                      </div>
                    )}
                    {o4.traits && (
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1">Key Traits</p>
                        <div className="flex flex-wrap gap-1">
                          {(o4.traits as string[]).slice(0, 3).map((t) => (
                            <DataChip key={t}>{t}</DataChip>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </AgentTile>
            </div>
          </PhaseContainer>
          </motion.div>
          )}

          {/* ═══════ PHASE 3: Strategy Brain ═══════ */}
          {activePhase === 3 && (
          <motion.div key="phase-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
          <PhaseContainer
            phaseNumber={3}
            title="Strategy Commander"
            subtitle="Agent 5 — The central decision brain. Decides channel, timing, tone, and full cadence"
            icon={<Lightbulb className="size-5" />}
            status={phaseStatus([5], runs, currentAgent)}
            accentColor="blue"
          >
            {phaseStatus([5], runs, currentAgent) === "running" && (
              <ThinkingIndicator label="Computing optimal outreach strategy…" />
            )}
            {phaseStatus([5], runs, currentAgent) === "complete" && (
              <div className="space-y-4">
                {/* Decision Cards Grid */}
                <div className="grid grid-cols-4 gap-3">
                  <MetricTile
                    label="Primary Channel"
                    value={((o5.primaryChannel || "—") as string).replace(/_/g, " ")}
                    icon={<Send className="size-4" />}
                    accentColor="cyan"
                  />
                  <MetricTile
                    label="Tone Framework"
                    value={((o5.approach || o5.toneFramework || "—") as string).replace(/_/g, " ")}
                    icon={<Volume2 className="size-4" />}
                    accentColor="purple"
                  />
                  <MetricTile
                    label="Send Timing"
                    value={o5.sendTimestamp ? new Date(o5.sendTimestamp as string).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Optimal"}
                    sub={o5.timezone as string || ""}
                    icon={<Clock className="size-4" />}
                    accentColor="orange"
                  />
                  <MetricTile
                    label="Cadence"
                    value={`${(o5.cadence as unknown[])?.length || 3} touches`}
                    sub={o5.secondaryChannel ? `+ ${(o5.secondaryChannel as string).replace(/_/g, " ")}` : ""}
                    icon={<Calendar className="size-4" />}
                    accentColor="emerald"
                  />
                </div>

                {/* Cadence Timeline */}
                {o5.cadence && (
                  <OutcomeCard title="Cadence Schedule">
                    <div className="flex items-center gap-2">
                      {(o5.cadence as Array<Record<string, unknown>>).map((tp, i, arr) => (
                        <div key={i} className="flex items-center gap-2 flex-1">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.15 }}
                            className="flex-1 rounded-lg border border-border/20 bg-card/20 p-3 text-center"
                          >
                            <p className="text-[10px] text-muted-foreground">Touch {(tp.touchNumber || i + 1) as number}</p>
                            <p className="text-[12px] font-semibold mt-1">
                              {((tp.channel || "") as string).replace(/_/g, " ")}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Day +{(tp.dayOffset || 0) as number}
                            </p>
                          </motion.div>
                          {i < arr.length - 1 && (
                            <ArrowRight className="size-3.5 text-muted-foreground/30 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </OutcomeCard>
                )}

                {/* Key Decisions */}
                {o5.decisions && (
                  <OutcomeCard title="Key Decisions">
                    {(o5.decisions as Array<Record<string, string>>).map((d, i) => (
                      <StreamItem key={i} delay={i * 0.1}>
                        <div className="py-2 border-b border-border/10 last:border-0">
                          <p className="text-[11px] font-medium text-foreground">{d.decision}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{d.reasoning}</p>
                        </div>
                      </StreamItem>
                    ))}
                  </OutcomeCard>
                )}
              </div>
            )}
          </PhaseContainer>
          </motion.div>
          )}

          {/* ═══════ PHASE 4: Content Generation ═══════ */}
          {activePhase === 4 && (
          <motion.div key="phase-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
          <PhaseContainer
            phaseNumber={4}
            title="Content Generation"
            subtitle="Agent 6 — AI-crafted multi-touch outreach messages, LinkedIn posts, and headline suggestions"
            icon={<FileText className="size-5" />}
            status={phaseStatus([6], runs, currentAgent)}
            accentColor="teal"
            integrations={["Groq LLM", "Llama 3.3 70B"]}
          >
            {phaseStatus([6], runs, currentAgent) === "running" && (
              <ThinkingIndicator label="Generating personalized outreach content…" />
            )}
            {phaseStatus([6], runs, currentAgent) === "complete" && o6.touches && (
              <div className="space-y-4">
                {/* Touch Cards */}
                {(o6.touches as Array<Record<string, unknown>>).map((touch, i) => (
                  <StreamItem key={i} delay={i * 0.2}>
                    <OutcomeCard
                      title={`Touch ${touch.touchNumber} — ${((touch.channel || "") as string).replace(/_/g, " ")}`}
                    >
                      {touch.subject && (
                        <div className="mb-2 pb-2 border-b border-border/10">
                          <span className="text-[10px] text-muted-foreground">Subject: </span>
                          <span className="text-[11px] font-medium">{touch.subject as string}</span>
                        </div>
                      )}
                      <div className="text-[11px] leading-relaxed font-mono text-foreground/80 whitespace-pre-wrap bg-background/30 rounded-lg p-3 border border-border/10">
                        <StreamingText text={touch.body as string || ""} speed={5} showCursor={false} />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <DataChip variant={touch.channel === "linkedin_dm" ? "cyan" : touch.channel === "email" ? "purple" : "emerald"}>
                          {((touch.channel || "") as string).replace(/_/g, " ")}
                        </DataChip>
                        <span className="text-[9px] text-muted-foreground">
                          {(touch.body as string || "").length} chars
                        </span>
                      </div>
                    </OutcomeCard>
                  </StreamItem>
                ))}

                {/* LinkedIn Post */}
                {o6.linkedinPost && (
                  <OutcomeCard title="LinkedIn Thought Leadership Post">
                    <div className="text-[11px] leading-relaxed whitespace-pre-wrap bg-background/30 rounded-lg p-3 border border-border/10">
                      <StreamingText text={o6.linkedinPost as string} speed={5} showCursor={false} />
                    </div>
                  </OutcomeCard>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <MetricTile label="Touches Generated" value={(o6.touches as unknown[]).length} icon={<MessageSquare className="size-4" />} />
                  <MetricTile label="Channels Used" value={[...new Set((o6.touches as Array<Record<string, string>>).map((t) => t.channel))].length} icon={<Send className="size-4" />} />
                  <MetricTile label="Total Content" value={`${(o6.touches as Array<Record<string, string>>).reduce((a, t) => a + (t.body?.length || 0), 0)} chars`} icon={<FileText className="size-4" />} />
                </div>
              </div>
            )}
          </PhaseContainer>
          </motion.div>
          )}

          {/* ═══════ PHASE 5: Decision Trace ═══════ */}
          {activePhase === 5 && (
          <motion.div key="phase-5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
          <PhaseContainer
            phaseNumber={5}
            title="Decision Trace & Explainability"
            subtitle="Agent 7 — Reads the full trace of every decision, generates plain-English rationale"
            icon={<Eye className="size-5" />}
            status={phaseStatus([7], runs, currentAgent)}
            accentColor="yellow"
          >
            {phaseStatus([7], runs, currentAgent) === "running" && (
              <ThinkingIndicator label="Tracing all agent decisions for explainability…" />
            )}
            {phaseStatus([7], runs, currentAgent) === "complete" && (
              <div className="space-y-4">
                {/* Summary */}
                {o7.summary && (
                  <OutcomeCard title="Executive Summary">
                    <div className="text-[12px] leading-relaxed text-foreground/80">
                      <StreamingText text={o7.summary as string} speed={8} showCursor={false} />
                    </div>
                  </OutcomeCard>
                )}

                {/* Rationale Items */}
                {(o7.rationale || o7.explanations) && (
                  <OutcomeCard title="Agent Decision Rationale">
                    <div className="space-y-2.5">
                      {((o7.rationale || o7.explanations) as Array<Record<string, unknown>>).map((item, i) => (
                        <StreamItem key={i} delay={i * 0.1}>
                          <div className="rounded-lg border border-border/15 bg-card/20 p-3 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <DataChip variant="purple">{(item.agent || item.agentName || `Agent ${i + 1}`) as string}</DataChip>
                              {item.confidence && (
                                <span className="text-[9px] font-mono text-emerald-400">
                                  {Math.round((item.confidence as number) * 100)}% confident
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-medium text-foreground">{(item.decision || "") as string}</p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">{(item.explanation || item.reasoning || "") as string}</p>
                          </div>
                        </StreamItem>
                      ))}
                    </div>
                  </OutcomeCard>
                )}
              </div>
            )}
          </PhaseContainer>
          </motion.div>
          )}

          {/* ═══════ PHASE 6: Delivery & Execution ═══════ */}
          {activePhase === 6 && (
          <motion.div key="phase-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
          <PhaseContainer
            phaseNumber={6}
            title="Delivery & Execution"
            subtitle="Agent 8 — Sends messages via selected platforms. Tracks delivery receipts"
            icon={<Send className="size-5" />}
            status={phaseStatus([8], runs, currentAgent)}
            accentColor="emerald"
            integrations={["HeyReach", "Resend", "AiSensy"]}
          >
            {phaseStatus([8], runs, currentAgent) === "running" && (
              <ThinkingIndicator label="Dispatching outreach messages…" />
            )}
            {phaseStatus([8], runs, currentAgent) === "complete" && o8.results && (
              <div className="space-y-4">
                {/* Delivery Results */}
                <div className="space-y-2.5">
                  {(o8.results as Array<Record<string, unknown>>).map((result, i) => (
                    <StreamItem key={i} delay={i * 0.15}>
                      <div className="flex items-center gap-3 border-2 border-black bg-white p-4 shadow-[2px_2px_0_0_#000] mb-2">
                        {/* Status Icon */}
                        <div className={`size-10 border-2 border-black flex items-center justify-center shadow-[2px_2px_0_0_#000] ${
                          result.status === "sent" || result.status === "simulated"
                            ? "bg-[#599D77]"
                            : result.status === "queued"
                            ? "bg-[#FFDA5C]"
                            : "bg-[#EA435F]"
                        }`}>
                          {result.status === "sent" || result.status === "simulated" ? (
                            <CheckCircle2 className="size-5 text-white" />
                          ) : result.status === "queued" ? (
                            <Clock className="size-5 text-black" />
                          ) : (
                            <AlertTriangle className="size-5 text-white" />
                          )}
                        </div>
                        {/* Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black uppercase">Touch {result.touch as number || result.touchNumber as number || i + 1}</span>
                            <DataChip variant={result.channel === "linkedin_dm" ? "cyan" : result.channel === "email" ? "purple" : "emerald"}>
                              {((result.channel || "") as string).replace(/_/g, " ")}
                            </DataChip>
                            <DataChip variant={
                              result.status === "sent" || result.status === "simulated" ? "emerald" :
                              result.status === "queued" ? "orange" : "red"
                            }>
                              {result.status as string}
                            </DataChip>
                          </div>
                          {result.messageId && (
                            <p className="text-[9px] font-black font-mono text-black mt-1 border border-black inline-block px-1 bg-muted">
                              ID: {result.messageId as string}
                            </p>
                          )}
                        </div>
                        {/* Platform badge */}
                        <span className="text-[9px] font-black uppercase border-2 border-black px-2 py-0.5 bg-secondary shadow-[1px_1px_0_0_#000]">
                          {result.channel === "linkedin_dm" ? "HeyReach" : result.channel === "email" ? "Resend" : "AiSensy"}
                        </span>
                      </div>
                    </StreamItem>
                  ))}
                </div>

                {/* Delivery Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <MetricTile
                    label="Sent"
                    value={(o8.results as Array<Record<string, string>>).filter((r) => r.status === "sent" || r.status === "simulated").length}
                    icon={<CheckCircle2 className="size-4" />}
                    accentColor="emerald"
                  />
                  <MetricTile
                    label="Queued"
                    value={(o8.results as Array<Record<string, string>>).filter((r) => r.status === "queued").length}
                    icon={<Clock className="size-4" />}
                    accentColor="orange"
                  />
                  <MetricTile
                    label="Failed"
                    value={(o8.results as Array<Record<string, string>>).filter((r) => r.status === "failed").length}
                    icon={<AlertTriangle className="size-4" />}
                    accentColor="red"
                  />
                </div>
              </div>
            )}
          </PhaseContainer>
          </motion.div>
          )}

          {/* ═══════ PHASE 7: Monitor & Learn ═══════ */}
          {activePhase === 7 && (
          <motion.div key="phase-7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
          <PhaseContainer
            phaseNumber={7}
            title="Response Monitor & Learning Loop"
            subtitle="Agents 9 & 10 — Classifies response sentiment, then updates scoring weights for compounding improvement"
            icon={<GraduationCap className="size-5" />}
            status={phaseStatus([9, 10], runs, currentAgent)}
            accentColor="orange"
            isLast
          >
            {phaseStatus([9, 10], runs, currentAgent) === "running" && (
              <ThinkingIndicator label="Monitoring for responses & updating model weights…" />
            )}
            {(agentStatus(runs, 9, currentAgent) === "complete" || agentStatus(runs, 10, currentAgent) === "complete") && (
              <div className="space-y-4">
                {/* Agent 9: Response Classification */}
                {agentStatus(runs, 9, currentAgent) === "complete" && (
                  <OutcomeCard title="Response Classification — Agent 9">
                    <div className="flex items-center gap-3 mb-3">
                      <DataChip variant={
                        o9.sentiment === "positive" ? "emerald" :
                        o9.sentiment === "negative" ? "red" :
                        o9.sentiment === "neutral" ? "orange" : "default"
                      }>
                        {((o9.sentiment || "no_reply") as string).replace(/_/g, " ")}
                      </DataChip>
                      <ArrowRight className="size-3 text-muted-foreground/40" />
                      <DataChip variant="purple">
                        {((o9.action || "nurture") as string).replace(/_/g, " ")}
                      </DataChip>
                    </div>
                    {o9.classificationReasoning && (
                      <p className="text-[10px] text-muted-foreground leading-relaxed font-mono">
                        {o9.classificationReasoning as string}
                      </p>
                    )}
                  </OutcomeCard>
                )}

                {/* Agent 10: Learning Loop */}
                {agentStatus(runs, 10, currentAgent) === "complete" && o10.weightUpdates && (
                  <OutcomeCard title="Learning Loop — Agent 10">
                    <div className="space-y-3">
                      {/* Weight Updates */}
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-semibold">
                          Scoring Weight Updates ({(o10.weightUpdates as unknown[]).length} dimensions)
                        </p>
                        <div className="space-y-1.5">
                          {(o10.weightUpdates as Array<Record<string, unknown>>).map((wu, i) => (
                            <StreamItem key={i} delay={i * 0.05}>
                              <div className="flex items-center gap-2 py-1.5 border-b border-border/10 last:border-0">
                                <span className="text-[10px] text-muted-foreground min-w-24">{wu.dimension as string}</span>
                                <span className="text-[10px] font-mono text-foreground/60">{(wu.previousWeight as number)?.toFixed(2)}</span>
                                <ArrowRight className="size-2.5 text-muted-foreground/40" />
                                <span className={`text-[10px] font-mono font-semibold ${
                                  (wu.delta as number) > 0 ? "text-emerald-400" : (wu.delta as number) < 0 ? "text-red-400" : "text-muted-foreground"
                                }`}>
                                  {(wu.newWeight as number)?.toFixed(2)}
                                </span>
                                <span className={`text-[9px] font-mono ${
                                  (wu.delta as number) > 0 ? "text-emerald-400" : (wu.delta as number) < 0 ? "text-red-400" : "text-muted-foreground"
                                }`}>
                                  ({(wu.delta as number) > 0 ? "+" : ""}{(wu.delta as number)?.toFixed(3)})
                                </span>
                              </div>
                            </StreamItem>
                          ))}
                        </div>
                      </div>

                      {/* Heuristic Updates */}
                      {o10.heuristicUpdates && (o10.heuristicUpdates as string[]).length > 0 && (
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider font-semibold">
                            Strategy Heuristic Updates
                          </p>
                          {(o10.heuristicUpdates as string[]).map((h, i) => (
                            <StreamItem key={i} delay={i * 0.1}>
                              <p className="text-[10px] text-foreground/80 py-1 flex items-start gap-1.5">
                                <Sparkles className="size-2.5 text-purple-400 mt-0.5 shrink-0" /> {h}
                              </p>
                            </StreamItem>
                          ))}
                        </div>
                      )}

                      {/* Tone Rule Updates */}
                      {o10.toneRuleUpdates && (o10.toneRuleUpdates as string[]).length > 0 && (
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider font-semibold">
                            Tone Rule Adjustments
                          </p>
                          {(o10.toneRuleUpdates as string[]).map((t, i) => (
                            <StreamItem key={i} delay={i * 0.1}>
                              <p className="text-[10px] text-foreground/80 py-1 flex items-start gap-1.5">
                                <Volume2 className="size-2.5 text-orange-400 mt-0.5 shrink-0" /> {t}
                              </p>
                            </StreamItem>
                          ))}
                        </div>
                      )}
                    </div>
                  </OutcomeCard>
                )}

                {/* Summary Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <MetricTile
                    label="Sentiment"
                    value={((o9.sentiment || "no_reply") as string).replace(/_/g, " ")}
                    icon={<MessageSquare className="size-4" />}
                    accentColor={o9.sentiment === "positive" ? "emerald" : o9.sentiment === "negative" ? "red" : "orange"}
                  />
                  <MetricTile
                    label="Action"
                    value={((o9.action || "nurture") as string).replace(/_/g, " ")}
                    icon={<Zap className="size-4" />}
                    accentColor="purple"
                  />
                  <MetricTile
                    label="Weights Updated"
                    value={(o10.weightUpdates as unknown[] || []).length}
                    icon={<TrendingUp className="size-4" />}
                    accentColor="cyan"
                  />
                </div>
              </div>
            )}
          </PhaseContainer>

          {/* ═══════ SIMULATE REPLY SECTION (on Phase 7) ═══════ */}
          {showSimulate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#000]"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="size-12 border-2 border-black bg-secondary flex items-center justify-center shadow-[2px_2px_0_0_#000]">
                  <MessageSquare className="size-6 text-black" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase">Simulate a Response</h3>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Test how Agent 9 classifies sentiment and Agent 10 updates the learning weights
                  </p>
                </div>
              </div>
              <SimulateReply
                leadId={id || ""}
                channel={
                  (o5.primaryChannel as "email" | "linkedin_dm" | "whatsapp") || "email"
                }
                disabled={false}
                onSent={() => {
                  setTimeout(fetchDetail, 1500);
                }}
              />
            </motion.div>
          )}

          {/* ═══════ VIEW CALENDAR CTA (on Phase 7 after pipeline complete) ═══════ */}
          {showSimulate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-5"
            >
              <Link to="/dashboard/calendar">
                <div className="border-2 border-black bg-[#FFDA5C] p-5 shadow-[4px_4px_0_0_#000] flex items-center gap-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all cursor-pointer group">
                  <div className="size-12 border-2 border-black bg-white flex items-center justify-center shadow-[2px_2px_0_0_#000]">
                    <Calendar className="size-6 text-black" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-black uppercase">View Outreach Calendar</h3>
                    <p className="text-xs font-semibold text-black/70">
                      See all scheduled touchpoints on a month view · Chat with AI about your schedule
                    </p>
                  </div>
                  <ArrowRight className="size-5 text-black group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          )}
          </motion.div>
          )}

          </AnimatePresence>

          {/* ── Navigation Buttons ── */}
          <div className="flex items-center justify-between mt-8 pb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={goPrev}
              disabled={!canGoPrev}
              className="gap-2 h-10 px-5 border-border/40 hover:bg-muted/20 disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
              <span className="text-sm">Previous Phase</span>
            </Button>

            {/* Phase counter */}
            <span className="text-xs text-muted-foreground font-mono">
              Phase {activePhase} of 7
            </span>

            {activePhase < 7 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={goNext}
                className="gap-2 h-10 px-5 border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary"
              >
                <span className="text-sm">Next Phase</span>
                <ChevronRight className="size-4" />
              </Button>
            ) : pipelineComplete ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard/calendar">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-10 px-5 border-2 border-black bg-[#FFDA5C] text-black shadow-[2px_2px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none font-black uppercase text-xs"
                  >
                    <Calendar className="size-4" />
                    <span>Calendar</span>
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-10 px-5 border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400"
                  >
                    <CheckCircle2 className="size-4" />
                    <span className="text-sm">Done</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="gap-2 h-10 px-5 border-border/40 disabled:opacity-30"
              >
                <span className="text-sm">Waiting…</span>
                <Loader2 className="size-4 animate-spin" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
