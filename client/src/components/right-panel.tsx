import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { GlowingBadge, StreamingText, AnimatedCounter } from "@/components/ui/motion";
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

// ─── Intent Score Gauge ───────────────────────────────────────
function IntentGauge({ score, tier }: { score: number; tier: string }) {
  const tierVariant: Record<string, "red" | "orange" | "cyan" | "purple"> = {
    HOT: "red", WARM: "orange", COOL: "cyan", COLD: "purple",
  };

  const tierGradient: Record<string, string> = {
    HOT: "stroke-red-400",
    WARM: "stroke-orange-400",
    COOL: "stroke-cyan-400",
    COLD: "stroke-zinc-500",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative size-28">
        <svg className="size-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
          <motion.circle
            cx="50" cy="50" r="42" fill="none" strokeWidth="6" strokeLinecap="round"
            className={tierGradient[tier] || "stroke-zinc-500"}
            initial={{ strokeDasharray: "0 264" }}
            animate={{ strokeDasharray: `${(score / 100) * 264} 264` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono">
            <AnimatedCounter value={score} />
          </span>
          <span className="text-[10px] text-muted-foreground">/100</span>
        </div>
      </div>
      <GlowingBadge variant={tierVariant[tier] || "purple"} pulse>
        {tier}
      </GlowingBadge>
    </div>
  );
}

// ─── Score Dimensions ─────────────────────────────────────────
function ScoreDimensions({ dimensions }: { dimensions: ScoreDimension[] }) {
  const sorted = [...dimensions].sort((a, b) => b.weightedScore - a.weightedScore);
  return (
    <div className="space-y-2.5">
      {sorted.map((d, i) => (
        <motion.div
          key={d.name}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="space-y-1"
        >
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-medium">{d.name}</span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {d.rawScore.toFixed(1)} × {d.weight.toFixed(2)}
            </span>
          </div>
          <Progress value={(d.rawScore / 10) * 100} className="h-1.5" />
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
        <div className="rounded-lg border border-border/40 bg-card/30 p-2.5">
          <p className="text-[10px] text-muted-foreground mb-1">Primary Channel</p>
          <p className="text-xs font-semibold flex items-center gap-1.5">
            <Send className="size-3 text-primary" />
            {strategy.primaryChannel || "—"}
          </p>
        </div>
        <div className="rounded-lg border border-border/40 bg-card/30 p-2.5">
          <p className="text-[10px] text-muted-foreground mb-1">Tone Framework</p>
          <p className="text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="size-3 text-purple-400" />
            {strategy.toneFramework?.replace(/_/g, " ") || "—"}
          </p>
        </div>
      </div>
      {strategy.decisions && strategy.decisions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Key Decisions</p>
          {strategy.decisions.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-lg border border-border/30 bg-card/20 p-2.5"
            >
              <p className="text-[11px] font-medium text-primary">{d.decision}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{d.reasoning}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Touch Content Tabs with Streaming Effect ─────────────────
function ContentTabs({ touches }: { touches: TouchContent[] }) {
  if (!touches.length) {
    return (
      <div className="py-6 text-center">
        <MessageSquare className="size-5 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-[11px] text-muted-foreground">Awaiting content generation…</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="1" className="w-full">
      <TabsList className="grid w-full bg-muted/30 p-0.5 rounded-lg" style={{ gridTemplateColumns: `repeat(${touches.length}, 1fr)` }}>
        {touches.map((t) => (
          <TabsTrigger key={t.touchNumber} value={String(t.touchNumber)} className="text-[11px] rounded-md">
            Touch {t.touchNumber}
          </TabsTrigger>
        ))}
      </TabsList>
      {touches.map((t) => (
        <TabsContent key={t.touchNumber} value={String(t.touchNumber)} className="mt-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GlowingBadge variant="cyan">
                {t.channel.replace(/_/g, " ")}
              </GlowingBadge>
              {t.subject && (
                <span className="text-[11px] text-muted-foreground truncate">
                  Re: {t.subject}
                </span>
              )}
            </div>
            <div className="rounded-lg border border-border/30 bg-background/50 p-3 text-[11px] leading-relaxed whitespace-pre-wrap font-mono text-foreground/80">
              <StreamingText text={t.body} speed={8} showCursor={false} />
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

// ─── Decision Theatre (Rationale) ─────────────────────────────
function DecisionTheatre({ items }: { items: RationaleItem[] }) {
  if (!items.length) {
    return (
      <div className="py-6 text-center">
        <Lightbulb className="size-5 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-[11px] text-muted-foreground">Waiting for explainer agent…</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-lg border border-border/30 bg-card/20 p-3 space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold">{item.agentName}</span>
            <GlowingBadge variant={item.confidence > 0.8 ? "emerald" : item.confidence > 0.5 ? "orange" : "red"}>
              {Math.round(item.confidence * 100)}%
            </GlowingBadge>
          </div>
          <p className="text-[11px] text-primary font-medium">{item.decision}</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">{item.explanation}</p>
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
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-lg border border-border/30 bg-card/20 p-3 space-y-2"
    >
      <div className="flex items-center gap-2">
        <GlowingBadge variant={
          sentiment === "positive" ? "emerald" :
          sentiment === "negative" ? "red" : "orange"
        }>
          {sentiment.replace(/_/g, " ")}
        </GlowingBadge>
        <ArrowRight className="size-3 text-muted-foreground/40" />
        <GlowingBadge variant="purple">
          {action.replace(/_/g, " ")}
        </GlowingBadge>
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed font-mono">{reasoning}</p>
    </motion.div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────
function PanelSection({
  icon,
  title,
  description,
  children,
  accentColor = "text-primary",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  accentColor?: string;
}) {
  return (
    <Card className="border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <span className={accentColor}>{icon}</span>
          {title}
        </CardTitle>
        <CardDescription className="text-[10px]">{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
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
      <div className="p-4 space-y-3">
        {/* Intent Score */}
        <AnimatePresence>
          <PanelSection
            icon={<Target className="size-4" />}
            title="Intent Score"
            description="Agent 3 — Composite intent scoring"
            accentColor="text-orange-400"
          >
            {parsed.score ? (
              <div className="space-y-4">
                <IntentGauge score={parsed.score.compositeScore} tier={parsed.score.tier} />
                {parsed.score.dimensions.length > 0 && (
                  <>
                    <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />
                    <ScoreDimensions dimensions={parsed.score.dimensions} />
                  </>
                )}
              </div>
            ) : (
              <div className="py-6 text-center">
                <Target className="size-5 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-[11px] text-muted-foreground">Awaiting intent scoring…</p>
              </div>
            )}
          </PanelSection>
        </AnimatePresence>

        {/* Strategy */}
        <PanelSection
          icon={<TrendingUp className="size-4" />}
          title="Strategy"
          description="Agent 5 — Channel & tone decisions"
          accentColor="text-blue-400"
        >
          {parsed.strategy ? (
            <StrategyCard strategy={parsed.strategy} />
          ) : (
            <div className="py-6 text-center">
              <TrendingUp className="size-5 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-[11px] text-muted-foreground">Awaiting strategy commander…</p>
            </div>
          )}
        </PanelSection>

        {/* Message Content */}
        <PanelSection
          icon={<MessageSquare className="size-4" />}
          title="Generated Content"
          description="Agent 6 — AI-crafted outreach messages"
          accentColor="text-teal-400"
        >
          <ContentTabs touches={parsed.touches} />
        </PanelSection>

        {/* Decision Theatre */}
        <PanelSection
          icon={<Lightbulb className="size-4" />}
          title="Decision Theatre"
          description="Agent 7 — Explainability & reasoning"
          accentColor="text-yellow-400"
        >
          <DecisionTheatre items={parsed.rationale} />
        </PanelSection>

        {/* Response */}
        {parsed.response && (
          <PanelSection
            icon={<Brain className="size-4" />}
            title="Response Analysis"
            description="Agent 9 — Sentiment classification"
            accentColor="text-emerald-400"
          >
            <ResponseCard {...parsed.response} />
          </PanelSection>
        )}
      </div>
    </ScrollArea>
  );
}
