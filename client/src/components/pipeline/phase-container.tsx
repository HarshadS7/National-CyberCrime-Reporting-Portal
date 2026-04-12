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
    border: "border-border/30",
    bg: "bg-card/20",
    glow: "",
  },
  running: {
    border: "border-purple-500/40",
    bg: "bg-purple-500/3",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.08)]",
  },
  complete: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/2",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.06)]",
  },
  error: {
    border: "border-red-500/30",
    bg: "bg-red-500/3",
    glow: "",
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
        className={`rounded-2xl border ${cfg.border} ${cfg.bg} ${cfg.glow} backdrop-blur-sm overflow-hidden transition-all duration-500`}
      >
        {/* Phase Header */}
        <div className="px-6 py-4 border-b border-border/20 flex items-center gap-4">
          {/* Status Icon */}
          <div className="relative">
            <div
              className={`size-11 rounded-xl flex items-center justify-center transition-all duration-500 ${
                status === "running"
                  ? `bg-purple-500/15 ring-2 ring-purple-500/20`
                  : status === "complete"
                  ? `bg-emerald-500/15`
                  : status === "error"
                  ? `bg-red-500/15`
                  : `bg-muted/30`
              }`}
            >
              {status === "running" ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="size-5 text-purple-400" />
                </motion.div>
              ) : status === "complete" ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <CheckCircle2 className="size-5 text-emerald-400" />
                </motion.div>
              ) : (
                <span className={`text-${accentColor}-400`}>{icon}</span>
              )}
            </div>
            {/* Pulse ring for running state */}
            {status === "running" && (
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-purple-400/40"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
              {status === "running" && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/15 text-purple-400 border border-purple-500/20"
                >
                  <span className="relative flex size-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-1.5 bg-purple-400" />
                  </span>
                  Processing
                </motion.span>
              )}
              {status === "complete" && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                >
                  <CheckCircle2 className="size-2.5" /> Done
                </motion.span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
          </div>

          {/* Integration badges */}
          {integrations && integrations.length > 0 && (
            <div className="flex items-center gap-1.5">
              {integrations.map((int) => (
                <span
                  key={int}
                  className="px-2 py-0.5 text-[9px] font-mono font-medium rounded-md border border-border/30 bg-muted/20 text-muted-foreground"
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
