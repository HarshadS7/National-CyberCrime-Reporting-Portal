import { useEffect, useState } from "react";
import { useSSE } from "@/hooks/use-sse";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, GlowingBadge } from "@/components/ui/motion";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  Zap,
  Globe,
  Radio,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Brain,
  Cpu,
} from "lucide-react";

export default function ActivityPage() {
  const { events, connected } = useSSE(); // No ID = global events
  const [log, setLog] = useState<any[]>([]);

  useEffect(() => {
    // Keep only the last 100 events
    if (events.length > 0) {
      const newEvents = events.filter(e => e.type !== 'connected');
      setLog(prev => [...newEvents, ...prev].slice(0, 100));
    }
  }, [events]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="max-w-4xl mx-auto w-full p-6 space-y-6 flex-1 flex flex-col min-h-0">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold tracking-tight">System Activity</h1>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${connected
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                    : "border-red-500/30 bg-red-500/5 text-red-400"
                  }`}>
                  <Radio className={`size-3 ${connected ? "animate-pulse" : ""}`} />
                  {connected ? "LIVE FEED" : "DISCONNECTED"}
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                Global event stream from the Nerve autonomous engine
              </p>
            </div>
          </div>
        </FadeIn>

        <Card className="flex-1 min-h-0 border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            <div className="px-4 py-3 border-b border-border/40 bg-muted/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider">Live Logs</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                Displaying {log.length} recent events
              </span>
            </div>

            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-2">
                <AnimatePresence initial={false}>
                  {log.length === 0 ? (
                    <div className="py-20 text-center space-y-3">
                      <div className="size-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto opacity-50">
                        <Zap className="size-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Waiting for system signals…</p>
                    </div>
                  ) : (
                    log.map((event, i) => (
                      <motion.div
                        key={`${event.timestamp}-${i}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-4 p-3 rounded-lg border border-border/30 bg-card/40 hover:bg-card/60 transition-colors group"
                      >
                        <div className="mt-1 shadow-sm">
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] font-mono text-primary/80 uppercase tracking-tight">
                              {event.type.replace('_', ' ')}
                            </span>
                            <span className="text-[9px] font-mono text-muted-foreground">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                          </div>

                          <p className="text-sm font-medium text-foreground/90 mb-1 leading-snug">
                            {getEventLabel(event)}
                          </p>

                          {event.leadId && event.leadId !== 'system' && (
                            <div className="flex items-center gap-1.5 pt-1">
                              <div className="size-1.5 rounded-full bg-primary/40" />
                              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-tighter">
                                ID: {event.leadId}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getEventIcon(type: string) {
  switch (type) {
    case 'agent_status': return <Cpu className="size-4 text-purple-400" />;
    case 'delivery_update': return <Send className="size-4 text-blue-400" />;
    case 'score_update': return <Zap className="size-4 text-emerald-400" />;
    case 'branch_decision': return <Brain className="size-4 text-orange-400" />;
    case 'pipeline_complete': return <CheckCircle2 className="size-4 text-emerald-500" />;
    case 'error': return <AlertTriangle className="size-4 text-red-400" />;
    default: return <Globe className="size-4 text-cyan-400" />;
  }
}

function getEventLabel(event: any) {
  if (event.type === 'agent_status') {
    return `Agent ${event.data.agentNumber} (${event.data.agentName}) is now ${event.data.status}. ${event.data.outputSummary || ''}`;
  }
  if (event.type === 'delivery_update') {
    return `Message delivered via ${event.data.channel.replace('_', ' ')} (${event.data.status})`;
  }
  if (event.type === 'pipeline_complete') {
    return `Mission complete. Status: ${event.data.status}. Outcome: ${event.data.action || 'n/a'}`;
  }
  if (event.type === 'branch_decision') {
    return `Decision made: ${event.data.action.replace('_', ' ')} — ${event.data.message}`;
  }
  if (event.type === 'error') {
    return `Error alert: ${event.data.error}`;
  }
  return typeof event.data === 'string' ? event.data : JSON.stringify(event.data);
}
