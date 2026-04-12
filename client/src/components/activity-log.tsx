import { useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Truck,
  MessageSquare,
  Brain,
  Zap,
  GitBranch,
  Loader2,
  Terminal,
} from "lucide-react";
import type { SSEEvent } from "@/lib/types";

interface Props {
  events: SSEEvent[];
}

const EVENT_META: Record<
  string,
  { icon: React.ReactNode; color: string; label: string; accent: string }
> = {
  agent_status: {
    icon: <PlayCircle className="size-3.5" />,
    color: "text-purple-400",
    label: "AGENT",
    accent: "border-l-purple-500",
  },
  score_update: {
    icon: <Zap className="size-3.5" />,
    color: "text-orange-400",
    label: "SCORE",
    accent: "border-l-orange-500",
  },
  strategy_update: {
    icon: <Brain className="size-3.5" />,
    color: "text-blue-400",
    label: "STRATEGY",
    accent: "border-l-blue-500",
  },
  content_update: {
    icon: <MessageSquare className="size-3.5" />,
    color: "text-teal-400",
    label: "CONTENT",
    accent: "border-l-teal-500",
  },
  rationale_update: {
    icon: <Brain className="size-3.5" />,
    color: "text-indigo-400",
    label: "RATIONALE",
    accent: "border-l-indigo-500",
  },
  delivery_update: {
    icon: <Truck className="size-3.5" />,
    color: "text-emerald-400",
    label: "DELIVERY",
    accent: "border-l-emerald-500",
  },
  response_update: {
    icon: <MessageSquare className="size-3.5" />,
    color: "text-yellow-400",
    label: "RESPONSE",
    accent: "border-l-yellow-500",
  },
  learning_update: {
    icon: <Zap className="size-3.5" />,
    color: "text-pink-400",
    label: "LEARNING",
    accent: "border-l-pink-500",
  },
  branch_decision: {
    icon: <GitBranch className="size-3.5" />,
    color: "text-cyan-400",
    label: "BRANCH",
    accent: "border-l-cyan-500",
  },
  pipeline_complete: {
    icon: <CheckCircle2 className="size-3.5" />,
    color: "text-emerald-400",
    label: "COMPLETE",
    accent: "border-l-emerald-500",
  },
  error: {
    icon: <AlertCircle className="size-3.5" />,
    color: "text-red-400",
    label: "ERROR",
    accent: "border-l-red-500",
  },
};

function formatTime(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "";
  }
}

function summarizeEvent(ev: SSEEvent): string {
  const d = ev.data as Record<string, unknown>;
  switch (ev.type) {
    case "agent_status": {
      const status = d.status as string;
      const num = d.agentNumber as number;
      const name = d.agentName as string;
      if (status === "running") return `Agent ${num} (${name}) initializing…`;
      if (status === "complete") return `Agent ${num} (${name}) ✓ completed`;
      if (status === "error") return `Agent ${num} failed: ${d.error || "unknown"}`;
      return `Agent ${num} → ${status}`;
    }
    case "score_update":
      return `Composite: ${d.compositeScore}/100 — Tier: ${d.tier}`;
    case "strategy_update":
      return `Channel: ${d.primaryChannel} | Tone: ${(d.toneFramework as string)?.replace(/_/g, " ")}`;
    case "content_update":
      return `${(d.touches as unknown[])?.length || 0} touch messages generated`;
    case "rationale_update":
      return `${(d.explanations as unknown[])?.length || 0} decision rationales`;
    case "delivery_update":
      return `${(d.results as unknown[])?.length || 0} deliveries processed`;
    case "response_update":
      return `Sentiment: ${d.sentiment} → ${d.action}`;
    case "learning_update":
      return `${(d.weightUpdates as unknown[])?.length || 0} weight updates applied`;
    case "branch_decision":
      return `Decision: ${d.decision} — ${d.reason || ""}`;
    case "pipeline_complete":
      return `Pipeline finished${d.totalDurationMs ? ` in ${((d.totalDurationMs as number) / 1000).toFixed(1)}s` : ""}`;
    case "error":
      return `${d.message || d.error || "Unknown error"}`;
    default:
      return ev.type;
  }
}

export default function ActivityLog({ events }: Props) {
  const filtered = useMemo(
    () => events.filter((e) => e.type !== "connected"),
    [events]
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filtered.length]);

  if (!filtered.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8 gap-3">
        <div className="relative">
          <Terminal className="size-6 opacity-30" />
          <Loader2 className="size-3 animate-spin absolute -top-1 -right-1 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-xs font-medium">Awaiting agent events…</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">Real-time feed will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" ref={scrollRef}>
      <div className="p-2 space-y-0.5">
        <AnimatePresence>
          {filtered.map((ev, i) => {
            const meta = EVENT_META[ev.type] || {
              icon: <Zap className="size-3.5" />,
              color: "text-muted-foreground",
              label: ev.type.toUpperCase(),
              accent: "border-l-muted",
            };

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`flex items-start gap-2.5 px-2.5 py-2 rounded-md border-l-2 bg-card/30 hover:bg-card/50 transition-colors ${meta.accent}`}
              >
                <div className={`mt-0.5 shrink-0 ${meta.color}`}>{meta.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-mono font-bold tracking-wider ${meta.color}`}>
                      {meta.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50 font-mono">
                      {formatTime(ev.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-foreground/80 mt-0.5 leading-snug font-mono">
                    {summarizeEvent(ev)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
