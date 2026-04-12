import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import {
  CheckCircle2,
  Loader2,
} from "lucide-react";

export type PhaseStatus = "idle" | "running" | "complete" | "error";

interface PhaseContainerProps {
  phaseNumber: number;
  title: string;
  subtitle: string;
  icon: ReactNode;
  status: PhaseStatus;
  accentColor: string; // e.g. "emerald", "purple", "cyan"
  children: ReactNode;
  isLast?: boolean;
  integrations?: string[];
}

const statusConfig = {
  idle: {
    border: "border-2 border-black",
    bg: "bg-white",
    glow: "shadow-[4px_4px_0_0_#000]",
  },
  running: {
    border: "border-2 border-black",
    bg: "bg-[#CEEBFC]",
    glow: "shadow-[8px_8px_0_0_#000] -translate-y-1",
  },
  complete: {
    border: "border-2 border-black",
    bg: "bg-[#F9F5F2]",
    glow: "shadow-[4px_4px_0_0_#000]",
  },
  error: {
    border: "border-2 border-black",
    bg: "bg-[#EFD0D5]",
    glow: "shadow-[4px_4px_0_0_#000]",
  },
};

export function PhaseContainer({
  title,
  subtitle,
  icon,
  status,
  accentColor,
  children,
  integrations,
}: PhaseContainerProps) {
  const cfg = statusConfig[status];

  return (
    <div className="relative">
      {/* Phase Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`rounded-md border-2 border-black ${cfg.bg} ${cfg.glow} overflow-hidden transition-all duration-500`}
      >
        {/* Phase Header */}
        <div className="px-6 py-4 border-b-2 border-black flex items-center gap-4 bg-white">
          {/* Status Icon */}
          <div className="relative">
            <div
              className={`size-12 rounded-md border-2 border-black flex items-center justify-center transition-all duration-500 shadow-[2px_2px_0_0_#000] ${
                status === "running"
                  ? `bg-[#FFDA5C]`
                  : status === "complete"
                  ? `bg-[#599D77]`
                  : status === "error"
                  ? `bg-[#EA435F]`
                  : `bg-muted`
              }`}
            >
              {status === "running" ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="size-6 text-black" />
                </motion.div>
              ) : status === "complete" ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <CheckCircle2 className="size-6 text-white" />
                </motion.div>
              ) : (
                <span className={`text-black`}>{icon}</span>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-sm font-black uppercase tracking-tight">{title}</h3>
              {status === "running" && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-black uppercase border-2 border-black bg-[#FFDA5C] text-black shadow-[1px_1px_0_0_#000]"
                >
                  <span className="relative flex size-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full bg-black opacity-75" />
                    <span className="relative inline-flex size-1.5 bg-black" />
                  </span>
                  Processing
                </motion.span>
              )}
              {status === "complete" && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase border-2 border-black bg-[#599D77] text-white shadow-[1px_1px_0_0_#000]"
                >
                  <CheckCircle2 className="size-2.5" /> Done
                </motion.span>
              )}
            </div>
            <p className="text-[11px] font-semibold text-black/60 mt-0.5">{subtitle}</p>
          </div>

          {/* Integration badges */}
          {integrations && integrations.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {integrations.map((int) => (
                <span
                  key={int}
                  className="px-2 py-0.5 text-[9px] font-black uppercase border-2 border-black bg-white shadow-[1px_1px_0_0_#000]"
                >
                  {int}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Phase Content */}
        <AnimatePresence mode="wait">
          {(status === "running" || status === "complete" || status === "error") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="px-6 py-5"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
