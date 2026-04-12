import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import type { Lead, HealthCheck } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FadeIn, AnimatedCounter, GlowingBadge, StatusDot } from "@/components/ui/motion";
import {
  Building2,
  User,
  ArrowRight,
  Plus,
  Activity,
  Zap,
  Server,
  RefreshCw,
  Cpu,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Send,
  Brain,
} from "lucide-react";

const STATUS_BADGE: Record<string, { color: string; label: string }> = {
  pipeline_running: { color: "emerald", label: "Running" },
  pipeline_complete: { color: "emerald", label: "Complete" },
  enriched: { color: "cyan", label: "Enriched" },
  error: { color: "red", label: "Error" },
};

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchAll() {
    setLoading(true);
    try {
      const [leadsRes, healthRes] = await Promise.all([
        api.getLeads(),
        api.health(),
      ]);
      setLeads(leadsRes.leads || []);
      setHealth(healthRes as unknown as HealthCheck);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, []);

  const running = leads.filter((l) => l.status === "pipeline_running").length;
  const completed = leads.filter((l) => l.status === "pipeline_complete").length;
  const errored = leads.filter((l) => l.status === "error").length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
                <GlowingBadge variant="purple" pulse>
                  <Cpu className="size-3" />
                  10 Agents Online
                </GlowingBadge>
              </div>
              <p className="text-muted-foreground text-sm">
                Real-time autonomous outreach pipeline monitoring
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={fetchAll}
              >
                <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Link to="/dashboard/new">
                <Button size="sm" className="gap-1.5 bg-linear-to-r from-green-deep to-green-mid hover:from-green-deep/90 hover:to-green-mid/90 text-white border-0 shadow-lg shadow-green-deep/20">
                  <Plus className="size-3.5" /> Launch Pipeline
                </Button>
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* Stats Grid */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-5 gap-3">
            {/* Total Leads */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative group hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Activity className="size-4 text-primary" />
                  </div>
                  <TrendingUp className="size-3.5 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold font-mono">
                  <AnimatedCounter value={leads.length} />
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Total Leads</p>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>

            {/* Running */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative group hover:border-purple-500/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Brain className="size-4 text-purple-400" />
                  </div>
                  {running > 0 && <StatusDot status="running" />}
                </div>
                <p className="text-2xl font-bold font-mono">
                  <AnimatedCounter value={running} />
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Active Pipelines</p>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>

            {/* Completed */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative group hover:border-emerald-500/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                  </div>
                  <Zap className="size-3.5 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold font-mono">
                  <AnimatedCounter value={completed} />
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Completed</p>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>

            {/* Errors */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative group hover:border-orange-500/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <AlertTriangle className="size-4 text-orange-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold font-mono">
                  <AnimatedCounter value={errored} />
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Errors</p>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-orange-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>

            {/* SSE Streams */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative group hover:border-cyan-500/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Server className="size-4 text-cyan-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold font-mono">
                  <AnimatedCounter value={health?.connectedClients || 0} />
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Live Streams</p>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          </div>
        </FadeIn>

        {/* Agent Pipeline Mini Visual */}
        <FadeIn delay={0.15}>
          <Card className="border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="size-4 text-primary" />
                <span className="text-sm font-semibold">Agent Pipeline Architecture</span>
                <span className="text-[10px] text-muted-foreground ml-2">10-agent DAG • parallel execution</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {[
                  { n: 1, name: "Ingestion", icon: "📥" },
                  { n: 2, name: "Signal Scout", icon: "🔍" },
                  { n: "3+4", name: "Score + Persona", icon: "⚡", parallel: true },
                  { n: 5, name: "Strategy", icon: "🎯" },
                  { n: "6+7", name: "Content + Explain", icon: "✍️", parallel: true },
                  { n: 8, name: "Delivery", icon: "📤" },
                  { n: 9, name: "Monitor", icon: "👁️" },
                  { n: 10, name: "Learning", icon: "🧠" },
                ].map((agent, i, arr) => (
                  <div key={i} className="flex items-center gap-2 shrink-0">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        (agent as { parallel?: boolean }).parallel
                          ? "border-purple-500/30 bg-purple-500/5"
                          : "border-border/50 bg-muted/30"
                      }`}
                    >
                      <span className="text-sm">{agent.icon}</span>
                      <div>
                        <p className="text-[10px] font-mono text-muted-foreground">#{agent.n}</p>
                        <p className="text-[11px] font-medium whitespace-nowrap">{agent.name}</p>
                      </div>
                    </motion.div>
                    {i < arr.length - 1 && (
                      <ArrowRight className="size-3.5 text-muted-foreground/40 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Lead List */}
        <FadeIn delay={0.2}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">Recent Missions</h2>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {leads.length}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Clock className="size-3" /> Auto-refreshing every 15s
              </div>
            </div>

            {loading && !leads.length && (
              <Card className="border-border/50 bg-card/30">
                <CardContent className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="size-10 rounded-xl bg-muted/50 flex items-center justify-center">
                      <RefreshCw className="size-5 text-muted-foreground animate-spin" />
                    </div>
                    <p className="text-sm text-muted-foreground">Loading missions…</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!loading && !leads.length && (
              <Card className="border-border/50 bg-card/30 border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Send className="size-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">No missions yet</p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Launch your first autonomous outreach pipeline
                      </p>
                      <Link to="/dashboard/new">
                        <Button size="sm" className="gap-1.5 bg-linear-to-r from-green-deep to-green-mid text-white border-0">
                          <Plus className="size-3.5" /> Launch Pipeline
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <ScrollArea className="max-h-105">
              <div className="space-y-2">
                {leads.map((lead, i) => {
                  const statusInfo = STATUS_BADGE[lead.status] || { color: "purple", label: lead.status };
                  return (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link to={`/dashboard/pipeline/${lead.id}`} className="block group">
                        <Card className="border-border/40 bg-card/40 backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:bg-card/60 group-hover:shadow-lg group-hover:shadow-primary/5">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="size-11 rounded-xl bg-linear-to-br from-primary/15 to-purple-500/10 flex items-center justify-center shrink-0 group-hover:from-primary/25 group-hover:to-purple-500/20 transition-all">
                              <Building2 className="size-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-sm truncate">{lead.companyName}</p>
                                <GlowingBadge variant={statusInfo.color as "purple" | "emerald" | "cyan" | "red"} pulse={lead.status === "pipeline_running"}>
                                  {lead.status === "pipeline_running" && <StatusDot status="running" />}
                                  {statusInfo.label}
                                </GlowingBadge>
                                {lead.source && (
                                  <Badge variant="secondary" className="text-[9px] font-mono">
                                    {lead.source}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {lead.contactName && (
                                  <span className="flex items-center gap-1">
                                    <User className="size-2.5" /> {lead.contactName}
                                  </span>
                                )}
                                {lead.contactTitle && <span>{lead.contactTitle}</span>}
                                {lead.industry && <span>· {lead.industry}</span>}
                                {lead.createdAt && (
                                  <span className="ml-auto text-[10px] font-mono">
                                    {new Date(lead.createdAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
