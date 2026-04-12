import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ThumbsUp,
  ThumbsDown,
  Clock,
  Loader2,
  Send,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { GlowingBadge } from "@/components/ui/motion";
import type { OutreachChannel } from "@/lib/types";

interface Props {
  leadId: string;
  channel?: OutreachChannel;
  disabled?: boolean;
  onSent?: (result: { sentiment: string; action: string }) => void;
}

const REPLIES: {
  label: string;
  icon: React.ReactNode;
  body: string;
  color: string;
  hoverColor: string;
}[] = [
  {
    label: "Interested",
    icon: <ThumbsUp className="size-3.5" />,
    body: "That sounds really interesting! I'd love to learn more. Can we schedule a quick call this week?",
    color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20",
    hoverColor: "hover:shadow-[0_0_16px_rgba(16,185,129,0.15)]",
  },
  {
    label: "Not Interested",
    icon: <ThumbsDown className="size-3.5" />,
    body: "Thanks but we're not looking at this kind of solution right now. Please remove me from your list.",
    color: "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20",
    hoverColor: "hover:shadow-[0_0_16px_rgba(239,68,68,0.15)]",
  },
  {
    label: "No Reply",
    icon: <Clock className="size-3.5" />,
    body: "",
    color: "bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted",
    hoverColor: "",
  },
];

export default function SimulateReply({ leadId, channel = "email", disabled, onSent }: Props) {
  const [sending, setSending] = useState<string | null>(null);
  const [result, setResult] = useState<{
    sentiment: string;
    action: string;
    reasoning: string;
  } | null>(null);

  async function send(label: string, messageBody: string) {
    setSending(label);
    setResult(null);
    try {
      const res = await api.sendWebhookResponse({
        leadId,
        channel,
        messageBody: messageBody || undefined,
      });
      setResult({
        sentiment: res.sentiment,
        action: res.action,
        reasoning: res.reasoning,
      });
      onSent?.({ sentiment: res.sentiment, action: res.action });
    } catch {
      setResult({ sentiment: "error", action: "failed", reasoning: "Request failed" });
    } finally {
      setSending(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Send className="size-3.5 text-primary" />
        <p className="text-xs font-semibold">Simulate Response</p>
        <GlowingBadge variant="purple" className="ml-auto">
          {channel.replace(/_/g, " ")}
        </GlowingBadge>
      </div>

      <div className="flex gap-2">
        {REPLIES.map((r) => (
          <Button
            key={r.label}
            variant="outline"
            size="sm"
            className={`flex-1 gap-1.5 text-[11px] h-9 border transition-all ${r.color} ${r.hoverColor}`}
            disabled={disabled || !!sending}
            onClick={() => send(r.label, r.body)}
          >
            {sending === r.label ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              r.icon
            )}
            {r.label}
          </Button>
        ))}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm p-3 space-y-2"
          >
            <div className="flex items-center gap-2">
              <GlowingBadge
                variant={
                  result.sentiment === "positive" ? "emerald" :
                  result.sentiment === "negative" ? "red" :
                  "orange"
                }
              >
                {result.sentiment}
              </GlowingBadge>
              <ArrowRight className="size-3 text-muted-foreground/50" />
              <GlowingBadge variant="purple">
                {result.action.replace(/_/g, " ")}
              </GlowingBadge>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">{result.reasoning}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
