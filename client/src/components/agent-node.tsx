import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import type { AgentStatus } from "@/lib/types";
import { Loader2, Check, AlertCircle, Circle } from "lucide-react";

export interface AgentNodePayload {
  agentNumber: number;
  label: string;
  shortLabel: string;
  status: AgentStatus;
  outputSummary?: string;
}

const AGENT_ICONS: Record<number, string> = {
  1: "📥", 2: "🔍", 3: "⚡", 4: "🧬", 5: "🎯",
  6: "✍️", 7: "💡", 8: "📤", 9: "👁️", 10: "🧠",
};

const STATUS_STYLES: Record<AgentStatus, string> = {
  idle: "border-border/60 bg-card/60 text-muted-foreground",
  running: "border-purple-500/60 bg-purple-500/10 text-purple-200 shadow-[0_0_24px_rgba(168,85,247,0.2)]",
  complete: "border-emerald-500/50 bg-emerald-500/8 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.12)]",
  error: "border-red-500/50 bg-red-500/10 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.15)]",
};

const STATUS_ICON: Record<AgentStatus, React.ReactNode> = {
  idle: <Circle className="size-3 text-muted-foreground/40" />,
  running: <Loader2 className="size-3.5 animate-spin text-purple-400" />,
  complete: <Check className="size-3.5 text-emerald-400" />,
  error: <AlertCircle className="size-3.5 text-red-400" />,
};

function AgentNodeComponent({ data }: NodeProps & { data: AgentNodePayload }) {
  const d = data as AgentNodePayload;
  const isRunning = d.status === "running";
  const isComplete = d.status === "complete";

  return (
    <motion.div
      initial={false}
      animate={isRunning ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={isRunning ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : {}}
      className="relative"
    >
      {/* Outer glow ring for running state */}
      {isRunning && (
        <div className="absolute inset-0 -m-1 rounded-xl border-2 border-purple-500/30 animate-pulse" />
      )}

      <div
        className={`rounded-xl border backdrop-blur-sm px-3.5 py-2.5 min-w-36 transition-all duration-500 ${STATUS_STYLES[d.status]}`}
      >
        <Handle type="target" position={Position.Left} className="bg-border! size-1.5!" />

        {/* Header row */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm">{AGENT_ICONS[d.agentNumber] || "🤖"}</span>
          <span className="text-[10px] font-mono opacity-50">#{d.agentNumber}</span>
          <div className="ml-auto">{STATUS_ICON[d.status]}</div>
        </div>

        {/* Agent name */}
        <p className="text-[11px] font-semibold leading-tight">{d.shortLabel}</p>

        {/* Output summary with streaming feel */}
        {d.outputSummary && isComplete && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-[9px] mt-1.5 opacity-50 leading-snug line-clamp-2 max-w-36 font-mono"
          >
            {d.outputSummary}
          </motion.p>
        )}

        {/* Running indicator bar */}
        {isRunning && (
          <div className="mt-2 h-0.5 rounded-full overflow-hidden bg-purple-500/20">
            <motion.div
              className="h-full bg-purple-400/60 rounded-full"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              style={{ width: "40%" }}
            />
          </div>
        )}

        <Handle type="source" position={Position.Right} className="bg-border! size-1.5!" />
      </div>
    </motion.div>
  );
}

export const AgentNode = memo(AgentNodeComponent);
