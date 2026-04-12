import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

/* ─── Thinking / Working Animation ─── */
export function ThinkingIndicator({ label = "Analyzing…" }: { label?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-3 py-4 px-4 border-2 border-black bg-[#FFDA5C] shadow-[2px_2px_0_0_#000]"
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="size-2.5 bg-black"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      <span className="text-xs font-black uppercase tracking-wider text-black">{label}</span>
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
      className="flex items-start gap-3 py-2 border-b-2 border-black last:border-0"
    >
      {icon && <span className="mt-0.5 text-black">{icon}</span>}
      <span className="text-[11px] font-black uppercase text-muted-foreground min-w-25 shrink-0">{label}</span>
      <span className={`text-[12px] font-bold ${accent} ${mono ? "font-mono" : ""} flex-1`}>
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
      className={`rounded-md border-2 border-black bg-white shadow-[4px_4px_0_0_#000] overflow-hidden ${className}`}
    >
      {title && (
        <div className="px-4 py-2.5 border-b-2 border-black bg-muted/30">
          <span className="text-xs font-black uppercase tracking-widest text-black">
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
    default: "bg-white text-black border-2 border-black shadow-[2px_2px_0_0_#000]",
    emerald: "bg-[#599D77] text-white border-2 border-black shadow-[2px_2px_0_0_#000]",
    purple: "bg-[#A42439] text-white border-2 border-black shadow-[2px_2px_0_0_#000]",
    cyan: "bg-[#CEEBFC] text-black border-2 border-black shadow-[2px_2px_0_0_#000]",
    orange: "bg-[#FFDA5C] text-black border-2 border-black shadow-[2px_2px_0_0_#000]",
    red: "bg-[#EA435F] text-white border-2 border-black shadow-[2px_2px_0_0_#000]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase rounded-sm ${variants[variant]}`}
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
      className="rounded-md border-2 border-black bg-white shadow-[4px_4px_0_0_#000] p-4 text-center transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000]"
    >
      {icon && <div className={`text-black mb-2 flex justify-center`}>{icon}</div>}
      <p className="text-3xl font-black font-mono tracking-tight text-black">{value}</p>
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
      {sub && <p className="text-[10px] font-bold text-black uppercase mt-1 bg-secondary inline-block px-1 border border-black">{sub}</p>}
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
      className={`rounded-md border-2 border-black p-4 transition-all duration-500 ${
        status === "running"
          ? "bg-[#FFE75A] shadow-[4px_4px_0_0_#000] -translate-y-1"
          : status === "complete"
          ? "bg-[#F9F5F2] shadow-[2px_2px_0_0_#000]"
          : "bg-white shadow-none"
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <span
          className={
            status === "running"
              ? "text-black bg-white p-1 border-2 border-black"
              : status === "complete"
              ? "text-white bg-[#599D77] p-1 border-2 border-black"
              : "text-muted-foreground/60 p-1"
          }
        >
          {icon}
        </span>
        <span className="text-sm font-black uppercase text-black tracking-wide">{name}</span>
        {status === "running" && (
          <motion.div
            className="ml-auto flex gap-1"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {[0, 1, 2].map((i) => (
              <div key={i} className="size-2 rounded-none bg-black border border-black shadow-[1px_1px_0_0_#000]" />
            ))}
          </motion.div>
        )}
        {status === "complete" && (
          <CheckCircle className="size-5 text-[#599D77] ml-auto border-2 border-black rounded-full bg-white shadow-[2px_2px_0_0_#000]" />
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
    <div className="space-y-1.5">
      <div className="flex justify-between">
        <span className="text-[10px] font-black uppercase text-black">{label}</span>
        <span className="text-[10px] font-black font-mono border border-black px-1 bg-muted">
          {value.toFixed(1)}/{max}
        </span>
      </div>
      <div className="h-3 bg-muted border-2 border-black shadow-[1px_1px_0_0_#000] overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
