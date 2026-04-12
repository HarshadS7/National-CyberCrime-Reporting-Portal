import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Target,
  TrendingUp,
  Brain,
  MessageSquare,
  Lightbulb,
  Send,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { StreamingText, AnimatedCounter } from "@/components/ui/motion";
import type {
  SSEEvent,
  LeadDetail,
  ScoreDimension,
  TouchContent,
  RationaleItem,
  StrategyDecision,
  ResponseSentiment,
} from "@/lib/types";

interface Props {
  sseEvents: SSEEvent[];
  detail?: LeadDetail | null;
}

// ─── Chip helper ──────────────────────────────────────────────
function Chip({ children, bg = "bg-secondary", text = "text-black" }: { children: React.ReactNode; bg?: string; text?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase border-2 border-black shadow-[1px_1px_0_0_#000] rounded-sm ${bg} ${text}`}>
      {children}
    </span>
  );
}

// ─── Intent Score Gauge ───────────────────────────────────────
function IntentGauge({ score, tier }: { score: number; tier: string }) {
  const tierStroke: Record<string, string> = {
    HOT: "stroke-[#EA435F]",
    WARM: "stroke-[#FFDA5C]",
    COOL: "stroke-[#CEEBFC]",
    COLD: "stroke-gray-400",
  };
  const tierBg: Record<string, string> = {
    HOT: "bg-[#EA435F] text-white",
    WARM: "bg-[#FFDA5C] text-black",
    COOL: "bg-[#CEEBFC] text-black",
    COLD: "bg-gray-200 text-black",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative size-28">
        <svg className="size-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
          <motion.circle
            cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="butt"
            className={tierStroke[tier] || "stroke-gray-400"}
            initial={{ strokeDasharray: "0 264" }}
            animate={{ strokeDasharray: `${(score / 100) * 264} 264` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black font-mono">
            <AnimatedCounter value={score} />
          </span>
          <span className="text-[10px] font-bold text-muted-foreground">/100</span>
        </div>
      </div>
      <Chip bg={tierBg[tier] || "bg-secondary"}>{tier}</Chip>
    </div>
  );
}

// ─── Score Dimensions ─────────────────────────────────────────
function ScoreDimensions({ dimensions }: { dimensions: ScoreDimension[] }) {
  const sorted = [...dimensions].sort((a, b) => b.weightedScore - a.weightedScore);
  return (
    <div className="space-y-3">
      {sorted.map((d, i) => (
        <motion.div
          key={d.name}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="space-y-1.5"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase">{d.name}</span>
            <span className="text-[10px] font-black font-mono border border-black px-1.5 py-px bg-muted shadow-[1px_1px_0_0_#000]">
              {d.rawScore.toFixed(1)} × {d.weight.toFixed(2)}
            </span>
          </div>
          <div className="h-3 bg-muted border-2 border-black shadow-[2px_2px_0_0_#000] rounded-none overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(d.rawScore / 10) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Strategy Card ────────────────────────────────────────────
function StrategyCard({ strategy }: {
  strategy: {
    primaryChannel?: string;
    secondaryChannel?: string;
    toneFramework?: string;
    sendTimestamp?: string;
    decisions?: StrategyDecision[];
  };
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="border-2 border-black bg-[#CEEBFC] p-3 shadow-[2px_2px_0_0_#000]">
          <p className="text-[9px] font-black uppercase text-black mb-1">Primary Channel</p>
          <p className="text-xs font-black flex items-center gap-1.5 uppercase">
            <Send className="size-3" />
            {strategy.primaryChannel?.replace(/_/g, " ") || "—"}
          </p>
        </div>
        <div className="border-2 border-black bg-secondary p-3 shadow-[2px_2px_0_0_#000]">
          <p className="text-[9px] font-black uppercase text-black mb-1">Tone Framework</p>
          <p className="text-xs font-black flex items-center gap-1.5 uppercase">
            <Sparkles className="size-3" />
            {strategy.toneFramework?.replace(/_/g, " ") || "—"}
          </p>
        </div>
      </div>
      {strategy.decisions && strategy.decisions.length > 0 && (
        <div className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-wider border-b-2 border-black pb-1">Key Decisions</p>
          {strategy.decisions.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="border-2 border-black bg-white p-3 shadow-[2px_2px_0_0_#000]"
            >
              <p className="text-xs font-black text-primary uppercase">{d.decision}</p>
              <p className="text-[10px] font-semibold text-black mt-1 leading-relaxed">{d.reasoning}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Touch Content Tabs ────────────────────────────────────────
function ContentTabs({ touches }: { touches: TouchContent[] }) {
  if (!touches.length) {
    return (
      <div className="py-8 text-center border-2 border-dashed border-black">
        <MessageSquare className="size-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-xs font-bold uppercase text-muted-foreground">Awaiting content generation…</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="1" className="w-full">
      <TabsList
        className="grid w-full bg-white border-2 border-black shadow-[2px_2px_0_0_#000] p-0.5 rounded-sm h-auto"
        style={{ gridTemplateColumns: `repeat(${touches.length}, 1fr)` }}
      >
        {touches.map((t) => (
          <TabsTrigger
            key={t.touchNumber}
            value={String(t.touchNumber)}
            className="text-[11px] font-black uppercase rounded-sm data-[state=active]:bg-primary data-[state=active]:text-white border-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-[1px_1px_0_0_#000]"
          >
            T{t.touchNumber}
          </TabsTrigger>
        ))}
      </TabsList>
      {touches.map((t) => (
        <TabsContent key={t.touchNumber} value={String(t.touchNumber)} className="mt-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Chip bg="bg-[#CEEBFC]">{t.channel.replace(/_/g, " ")}</Chip>
              {t.subject && (
                <span className="text-[10px] font-bold text-black truncate flex-1">
                  Re: {t.subject}
                </span>
              )}
            </div>
            <div className="border-2 border-black bg-white p-3 text-[11px] leading-relaxed whitespace-pre-wrap font-mono text-black shadow-[2px_2px_0_0_#000]">
              <StreamingText text={t.body} speed={8} showCursor={false} />
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

// ─── Decision Theatre ─────────────────────────────────────────
function DecisionTheatre({ items }: { items: RationaleItem[] }) {
  if (!items.length) {
    return (
      <div className="py-8 text-center border-2 border-dashed border-black">
        <Lightbulb className="size-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-xs font-bold uppercase text-muted-foreground">Waiting for explainer agent…</p>
      </div>
    );
  }

  const confidenceBg = (c: number) => c > 0.8 ? "bg-[#599D77] text-white" : c > 0.5 ? "bg-secondary text-black" : "bg-[#EA435F] text-white";

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="border-2 border-black bg-white p-3 space-y-2 shadow-[2px_2px_0_0_#000]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase">{item.agentName}</span>
            <Chip bg={confidenceBg(item.confidence)}>{Math.round(item.confidence * 100)}%</Chip>
          </div>
          <p className="text-xs font-black text-primary uppercase">{item.decision}</p>
          <p className="text-[10px] font-semibold text-black leading-relaxed">{item.explanation}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Response Card ────────────────────────────────────────────
function ResponseCard({
  sentiment,
  action,
  reasoning,
}: {
  sentiment: ResponseSentiment;
  action: string;
  reasoning: string;
}) {
  const sentimentBg: Record<string, string> = {
    positive: "bg-[#599D77] text-white",
    negative: "bg-[#EA435F] text-white",
    neutral: "bg-secondary text-black",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border-2 border-black bg-white p-4 space-y-3 shadow-[4px_4px_0_0_#000]"
    >
      <div className="flex items-center gap-2">
        <Chip bg={sentimentBg[sentiment] || "bg-muted text-black"}>{sentiment.replace(/_/g, " ")}</Chip>
        <ArrowRight className="size-4 text-black" strokeWidth={3} />
        <Chip bg="bg-secondary">{action.replace(/_/g, " ")}</Chip>
      </div>
      <p className="text-[10px] font-mono text-black leading-relaxed border-2 border-black p-2 bg-muted/20">{reasoning}</p>
    </motion.div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────
function PanelSection({
  icon,
  title,
  description,
  children,
  accent = "bg-secondary",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <Card className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000] rounded-md overflow-hidden">
      <CardHeader className={`pb-3 pt-4 px-4 border-b-2 border-black ${accent}`}>
        <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
          {icon}
          {title}
        </CardTitle>
        <CardDescription className="text-[10px] font-bold uppercase text-black/70">{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-4">
        {children}
      </CardContent>
    </Card>
  );
}

// ─── Main Right Panel ─────────────────────────────────────────
export default function RightPanel({ sseEvents, detail }: Props) {
  const parsed = useMemo(() => {
    let score: { compositeScore: number; tier: string; dimensions: ScoreDimension[] } | null = null;
    let strategy: {
      primaryChannel?: string;
      secondaryChannel?: string;
      toneFramework?: string;
      sendTimestamp?: string;
      decisions?: StrategyDecision[];
    } | null = null;
    let touches: TouchContent[] = [];
    let rationale: RationaleItem[] = [];
    let response: { sentiment: ResponseSentiment; action: string; reasoning: string } | null = null;

    if (detail?.agentOutputs) {
      const o = detail.agentOutputs as Record<string, Record<string, unknown>>;
      if (o["3"]) {
        score = {
          compositeScore: (o["3"].compositeScore as number) || 0,
          tier: (o["3"].tier as string) || "COLD",
          dimensions: (o["3"].dimensions as ScoreDimension[]) || [],
        };
      }
      if (o["5"]) {
        strategy = {
          primaryChannel: o["5"].primaryChannel as string,
          secondaryChannel: o["5"].secondaryChannel as string,
          toneFramework: o["5"].toneFramework as string,
          sendTimestamp: o["5"].sendTimestamp as string,
          decisions: o["5"].decisions as StrategyDecision[],
        };
      }
      if (o["6"]) {
        touches = (o["6"].touches as TouchContent[]) || [];
      }
      if (o["7"]) {
        rationale = (o["7"].explanations as RationaleItem[]) || [];
      }
    }

    for (const ev of sseEvents) {
      if (ev.type === "score_update") {
        const d = ev.data as Record<string, unknown>;
        score = {
          compositeScore: (d.compositeScore as number) || 0,
          tier: (d.tier as string) || "COLD",
          dimensions: (d.dimensions as ScoreDimension[]) || [],
        };
      }
      if (ev.type === "strategy_update") {
        const d = ev.data as Record<string, unknown>;
        strategy = {
          primaryChannel: d.primaryChannel as string,
          toneFramework: d.toneFramework as string,
          decisions: d.decisions as StrategyDecision[],
        };
      }
      if (ev.type === "content_update") {
        const d = ev.data as Record<string, unknown>;
        touches = (d.touches as TouchContent[]) || [];
      }
      if (ev.type === "rationale_update") {
        const d = ev.data as Record<string, unknown>;
        rationale = (d.explanations as RationaleItem[]) || [];
      }
      if (ev.type === "response_update") {
        const d = ev.data as Record<string, unknown>;
        response = {
          sentiment: d.sentiment as ResponseSentiment,
          action: d.action as string,
          reasoning: d.classificationReasoning as string || d.reasoning as string || "",
        };
      }
    }

    if (!response && detail?.responses?.length) {
      const r = detail.responses[detail.responses.length - 1];
      response = { sentiment: r.sentiment, action: r.action, reasoning: r.classificationReasoning };
    }

    return { score, strategy, touches, rationale, response };
  }, [sseEvents, detail]);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Intent Score */}
        <AnimatePresence>
          <PanelSection
            icon={<Target className="size-4" />}
            title="Intent Score"
            description="Agent 3 — Composite intent scoring"
            accent="bg-[#FFDA5C]"
          >
            {parsed.score ? (
              <div className="space-y-4">
                <IntentGauge score={parsed.score.compositeScore} tier={parsed.score.tier} />
                {parsed.score.dimensions.length > 0 && (
                  <>
                    <div className="h-0.5 bg-black w-full" />
                    <ScoreDimensions dimensions={parsed.score.dimensions} />
                  </>
                )}
              </div>
            ) : (
              <div className="py-8 text-center border-2 border-dashed border-black">
                <Target className="size-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs font-bold uppercase text-muted-foreground">Awaiting intent scoring…</p>
              </div>
            )}
          </PanelSection>
        </AnimatePresence>

        {/* Strategy */}
        <PanelSection
          icon={<TrendingUp className="size-4" />}
          title="Strategy"
          description="Agent 5 — Channel & tone decisions"
          accent="bg-[#CEEBFC]"
        >
          {parsed.strategy ? (
            <StrategyCard strategy={parsed.strategy} />
          ) : (
            <div className="py-8 text-center border-2 border-dashed border-black">
              <TrendingUp className="size-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs font-bold uppercase text-muted-foreground">Awaiting strategy commander…</p>
            </div>
          )}
        </PanelSection>

        {/* Message Content */}
        <PanelSection
          icon={<MessageSquare className="size-4" />}
          title="Generated Content"
          description="Agent 6 — AI-crafted outreach messages"
          accent="bg-secondary"
        >
          <ContentTabs touches={parsed.touches} />
        </PanelSection>

        {/* Decision Theatre */}
        <PanelSection
          icon={<Lightbulb className="size-4" />}
          title="Decision Theatre"
          description="Agent 7 — Explainability & reasoning"
          accent="bg-muted"
        >
          <DecisionTheatre items={parsed.rationale} />
        </PanelSection>

        {/* Response */}
        {parsed.response && (
          <PanelSection
            icon={<Brain className="size-4" />}
            title="Response Analysis"
            description="Agent 9 — Sentiment classification"
            accent="bg-[#599D77] text-white"
          >
            <ResponseCard {...parsed.response} />
          </PanelSection>
        )}
      </div>
    </ScrollArea>
  );
}
