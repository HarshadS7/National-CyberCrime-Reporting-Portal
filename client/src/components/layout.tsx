import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  UserPlus,
  Activity,
  Calendar,
  Settings,
  Wifi,
  WifiOff,
  Cpu,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Command Center", accent: "bg-primary" },
  { to: "/dashboard/new", icon: UserPlus, label: "New Mission", accent: "bg-[#CEEBFC]" },
  { to: "/dashboard/activity", icon: Activity, label: "Activity", accent: "bg-secondary" },
  { to: "/dashboard/calendar", icon: Calendar, label: "Calendar", accent: "bg-[#FFDA5C]" },
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
      <aside className="w-64 shrink-0 border-r-2 border-black bg-white flex flex-col">
        {/* Logo */}
        <Link to="/dashboard" className="p-5 pb-4 block border-b-2 border-black hover:bg-secondary transition-colors">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-md bg-primary border-2 border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center">
              <Cpu className="size-6 text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight uppercase">NERVE</h1>
              <p className="text-[10px] text-muted-foreground tracking-[0.18em] font-bold uppercase">
                Autonomous Engine
              </p>
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2 mt-2">
          {NAV.map(({ to, icon: Icon, label, accent }) => {
            const isActive = to === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                end={to === "/dashboard"}
                className="block"
              >
                <div
                  className={`flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-150 border-2 ${
                    isActive
                      ? `${accent} border-black shadow-[3px_3px_0_0_#000] text-black`
                      : "border-transparent text-black hover:border-black hover:shadow-[2px_2px_0_0_#000] hover:bg-muted/30"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute left-0 w-1 h-8 bg-black rounded-r"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <div className={`size-8 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? "border-black bg-white shadow-[2px_2px_0_0_#000]" : "border-transparent bg-transparent"
                  }`}>
                    <Icon className="size-4" />
                  </div>
                  <span className={`font-bold text-sm ${isActive ? "text-black" : "text-black/70"}`}>{label}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 space-y-3 border-t-2 border-black">
          {/* Connection status */}
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-md border-2 border-black font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0_0_#000] ${
              online ? "bg-[#599D77] text-white" : "bg-destructive text-white"
            }`}
          >
            {online ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
            {online ? "Connected" : "Offline"}
          </div>

          {/* Stats */}
          <div className="space-y-1.5 px-1">
            {health?.simulationMode && (
              <div className="flex items-center gap-2 text-xs font-bold text-black border-2 border-black px-2 py-1.5 bg-secondary rounded-md shadow-[2px_2px_0_0_#000]">
                <Zap className="size-3.5 text-black" />
                <span>Simulation Mode</span>
                <span className="ml-auto font-black text-primary">ACTIVE</span>
              </div>
            )}
            {typeof health?.connectedClients === "number" && (
              <div className="flex items-center gap-2 text-xs font-bold text-black border-2 border-black px-2 py-1.5 bg-white rounded-md shadow-[2px_2px_0_0_#000]">
                <Activity className="size-3.5" />
                <span>SSE Streams</span>
                <span className="ml-auto font-black">{health.connectedClients}</span>
              </div>
            )}
          </div>

          {/* Settings link */}
          <NavLink
            to="/dashboard/settings"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider text-black border-2 border-transparent hover:border-black hover:bg-muted/30 hover:shadow-[2px_2px_0_0_#000] transition-all"
          >
            <Settings className="size-3.5" />
            Settings
          </NavLink>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-hidden relative bg-background">
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
