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

// 4-color palette: cream bg (#F9F5F2), black, red (#EA435F), yellow (#FFDA5C)
const STATUS_STYLES: Record<AgentStatus, string> = {
  idle: "border-black/30 bg-white text-black",
  running: "border-black bg-[#FFDA5C] text-black shadow-[3px_3px_0_0_#000]",
  complete: "border-black bg-[#F9F5F2] text-black shadow-[2px_2px_0_0_#000]",
  error: "border-black bg-[#EA435F] text-white shadow-[2px_2px_0_0_#000]",
};

const STATUS_ICON: Record<AgentStatus, React.ReactNode> = {
  idle: <Circle className="size-3 text-black/30" />,
  running: <Loader2 className="size-3.5 animate-spin text-black" />,
  complete: <Check className="size-3.5 text-black" strokeWidth={3} />,
  error: <AlertCircle className="size-3.5 text-white" />,
};

function AgentNodeComponent({ data }: NodeProps & { data: AgentNodePayload }) {
  const d = data as AgentNodePayload;
  const isRunning = d.status === "running";
  const isComplete = d.status === "complete";

  return (
    <motion.div
      initial={false}
      animate={isRunning ? { y: [0, -2, 0] } : { y: 0 }}
      transition={isRunning ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" } : {}}
      className="relative"
    >
      <div
        className={`border-2 px-3.5 py-2.5 min-w-36 transition-all duration-300 font-sans ${STATUS_STYLES[d.status]}`}
      >
        <Handle type="target" position={Position.Left} className="bg-black! size-2! border-0!" />

        {/* Header row */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm">{AGENT_ICONS[d.agentNumber] || "🤖"}</span>
          <span className="text-[9px] font-black font-mono opacity-60">#{d.agentNumber}</span>
          <div className="ml-auto">{STATUS_ICON[d.status]}</div>
        </div>

        {/* Agent name */}
        <p className="text-[11px] font-black uppercase leading-tight tracking-wide">{d.shortLabel}</p>

        {/* Output summary */}
        {d.outputSummary && isComplete && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-[9px] mt-1.5 opacity-60 leading-snug line-clamp-2 max-w-36 font-mono"
          >
            {d.outputSummary}
          </motion.p>
        )}

        {/* Running progress bar */}
        {isRunning && (
          <div className="mt-2 h-1 border border-black overflow-hidden bg-white">
            <motion.div
              className="h-full bg-black"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              style={{ width: "40%" }}
            />
          </div>
        )}

        <Handle type="source" position={Position.Right} className="bg-black! size-2! border-0!" />
      </div>
    </motion.div>
  );
}

export const AgentNode = memo(AgentNodeComponent);
