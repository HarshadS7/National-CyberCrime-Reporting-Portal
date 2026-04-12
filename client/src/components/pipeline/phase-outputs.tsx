import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

/* ─── Thinking / Working Animation ─── */
export function ThinkingIndicator({ label = "Analyzing…" }: { label?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-3 py-4"
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="size-2 rounded-full bg-purple-400"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      <span className="text-[12px] text-purple-400 font-medium">{label}</span>
      <motion.div
        className="h-px flex-1 bg-linear-to-r from-purple-500/20 to-transparent"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
}

/* ─── Outcome Key-Value Row ─── */
export function OutcomeRow({
  label,
  value,
  icon,
  accent = "text-foreground",
  mono = false,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accent?: string;
  mono?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 py-2 border-b border-border/10 last:border-0"
    >
      {icon && <span className="mt-0.5 text-muted-foreground/60">{icon}</span>}
      <span className="text-[11px] text-muted-foreground min-w-25 shrink-0">{label}</span>
      <span className={`text-[12px] font-medium ${accent} ${mono ? "font-mono" : ""} flex-1`}>
        {value}
      </span>
    </motion.div>
  );
}

/* ─── Outcome Card — wraps a group of results ─── */
export function OutcomeCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border border-border/20 bg-card/30 backdrop-blur-sm overflow-hidden ${className}`}
    >
      {title && (
        <div className="px-4 py-2.5 border-b border-border/15 bg-muted/10">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
        </div>
      )}
      <div className="px-4 py-3">{children}</div>
    </motion.div>
  );
}

/* ─── Data Tag/Chip ─── */
export function DataChip({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "emerald" | "purple" | "cyan" | "orange" | "red";
}) {
  const variants = {
    default: "bg-muted/30 text-foreground/80 border-border/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md border ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

/* ─── Metric Tile — for quantifiable outputs ─── */
export function MetricTile({
  label,
  value,
  sub,
  icon,
  accentColor = "primary",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  accentColor?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-border/20 bg-card/20 backdrop-blur-sm p-4 text-center"
    >
      {icon && <div className={`text-${accentColor} mb-2 flex justify-center`}>{icon}</div>}
      <p className="text-xl font-bold font-mono">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-[10px] font-medium text-emerald-400 mt-1">{sub}</p>}
    </motion.div>
  );
}

/* ─── Streaming Data List Item ─── */
export function StreamItem({
  delay = 0,
  children,
}: {
  delay?: number;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Agent Tile within a phase (for parallel agents) ─── */
export function AgentTile({
  name,
  status,
  icon,
  children,
}: {
  name: string;
  status: "idle" | "running" | "complete";
  icon: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-500 ${
        status === "running"
          ? "border-purple-500/30 bg-purple-500/4 shadow-[0_0_20px_rgba(168,85,247,0.06)]"
          : status === "complete"
          ? "border-emerald-500/20 bg-emerald-500/2"
          : "border-border/20 bg-card/10"
      }`}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <span
          className={
            status === "running"
              ? "text-purple-400"
              : status === "complete"
              ? "text-emerald-400"
              : "text-muted-foreground/60"
          }
        >
          {icon}
        </span>
        <span className="text-[12px] font-semibold">{name}</span>
        {status === "running" && (
          <motion.div
            className="ml-auto flex gap-0.5"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {[0, 1, 2].map((i) => (
              <div key={i} className="size-1 rounded-full bg-purple-400" />
            ))}
          </motion.div>
        )}
        {status === "complete" && (
          <CheckCircle className="size-3.5 text-emerald-400 ml-auto" />
        )}
      </div>
      {children && (
        <AnimatePresence>
          {(status === "running" || status === "complete") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9 11 3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Progress bar for scores ─── */
export function ScoreBar({
  label,
  value,
  max = 10,
  color = "emerald",
}: {
  label: string;
  value: number;
  max?: number;
  color?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-[10px] font-mono text-foreground/80">
          {value.toFixed(1)}/{max}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/20 overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-${color}-400`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
