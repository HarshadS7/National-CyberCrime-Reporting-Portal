import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  UserPlus,
  Activity,
  Settings,
  Wifi,
  WifiOff,
  Cpu,
  Zap,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { GlowingBadge } from "@/components/ui/motion";

const NAV = [
  { to: "/", icon: LayoutDashboard, label: "Command Center", description: "Pipeline overview" },
  { to: "/new", icon: UserPlus, label: "New Mission", description: "Launch pipeline" },
  { to: "/activity", icon: Activity, label: "Activity", description: "System logs" },
] as const;

export default function Layout() {
  const location = useLocation();
  const [health, setHealth] = useState<{
    connectedClients?: number;
    simulationMode?: boolean;
  } | null>(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const h = await api.health();
        setHealth(h as typeof health);
        setOnline(true);
      } catch {
        setOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border bg-sidebar flex flex-col relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="size-10 rounded-xl bg-linear-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                <Cpu className="size-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 border-2 border-sidebar animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight">NERVE</h1>
              <p className="text-[10px] text-muted-foreground tracking-[0.2em] font-medium">
                AUTONOMOUS ENGINE
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative z-10 mx-4 h-px bg-linear-to-r from-transparent via-border to-transparent" />

        {/* Navigation */}
        <nav className="relative z-10 flex-1 p-3 space-y-1 mt-2">
          {NAV.map(({ to, icon: Icon, label, description }) => {
            const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className="block relative"
              >
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                    isActive
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-6 rounded-r-full bg-primary"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <div className={`size-8 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                  }`}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-[13px] ${isActive ? "text-foreground" : ""}`}>{label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{description}</p>
                  </div>
                  {isActive && <ChevronRight className="size-3.5 text-primary opacity-60" />}
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section — Status */}
        <div className="relative z-10 p-4 space-y-3">
          <div className="mx-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

          {/* Connection Status */}
          <div className="flex items-center gap-2.5 px-2">
            {online ? (
              <GlowingBadge variant="emerald" pulse>
                <Wifi className="size-3" />
                Connected
              </GlowingBadge>
            ) : (
              <GlowingBadge variant="red" pulse>
                <WifiOff className="size-3" />
                Offline
              </GlowingBadge>
            )}
          </div>

          {/* Sim Mode + Stats */}
          <div className="space-y-2 px-2">
            {health?.simulationMode && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Zap className="size-3 text-cyan-400" />
                <span>Simulation Mode</span>
                <span className="ml-auto text-[10px] font-mono text-cyan-400">ACTIVE</span>
              </div>
            )}
            {typeof health?.connectedClients === "number" && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Activity className="size-3" />
                <span>SSE Streams</span>
                <span className="ml-auto text-[10px] font-mono text-foreground">{health.connectedClients}</span>
              </div>
            )}
          </div>

          {/* Settings link */}
          <NavLink
            to="/settings"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <Settings className="size-3.5" />
            Settings
          </NavLink>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-hidden relative">
        {/* Subtle corner gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-bl from-primary/3 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-linear-to-tr from-purple-500/3 to-transparent pointer-events-none" />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
