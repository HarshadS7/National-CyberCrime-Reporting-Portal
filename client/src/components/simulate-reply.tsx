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
  bg: string;
  textColor: string;
}[] = [
  {
    label: "Interested",
    icon: <ThumbsUp className="size-4" />,
    body: "That sounds really interesting! I'd love to learn more. Can we schedule a quick call this week?",
    bg: "bg-[#599D77]",
    textColor: "text-white",
  },
  {
    label: "Not Interested",
    icon: <ThumbsDown className="size-4" />,
    body: "Thanks but we're not looking at this kind of solution right now. Please remove me from your list.",
    bg: "bg-[#EA435F]",
    textColor: "text-white",
  },
  {
    label: "No Reply",
    icon: <Clock className="size-4" />,
    body: "",
    bg: "bg-secondary",
    textColor: "text-black",
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

  const sentimentBg: Record<string, string> = {
    positive: "bg-[#599D77] text-white",
    negative: "bg-[#EA435F] text-white",
    neutral: "bg-secondary text-black",
    error: "bg-destructive text-white",
  };

  return (
    <div className="space-y-4 border-2 border-black bg-white rounded-md p-4 shadow-[4px_4px_0_0_#000]">
      <div className="flex items-center gap-2 border-b-2 border-black pb-3">
        <Send className="size-4 text-black" />
        <p className="text-sm font-black uppercase tracking-wider">Simulate Response</p>
        <span className="ml-auto text-[10px] font-black uppercase border-2 border-black px-2 py-0.5 bg-secondary shadow-[2px_2px_0_0_#000]">
          {channel.replace(/_/g, " ")}
        </span>
      </div>

      <div className="flex gap-2">
        {REPLIES.map((r) => (
          <Button
            key={r.label}
            className={`flex-1 gap-1.5 text-xs h-10 font-black uppercase border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-md ${r.bg} ${r.textColor}`}
            disabled={disabled || !!sending}
            onClick={() => send(r.label, r.body)}
          >
            {sending === r.label ? (
              <Loader2 className="size-4 animate-spin" />
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
            className="border-2 border-black bg-white rounded-md p-4 space-y-3 shadow-[2px_2px_0_0_#000]"
          >
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black uppercase border-2 border-black px-2 py-1 shadow-[2px_2px_0_0_#000] rounded-sm ${sentimentBg[result.sentiment] || "bg-muted text-black"}`}>
                {result.sentiment}
              </span>
              <ArrowRight className="size-4 text-black" strokeWidth={3} />
              <span className="text-xs font-black uppercase border-2 border-black px-2 py-1 shadow-[2px_2px_0_0_#000] bg-secondary text-black rounded-sm">
                {result.action.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-xs text-black font-mono leading-relaxed border-2 border-black p-3 bg-muted/20 shadow-[1px_1px_0_0_#000]">{result.reasoning}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
