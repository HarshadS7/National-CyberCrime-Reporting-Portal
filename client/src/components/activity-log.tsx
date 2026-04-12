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

// 4-color palette: black, red (#EA435F), yellow (#FFDA5C), cream (#F9F5F2)
const EVENT_META: Record<
  string,
  { icon: React.ReactNode; bgTag: string; label: string; borderColor: string }
> = {
  agent_status: {
    icon: <PlayCircle className="size-3.5" />,
    bgTag: "bg-secondary text-black",
    label: "AGENT",
    borderColor: "border-l-black",
  },
  score_update: {
    icon: <Zap className="size-3.5" />,
    bgTag: "bg-primary text-white",
    label: "SCORE",
    borderColor: "border-l-primary",
  },
  strategy_update: {
    icon: <Brain className="size-3.5" />,
    bgTag: "bg-black text-white",
    label: "STRATEGY",
    borderColor: "border-l-black",
  },
  content_update: {
    icon: <MessageSquare className="size-3.5" />,
    bgTag: "bg-secondary text-black",
    label: "CONTENT",
    borderColor: "border-l-secondary",
  },
  rationale_update: {
    icon: <Brain className="size-3.5" />,
    bgTag: "bg-muted text-black",
    label: "RATIONALE",
    borderColor: "border-l-black",
  },
  delivery_update: {
    icon: <Truck className="size-3.5" />,
    bgTag: "bg-black text-white",
    label: "DELIVERY",
    borderColor: "border-l-black",
  },
  response_update: {
    icon: <MessageSquare className="size-3.5" />,
    bgTag: "bg-secondary text-black",
    label: "RESPONSE",
    borderColor: "border-l-secondary",
  },
  learning_update: {
    icon: <Zap className="size-3.5" />,
    bgTag: "bg-primary text-white",
    label: "LEARNING",
    borderColor: "border-l-primary",
  },
  branch_decision: {
    icon: <GitBranch className="size-3.5" />,
    bgTag: "bg-muted text-black",
    label: "BRANCH",
    borderColor: "border-l-black",
  },
  pipeline_complete: {
    icon: <CheckCircle2 className="size-3.5" />,
    bgTag: "bg-black text-white",
    label: "COMPLETE",
    borderColor: "border-l-black",
  },
  error: {
    icon: <AlertCircle className="size-3.5" />,
    bgTag: "bg-primary text-white",
    label: "ERROR",
    borderColor: "border-l-primary",
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
      <div className="flex flex-col items-center justify-center h-full py-8 gap-3">
        <div className="size-12 border-2 border-black bg-secondary flex items-center justify-center shadow-[2px_2px_0_0_#000]">
          <Terminal className="size-5 text-black" />
        </div>
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-wider">Awaiting agent events…</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Real-time feed will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" ref={scrollRef}>
      <div className="p-2 space-y-1">
        <AnimatePresence>
          {filtered.map((ev, i) => {
            const meta = EVENT_META[ev.type] || {
              icon: <Zap className="size-3.5" />,
              bgTag: "bg-muted text-black",
              label: ev.type.toUpperCase(),
              borderColor: "border-l-black",
            };

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`flex items-start gap-2.5 px-3 py-2.5 border-2 border-black border-l-4 ${meta.borderColor} bg-white hover:bg-muted/30 transition-colors shadow-[1px_1px_0_0_#000]`}
              >
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-black uppercase border border-black shrink-0 ${meta.bgTag}`}>
                  {meta.icon}
                  {meta.label}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold text-black leading-snug">
                      {summarizeEvent(ev)}
                    </p>
                    <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                      {formatTime(ev.timestamp)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
