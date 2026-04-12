import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { CalendarEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Send,
  Mail,
  Linkedin,
  Phone,
  Building2,
  User,
  Clock,
  Loader2,
  Bot,
  X,
  Sparkles,
  ArrowRight,
  Target,
  Volume2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

/* ─── Helpers ─── */
function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function isToday(date: Date) {
  return isSameDay(date, new Date());
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function channelIcon(channel: string) {
  switch (channel) {
    case "linkedin_dm": return <Linkedin className="size-3" />;
    case "email": return <Mail className="size-3" />;
    case "whatsapp": return <Phone className="size-3" />;
    default: return <Send className="size-3" />;
  }
}

function channelColor(channel: string) {
  switch (channel) {
    case "linkedin_dm": return "bg-[#0A66C2] text-white";
    case "email": return "bg-[#8B5CF6] text-white";
    case "whatsapp": return "bg-[#25D366] text-white";
    default: return "bg-primary text-white";
  }
}

function tierColor(tier?: string) {
  switch (tier) {
    case "HOT": return "bg-[#EA435F] text-white";
    case "WARM": return "bg-[#F97316] text-white";
    case "COOL": return "bg-[#0EA5E9] text-white";
    case "COLD": return "bg-[#94A3B8] text-white";
    default: return "bg-muted text-black";
  }
}

/* ─── Chat Message Type ─── */
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/* ─── Main Calendar Page ─── */
export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm your outreach schedule assistant. Ask me about upcoming activities, specific dates, or lead follow-ups!",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Fetch calendar events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getCalendarEvents();
      setEvents(data.events);
    } catch (err) {
      console.error("Failed to fetch calendar events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Month navigation
  const goNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today);
  };

  // Calendar grid
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const prevMonthDays = getDaysInMonth(currentYear, currentMonth === 0 ? 11 : currentMonth - 1);

  // Events grouped by date string
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const d = new Date(ev.scheduledAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [events]);

  // Events for selected date
  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    return eventsByDate.get(key) || [];
  }, [selectedDate, eventsByDate]);

  // Build calendar cells
  const calendarCells = useMemo(() => {
    const cells: Array<{ date: Date; inMonth: boolean; events: CalendarEvent[] }> = [];

    // Previous month overflow
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, prevMonthDays - i);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      cells.push({ date: d, inMonth: false, events: eventsByDate.get(key) || [] });
    }

    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(currentYear, currentMonth, day);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      cells.push({ date: d, inMonth: true, events: eventsByDate.get(key) || [] });
    }

    // Next month overflow (fill to 6 rows = 42 cells)
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      cells.push({ date: d, inMonth: false, events: eventsByDate.get(key) || [] });
    }

    return cells;
  }, [currentYear, currentMonth, daysInMonth, firstDay, prevMonthDays, eventsByDate]);

  // Chat
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: chatInput.trim(),
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const data = await api.calendarChat(userMsg.content);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I couldn't process that. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Focus chat input when opened
  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => chatInputRef.current?.focus(), 200);
    }
  }, [chatOpen]);

  // Stats
  const totalEvents = events.length;
  const upcomingEvents = events.filter((e) => new Date(e.scheduledAt) >= today).length;
  const uniqueLeads = new Set(events.map((e) => e.leadId)).size;
  const channelBreakdown = events.reduce((acc, e) => {
    acc[e.channel] = (acc[e.channel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Top Bar ── */}
      <div className="shrink-0 px-5 py-3 border-b-2 border-black flex items-center gap-3 bg-white">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
            <ChevronLeft className="size-3" /> Back
          </Button>
        </Link>
        <div className="h-6 w-0.5 bg-black ml-2 mr-2" />
        <div className="flex items-center gap-2 border-2 border-black bg-white px-3 py-1 shadow-[2px_2px_0_0_#000]">
          <CalendarIcon className="size-4 text-black" />
          <span className="text-sm font-black uppercase">Outreach Calendar</span>
        </div>

        {/* Stats */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-black uppercase border-2 border-black px-2 py-0.5 bg-[#CEEBFC] shadow-[1px_1px_0_0_#000]">
            {totalEvents} Activities
          </span>
          <span className="text-[10px] font-black uppercase border-2 border-black px-2 py-0.5 bg-[#599D77] text-white shadow-[1px_1px_0_0_#000]">
            {upcomingEvents} Upcoming
          </span>
          <span className="text-[10px] font-black uppercase border-2 border-black px-2 py-0.5 bg-secondary shadow-[1px_1px_0_0_#000]">
            {uniqueLeads} Leads
          </span>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all" onClick={fetchEvents}>
            <RefreshCw className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Month Header */}
          <div className="shrink-0 px-6 py-4 border-b-2 border-black bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={goPrevMonth} className="h-9 w-9 p-0 border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                <ChevronLeft className="size-4" />
              </Button>
              <h2 className="text-xl font-black uppercase tracking-wider min-w-48 text-center">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <Button variant="ghost" size="sm" onClick={goNextMonth} className="h-9 w-9 p-0 border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={goToday} className="h-8 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                Today
              </Button>

              {/* Channel Legend */}
              <div className="flex items-center gap-1.5 ml-3">
                {Object.entries(channelBreakdown).map(([ch, count]) => (
                  <span key={ch} className={cn("text-[9px] font-black uppercase px-2 py-0.5 border-2 border-black shadow-[1px_1px_0_0_#000]", channelColor(ch))}>
                    {channelIcon(ch)} {ch.replace(/_/g, " ")} ({count})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Day Headers */}
          <div className="shrink-0 grid grid-cols-7 border-b-2 border-black bg-secondary">
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-center py-2 text-[10px] font-black uppercase tracking-widest border-r-2 border-black last:border-r-0">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-7 grid-rows-6 overflow-hidden">
              {calendarCells.map((cell, idx) => {
                const hasEvents = cell.events.length > 0;
                const isSelected = selectedDate && isSameDay(cell.date, selectedDate);
                const isTodayCell = isToday(cell.date);

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(cell.date)}
                    className={cn(
                      "relative border-r-2 border-b-2 border-black p-1.5 text-left transition-all overflow-hidden",
                      cell.inMonth ? "bg-white" : "bg-muted/30",
                      !!isSelected && "ring-4 ring-primary ring-inset bg-primary/5",
                      !isSelected && hasEvents && "hover:bg-[#CEEBFC]/30",
                      !isSelected && !hasEvents && "hover:bg-muted/10"
                    )}
                  >
                    {/* Day Number */}
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={cn(
                          "text-[11px] font-black w-6 h-6 flex items-center justify-center",
                          isTodayCell && "bg-primary text-white border-2 border-black shadow-[1px_1px_0_0_#000]",
                          !cell.inMonth && "text-muted-foreground/40",
                          !!isSelected && cell.inMonth && !isTodayCell && "text-primary"
                        )}
                      >
                        {cell.date.getDate()}
                      </span>
                      {hasEvents && (
                        <span className="text-[8px] font-black border border-black px-1 bg-[#FFDA5C] shadow-[1px_1px_0_0_#000]">
                          {cell.events.length}
                        </span>
                      )}
                    </div>

                    {/* Event Dots */}
                    <div className="space-y-0.5">
                      {cell.events.slice(0, 3).map((ev) => (
                        <div
                          key={ev.id}
                          className={cn(
                            "text-[7px] font-bold px-1 py-0.5 truncate border border-black leading-tight",
                            channelColor(ev.channel)
                          )}
                        >
                          {ev.contactName.split(" ")[0]} · T{ev.touchNumber}
                        </div>
                      ))}
                      {cell.events.length > 3 && (
                        <div className="text-[7px] font-black text-muted-foreground text-center">
                          +{cell.events.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right Panel: Selected Date Details ── */}
        <div className="w-80 border-l-2 border-black bg-white flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b-2 border-black bg-secondary">
            <h3 className="text-sm font-black uppercase tracking-wider">
              {selectedDate
                ? selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                : "Select a Date"}
            </h3>
            <p className="text-[10px] text-muted-foreground font-bold mt-0.5">
              {selectedEvents.length} {selectedEvents.length === 1 ? "activity" : "activities"} scheduled
            </p>
          </div>

          <div className="flex-1 overflow-auto p-3 space-y-2.5">
            <AnimatePresence mode="wait">
              {selectedEvents.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center px-4"
                >
                  <CalendarIcon className="size-10 text-muted-foreground/30 mb-3" />
                  <p className="text-xs font-bold text-muted-foreground">
                    {selectedDate ? "No activities on this day" : "Click a date to see details"}
                  </p>
                </motion.div>
              ) : (
                <motion.div key="events" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {selectedEvents.map((ev, i) => (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="border-2 border-black bg-white p-3 shadow-[2px_2px_0_0_#000] space-y-2"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <User className="size-3 shrink-0" />
                            <span className="text-[11px] font-black truncate">{ev.contactName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Building2 className="size-3 shrink-0 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground font-bold truncate">{ev.companyName}</span>
                          </div>
                          {ev.contactTitle && (
                            <span className="text-[9px] text-muted-foreground/70 font-mono">{ev.contactTitle}</span>
                          )}
                        </div>
                        <span className="text-[9px] font-black uppercase border-2 border-black px-1.5 py-0.5 bg-[#FFDA5C] shadow-[1px_1px_0_0_#000] shrink-0">
                          T{ev.touchNumber}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className={cn("flex items-center gap-1 text-[9px] font-bold px-1.5 py-1 border border-black", channelColor(ev.channel))}>
                          {channelIcon(ev.channel)}
                          {ev.channel.replace(/_/g, " ")}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-1 border border-black bg-white">
                          <Clock className="size-2.5" />
                          {new Date(ev.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-1 border border-black bg-white">
                          <Volume2 className="size-2.5" />
                          {ev.toneFramework.replace(/_/g, " ")}
                        </div>
                        {ev.tier && (
                          <div className={cn("flex items-center gap-1 text-[9px] font-bold px-1.5 py-1 border border-black", tierColor(ev.tier))}>
                            <Target className="size-2.5" />
                            {ev.tier} {ev.compositeScore ? `(${ev.compositeScore})` : ""}
                          </div>
                        )}
                      </div>

                      {/* Pipeline Link */}
                      <Link to={`/dashboard/pipeline/${ev.leadId}`} className="block">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary hover:underline cursor-pointer mt-1">
                          <ExternalLink className="size-2.5" /> View Pipeline
                          <ArrowRight className="size-2.5" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Chatbot FAB ── */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 right-6 size-14 bg-primary text-white border-3 border-black shadow-[4px_4px_0_0_#000] flex items-center justify-center hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all z-50"
          >
            <Bot className="size-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chatbot Panel ── */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] bg-white border-3 border-black shadow-[6px_6px_0_0_#000] flex flex-col z-50 overflow-hidden"
          >
            {/* Chat Header */}
            <div className="px-4 py-3 border-b-2 border-black bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center">
                  <Sparkles className="size-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase">Schedule Assistant</h4>
                  <p className="text-[9px] opacity-80 font-bold">AI-Powered · Llama 3.3 70B</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="size-7 border-2 border-white/30 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-auto p-3 space-y-3 bg-muted/10">
              {chatMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] px-3 py-2 text-[11px] leading-relaxed border-2 border-black shadow-[2px_2px_0_0_#000]",
                      msg.role === "user"
                        ? "bg-primary text-white"
                        : "bg-white text-black"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1 mb-1 text-[9px] font-black uppercase text-muted-foreground">
                        <Bot className="size-3" /> NERVE AI
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-black px-3 py-2 border-2 border-black shadow-[2px_2px_0_0_#000]">
                    <div className="flex items-center gap-2 text-[11px]">
                      <Loader2 className="size-3 animate-spin" />
                      <span className="font-bold">Thinking…</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t-2 border-black bg-white">
              <div className="flex gap-2">
                <input
                  ref={chatInputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  placeholder="Ask about your schedule…"
                  className="flex-1 h-9 px-3 text-xs font-bold border-2 border-black shadow-[2px_2px_0_0_#000] outline-none focus:shadow-[3px_3px_0_0_#000] transition-shadow placeholder:text-muted-foreground/50"
                  disabled={chatLoading}
                />
                <Button
                  size="sm"
                  onClick={sendChat}
                  disabled={!chatInput.trim() || chatLoading}
                  className="h-9 w-9 p-0 border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none bg-primary text-white"
                >
                  <Send className="size-3.5" />
                </Button>
              </div>
              {/* Quick Actions */}
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {["What's next?", "This week", "All leads"].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setChatInput(q); setTimeout(sendChat, 100); }}
                    className="text-[9px] font-bold px-2 py-1 border border-black bg-secondary hover:bg-muted transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
