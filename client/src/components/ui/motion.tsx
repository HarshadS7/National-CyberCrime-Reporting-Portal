import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StreamingTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  showCursor?: boolean;
}

export function StreamingText({
  text,
  speed = 20,
  className = "",
  onComplete,
  showCursor = true,
}: StreamingTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");
    setDone(false);

    if (!text) return;

    const interval = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= text.length) {
        setDisplayed(text);
        setDone(true);
        clearInterval(interval);
        onComplete?.();
      } else {
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <span className={className}>
      {displayed}
      {showCursor && !done && (
        <span className="cursor-blink" />
      )}
    </span>
  );
}

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  duration = 1500,
  className = "",
  decimals = 0,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = null;

    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(eased * value);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return <span className={className}>{count.toFixed(decimals)}</span>;
}

interface GlowingBadgeProps {
  children: React.ReactNode;
  variant?: "purple" | "emerald" | "cyan" | "orange" | "red";
  pulse?: boolean;
  className?: string;
}

const badgeColors = {
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]",
  emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
  cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]",
  orange: "bg-orange-500/15 text-orange-400 border-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.15)]",
  red: "bg-red-500/15 text-red-400 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]",
};

export function GlowingBadge({
  children,
  variant = "purple",
  pulse = false,
  className = "",
}: GlowingBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full border ${badgeColors[variant]} ${className}`}
    >
      {pulse && (
        <span className="relative flex size-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            variant === "purple" ? "bg-purple-400" :
            variant === "emerald" ? "bg-emerald-400" :
            variant === "cyan" ? "bg-cyan-400" :
            variant === "orange" ? "bg-orange-400" :
            "bg-red-400"
          }`} />
          <span className={`relative inline-flex rounded-full size-2 ${
            variant === "purple" ? "bg-purple-400" :
            variant === "emerald" ? "bg-emerald-400" :
            variant === "cyan" ? "bg-cyan-400" :
            variant === "orange" ? "bg-orange-400" :
            "bg-red-400"
          }`} />
        </span>
      )}
      {children}
    </span>
  );
}

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}

export function FadeIn({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: FadeInProps) {
  const dirs = {
    up: { y: 16, x: 0 },
    down: { y: -16, x: 0 },
    left: { x: 16, y: 0 },
    right: { x: -16, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...dirs[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function StatusDot({ status }: { status: "idle" | "running" | "complete" | "error" }) {
  const colors = {
    idle: "bg-zinc-500",
    running: "bg-purple-400",
    complete: "bg-emerald-400",
    error: "bg-red-400",
  };

  return (
    <span className="relative flex size-2.5">
      {status === "running" && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors[status]} opacity-75`} />
      )}
      <span className={`relative inline-flex rounded-full size-2.5 ${colors[status]}`} />
    </span>
  );
}
