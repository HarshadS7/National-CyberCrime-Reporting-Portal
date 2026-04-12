"use client";

import './landing.css';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Terminal, Database, GitBranch, Cpu, Mail, MessageCircle, Briefcase, Zap, Globe, Shield, Calendar } from 'lucide-react';

// --- Component: Navbar.tsx ---
function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  return (
    <motion.nav 
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-[#F5F2E8]/80 backdrop-blur-md shadow-sm border-b border-[#EDE9D8]/50' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#1A5C35] rounded-sm transform rotate-45 flex items-center justify-center">
            <div className="w-2 h-2 bg-[#F5F2E8] rounded-full" />
          </div>
          <span className="font-heading font-black text-xl text-[#1A1A18] tracking-tight ml-1">NERVE</span>
        </div>

        {/* LINKS */}
        <div className="hidden md:flex items-center gap-8 font-sans text-[0.85rem] text-[#6B6B62] font-medium">
          <a href="#platform" className="hover:text-[#1A5C35] transition-colors">Platform</a>
          <a href="#intelligence" className="hover:text-[#1A5C35] transition-colors">Intelligence</a>
          <a href="#integrations" className="hover:text-[#1A5C35] transition-colors">Integrations</a>
          <a href="#cta" className="hover:text-[#1A5C35] transition-colors">Early Access</a>
        </div>

        {/* CTA */}
        <div>
          <a href="#cta" className="inline-block bg-[#1A1A18] hover:bg-[#3E9B63] text-white font-sans text-[0.8rem] font-medium py-2.5 px-6 rounded-[4px] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
            Get Access
          </a>
        </div>
      </div>
    </motion.nav>
  );
}


// --- Component: HeroSection.tsx ---
const LiveLogs = [
  "Agent 10: Learning Loop initiated.",
  "Intent Score: 87/100 (High Fit).",
  "Agent 4: Mapped Persona to 'Strategic Exec'.",
  "Agent 5: Route to LinkedIn DM, 10am IST.",
  "Agent 2: Series B Signal appended.",
];

function HeroSection() {
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % LiveLogs.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen bg-cream pt-[10rem] px-[3rem] flex flex-col lg:flex-row relative overflow-hidden">
      
      {/* Background Decorative Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-deep blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-green-light blur-[120px]" />
      </div>

      <div className="max-w-[620px] flex-shrink-0 z-10 relative">
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-[0.5rem] bg-green-deep text-cream font-mono text-[0.68rem] tracking-[0.12em] py-[0.35rem] px-[0.85rem] rounded-[2px] mb-8 shadow-lg shadow-green-deep/20"
        >
          <span className="w-[6px] h-[6px] bg-green-light rounded-full animate-[pulse-dot_1.8s_ease-in-out_infinite]"></span>
          CortexReach · Autonomous Engine
        </motion.div>

        {/* Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="font-heading font-black text-[clamp(3.5rem,6vw,5.5rem)] leading-[1.05] text-ink mb-6"
        >
          AI that <em className="italic text-green-deep font-medium">decides,</em>
          <br />
          executes, watches,
          <br />
          and <em className="italic text-green-deep font-medium relative hover:animate-pulse">learns.</em>
        </motion.h1>

        {/* Description */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="font-sans text-[1.1rem] text-[#6B6B62] leading-[1.75] max-w-[500px] mb-10"
        >
          NERVE is a Mastra-native orchestration engine that reasons through real-time signals, executes complex multi-channel outreach, and continuously self-learns to compound your response rates automatically.
        </motion.p>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex gap-4 items-center"
        >
          <button className="bg-green-deep text-cream font-sans text-[0.95rem] font-medium py-[0.85rem] px-[2rem] rounded-[4px] hover:bg-green-mid hover:-translate-y-[2px] shadow-md hover:shadow-xl hover:shadow-green-deep/20 transition-all duration-300">
            Initialize Flywheel →
          </button>
          <button className="bg-transparent border border-green-deep/20 text-[#3A3A35] font-sans text-[0.9rem] py-[0.85rem] px-[2rem] rounded-[4px] cursor-pointer hover:border-green-deep hover:text-green-deep hover:bg-green-deep/5 transition-all duration-300">
            View the 10 Agents
          </button>
        </motion.div>

        {/* Live Theater Logger (Mini) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-12 flex items-center gap-3 border border-dark-card/10 bg-dark-card/5 px-4 py-2.5 rounded-md font-mono text-[0.7rem] text-green-deep max-w-[420px]"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green-accent animate-pulse shrink-0" />
          <div className="w-full relative h-[1.2em] overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={logIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-0 whitespace-nowrap"
              >
                Output trace: {LiveLogs[logIndex]}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </section>
  );
}


// --- Component: AgentGraphCard.tsx ---
function AgentGraphCard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-[480px] h-[520px] bg-[#0E0E0C] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-6 shadow-2xl relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#7BC49A] animate-[pulse-dot_1.8s_ease-in-out_infinite]" />
          <span className="font-mono text-[0.65rem] text-[#7BC49A] uppercase tracking-wider">Live Agent Trace</span>
        </div>
        <span className="font-mono text-[0.65rem] text-[rgba(255,255,255,0.3)]">ID: #CORTEX-9X2</span>
      </div>

      {/* Graph Area */}
      <div className="relative w-full h-[85%] border border-[rgba(255,255,255,0.04)] rounded-[8px] bg-[radial-gradient(ellipse_at_center,_rgba(26,92,53,0.15)_0%,_transparent_70%)] flex items-center justify-center">
        
        {/* Background Grid */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: `24px 24px`
          }}
        />

        {/* Nodes */}
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
          className="absolute top-8 left-12 w-28 p-2 bg-[#1A1A18] border border-[#3E9B63]/30 rounded-md z-10"
        >
          <div className="font-mono text-[0.55rem] text-[#3E9B63] mb-1">DATA LAYER</div>
          <div className="font-sans text-[0.7rem] text-white">Ingestion Agent</div>
        </motion.div>

        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 p-3 bg-[#1A5C35] border border-[#7BC49A]/50 rounded-lg shadow-[0_0_20px_rgba(62,155,99,0.3)] z-20"
        >
          <div className="font-mono text-[0.55rem] text-[#7BC49A] mb-1">CORE LOGIC</div>
          <div className="font-sans text-[0.75rem] text-white font-medium">Strategy & Decide</div>
        </motion.div>

        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 }}
          className="absolute bottom-16 right-12 w-28 p-2 bg-[#1A1A18] border border-[#3E9B63]/30 rounded-md z-10"
        >
          <div className="font-mono text-[0.55rem] text-[#6B8EF0] mb-1">EXECUTION</div>
          <div className="font-sans text-[0.7rem] text-white">Delivery Agent</div>
        </motion.div>

        {/* Neural Links (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <motion.path 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            d="M 120 60 C 180 60, 200 200, 240 200" 
            fill="none" stroke="rgba(62,155,99,0.4)" strokeWidth="1.5" strokeDasharray="4 4" 
          />
          <motion.path 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 1 }}
            d="M 240 200 C 280 200, 320 380, 370 380" 
            fill="none" stroke="rgba(62,155,99,0.4)" strokeWidth="1.5" strokeDasharray="4 4" 
          />
        </svg>

        {/* Floating Data Packets */}
        <motion.div 
          animate={{ x: [120, 240], y: [60, 200], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1.5 }}
          className="absolute top-0 left-0 w-1.5 h-1.5 bg-[#7BC49A] rounded-full shadow-[0_0_8px_#7BC49A]"
        />
        <motion.div 
          animate={{ x: [240, 370], y: [200, 380], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 2.5 }}
          className="absolute top-0 left-0 w-1.5 h-1.5 bg-[#6B8EF0] rounded-full shadow-[0_0_8px_#6B8EF0]"
        />
      </div>
    </motion.div>
  );
}


// --- Component: HowItWorks.tsx ---
type HowCardProps = {
  title: string;
  description: string;
  visual: 'ingest' | 'decide' | 'learn';
  index: number;
};

function HowCard({ title, description, visual, index }: HowCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: 0.2 + (index * 0.15) }}
      className="bg-[#f7fddb] rounded-[10px] p-6 flex flex-col relative z-10 h-full shadow-lg border border-[rgba(62,155,99,0.1)]"
    >
      <h3 className="font-heading text-[1.25rem] font-bold text-ink mb-[0.6rem]">{title}</h3>
      <p className="font-sans text-[0.83rem] text-[#6B6B62] leading-[1.65] mb-5 flex-1 p-0 m-0 pb-5">
        {description}
      </p>
      
      <div className="bg-green-deep rounded-[6px] min-h-[130px] flex items-center justify-center overflow-hidden relative">
        {visual === 'ingest' && (
          <svg viewBox="0 0 200 130" width="100%" height="100%" className="opacity-60 stroke-white text-white">
            <line x1="20" y1="30" x2="180" y2="30" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="20" y1="50" x2="180" y2="50" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="20" y1="70" x2="180" y2="70" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="20" y1="90" x2="180" y2="90" strokeWidth="1" strokeDasharray="4 4" />
            
            <circle cx="50" cy="30" r="3" fill="white" />
            <circle cx="100" cy="50" r="3" fill="white" />
            <circle cx="150" cy="70" r="3" fill="white" />
            <circle cx="80" cy="90" r="3" fill="white" />
            
            <text x="100" y="115" textAnchor="middle" className="font-mono text-[8px]" fill="white" stroke="none">
              CSV · Apollo · CRM
            </text>
          </svg>
        )}
        
        {visual === 'decide' && (
          <svg viewBox="0 0 200 130" width="100%" height="100%" className="opacity-60 stroke-white text-white">
            <circle cx="100" cy="75" r="20" fill="none" strokeWidth="1.5" />
            <text x="100" y="80" textAnchor="middle" className="font-mono text-[6px]" fill="white" stroke="none">STRATEGY</text>
            
            <line x1="100" y1="35" x2="100" y2="55" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="100" cy="23" r="12" fill="none" strokeWidth="1" />
            <text x="100" y="25" textAnchor="middle" className="font-mono text-[5px]" fill="white" stroke="none">SIGNAL</text>
            
            <line x1="130" y1="90" x2="115" y2="83" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="145" cy="98" r="12" fill="none" strokeWidth="1" />
            <text x="145" y="100" textAnchor="middle" className="font-mono text-[5px]" fill="white" stroke="none">INTENT</text>
            
            <line x1="70" y1="90" x2="85" y2="83" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="55" cy="98" r="12" fill="none" strokeWidth="1" />
            <text x="55" y="100" textAnchor="middle" className="font-mono text-[5px]" fill="white" stroke="none">PERSONA</text>
          </svg>
        )}
        
        {visual === 'learn' && (
          <svg viewBox="0 0 200 130" width="100%" height="100%" className="opacity-60 stroke-white text-white">
            <line x1="30" y1="100" x2="170" y2="100" strokeWidth="1" />
            <line x1="30" y1="20" x2="30" y2="100" strokeWidth="1" />
            
            <path d="M 30 90 Q 80 80 110 50 T 170 30" fill="none" strokeWidth="1.5" />
            <circle cx="170" cy="30" r="3" fill="white" />
            
            <rect x="140" y="10" width="28" height="12" rx="2" fill="rgba(255,255,255,0.2)" stroke="none" />
            <text x="154" y="19" textAnchor="middle" className="font-mono text-[7px]" fill="white" stroke="none">+18%</text>
          </svg>
        )}
      </div>
    </motion.div>
  );
}

function HowItWorks() {
  return (
    <section id="platform" className="bg-cream py-24 px-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="font-mono text-[0.68rem] text-green-deep uppercase tracking-[0.15em] mb-4">
          How It Works
        </div>
        <h2 className="font-heading font-bold text-[clamp(2rem,4vw,3rem)] text-ink mb-12 leading-[1.1]">
          Here's how easy
          <br />
          it works at NERVE
        </h2>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-green-deep rounded-[16px] p-10 relative overflow-hidden shadow-2xl"
      >
        <div 
          className="absolute inset-0 pointer-events-none rounded-[16px]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 7px, rgba(0,0,0,0.025) 7px, rgba(0,0,0,0.025) 8px),
              repeating-linear-gradient(90deg, transparent, transparent 7px, rgba(0,0,0,0.025) 7px, rgba(0,0,0,0.025) 8px)
            `
          }}
        />

        <div 
          className="absolute top-0 left-0 right-0 h-[35%] pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(123,175,196,0.25), transparent)'
          }}
        />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          <HowCard 
            title="Ingest in seconds"
            description="Drop a CSV, paste an Apollo export, or connect your CRM. NERVE validates, enriches, and deduplicates before anything fires."
            visual="ingest"
            index={0}
          />
          <HowCard 
            title="Decide in parallel"
            description="Signal Scout, Intent Scorer, and Persona Analyst fire simultaneously. Strategy Commander synthesises channel, timing, and tone."
            visual="decide"
            index={1}
          />
          <HowCard 
            title="Learn and compound"
            description="Every response updates the model. Signals that correlate with replies gain weight. Every new lead runs against a smarter engine."
            visual="learn"
            index={2}
          />
        </div>
      </motion.div>
    </section>
  );
}


// --- Component: OutreachPanel.tsx ---
type RowData = {
  status: string;
  statusDot: string;
  email: string;
  channel: string;
  rowBg?: string;
  isFaded?: boolean;
};

function OutreachPanel() {
  const rows: RowData[] = [
    {
      status: 'Sent',
      statusDot: 'bg-[#3E9B63]',
      email: 'rahul@acme.in',
      channel: 'LinkedIn DM',
    },
    {
      status: 'Sent',
      statusDot: 'bg-[#3E9B63]',
      email: 'priya@scale.io',
      channel: 'Email',
    },
    {
      status: 'Live',
      statusDot: 'bg-[#6B8EF0]',
      email: 'arjun@velo.com',
      channel: 'WhatsApp',
      rowBg: 'bg-[rgba(107,142,240,0.07)]',
    },
    {
      status: 'Queued',
      statusDot: 'bg-[rgba(255,255,255,0.2)]',
      email: 'neha@fin.ai',
      channel: 'LinkedIn DM',
      isFaded: true,
    },
  ];

  return (
    <div className="bg-[#F5F2E8] border border-[#EDE9D8] rounded-[12px] p-10">
      {/* Feature Tag */}
      <div className="flex gap-[0.4rem] items-center text-[#1A5C35] font-mono text-[0.65rem] uppercase tracking-[0.1em] mb-4">
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>Multi-channel delivery</span>
      </div>

      {/* Heading */}
      <h3 className="font-heading font-bold text-[1.5rem] leading-[1.25] text-[#1A1A18] mb-8">
        Advanced delivery engine,
        <br />
        reaches every lead everywhere.
      </h3>

      {/* Table Mockup */}
      <div className="bg-[#0E0E0C] border border-[rgba(255,255,255,0.08)] rounded-[8px] overflow-hidden relative flex flex-col">
        
        {/* Header Block */}
        <div className="py-3 px-4 border-b border-[rgba(255,255,255,0.06)]">
          <div className="font-sans font-medium text-[0.85rem] text-white">Outreach Activity</div>
          <div className="font-sans text-[0.68rem] text-[rgba(255,255,255,0.3)]">Manage your campaigns.</div>
        </div>

        {/* Filter Row */}
        <div className="py-2 px-4 flex justify-between border-b border-[rgba(255,255,255,0.06)] bg-black/20">
          <input
            type="text"
            readOnly
            value="Filter by channel..."
            className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-[4px] px-[0.6rem] py-[0.3rem] font-sans text-[0.7rem] text-[rgba(255,255,255,0.35)] w-[160px] outline-none"
          />
          <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-[4px] px-[0.6rem] py-[0.3rem] font-sans text-[0.7rem] text-[rgba(255,255,255,0.35)] cursor-pointer">
            Columns ▾
          </button>
        </div>

        {/* Table Area */}
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="font-sans text-[0.68rem] text-[rgba(255,255,255,0.3)] px-4 py-2 text-left font-normal border-b border-[rgba(255,255,255,0.06)]">
                Status
              </th>
              <th className="font-sans text-[0.68rem] text-[rgba(255,255,255,0.3)] px-4 py-2 text-left font-normal border-b border-[rgba(255,255,255,0.06)]">
                Lead
              </th>
              <th className="font-sans text-[0.68rem] text-[rgba(255,255,255,0.3)] px-4 py-2 text-left font-normal border-b border-[rgba(255,255,255,0.06)]">
                Channel
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className={row.rowBg || ''}>
                <td className={`font-sans text-[0.73rem] px-4 py-[0.55rem] border-b border-[rgba(255,255,255,0.03)] ${row.isFaded ? 'text-[rgba(255,255,255,0.25)]' : 'text-[rgba(255,255,255,0.6)]'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-[6px] h-[6px] rounded-full ${row.statusDot}`}></span>
                    {row.status}
                  </div>
                </td>
                <td className={`font-sans text-[0.73rem] px-4 py-[0.55rem] border-b border-[rgba(255,255,255,0.03)] ${row.isFaded ? 'text-[rgba(255,255,255,0.25)]' : 'text-[rgba(255,255,255,0.6)]'}`}>
                  {row.email}
                </td>
                <td className={`font-sans text-[0.73rem] px-4 py-[0.55rem] border-b border-[rgba(255,255,255,0.03)] ${row.isFaded ? 'text-[rgba(255,255,255,0.25)]' : 'text-[rgba(255,255,255,0.6)]'}`}>
                  {row.channel}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bottom Decorative Gradient */}
        <div className="h-[40px] bg-gradient-to-t from-[rgba(20,80,200,0.25)] to-transparent pointer-events-none mt-auto" />
      </div>
    </div>
  );
}


// --- Component: SchedulingPanel.tsx ---
type DateCell = {
  value: string;
  isMuted?: boolean;
  isSelected?: boolean;
};

type TimeSlot = {
  time: string;
  isSelected?: boolean;
};

function SchedulingPanel() {
  const dates: DateCell[] = [
    { value: '27', isMuted: true }, { value: '28', isMuted: true }, { value: '1' },
    { value: '5' }, { value: '6' }, { value: '7' },
    { value: '12' }, { value: '13' }, { value: '14' },
    { value: '19' }, { value: '20', isSelected: true }, { value: '21' },
    { value: '26' }, { value: '27', isMuted: true }, { value: '28', isMuted: true },
  ];

  const timeSlots: TimeSlot[] = [
    { time: '09:00' },
    { time: '09:30' },
    { time: '10:00', isSelected: true },
    { time: '10:30', isSelected: true },
    { time: '11:00' },
    { time: '11:30' },
    { time: '12:00' },
  ];

  return (
    <div className="bg-[#F5F2E8] border border-[#EDE9D8] rounded-[12px] p-10">
      {/* Feature Tag */}
      <div className="flex gap-[0.4rem] items-center text-[#1A5C35] font-mono text-[0.65rem] uppercase tracking-[0.1em] mb-6">
        <Calendar className="w-3.5 h-3.5" />
        <span>Precision scheduling</span>
      </div>

      {/* Heading */}
      <h3 className="font-heading font-bold text-[1.5rem] leading-[1.25] text-[#1A1A18] mb-8">
        Timezone-aware scheduling,
        <br />
        always at peak open times.
      </h3>

      {/* Calendar Area */}
      <div className="flex gap-3">
        {/* Left Sub-block: Calendar */}
        <div className="flex-1 bg-[#0E0E0C] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-3">
          <div className="flex justify-end mb-2 text-[0.75rem] text-[rgba(255,255,255,0.4)] font-sans cursor-pointer hover:text-white transition-colors">
            ›
          </div>
          
          <div className="grid grid-cols-3 mb-[0.3rem]">
            <div className="font-sans text-[0.65rem] text-[rgba(255,255,255,0.25)] text-center">Th</div>
            <div className="font-sans text-[0.65rem] text-[rgba(255,255,255,0.25)] text-center">Fr</div>
            <div className="font-sans text-[0.65rem] text-[rgba(255,255,255,0.25)] text-center">Sa</div>
          </div>
          
          <div className="grid grid-cols-3 gap-y-1 gap-x-1">
            {dates.map((d, i) => {
              let classes = "font-sans text-[0.7rem] text-center p-[0.25rem] rounded-[4px] ";
              if (d.isSelected) {
                classes += "bg-[rgba(255,255,255,0.1)] text-white font-medium ";
              } else if (d.isMuted) {
                classes += "text-[rgba(255,255,255,0.2)] ";
              } else {
                classes += "text-[rgba(255,255,255,0.45)] ";
              }
              
              return (
                <div key={i} className={classes}>
                  {d.value}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sub-block: Timeslots */}
        <div className="flex-1 bg-[#0E0E0C] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-3 flex flex-col gap-[0.3rem]">
          <div className="font-mono text-[0.68rem] font-medium text-[rgba(255,255,255,0.5)] mb-[0.5rem]">
            Tue, 20 — IST
          </div>
          
          {timeSlots.map((ts, i) => (
            <div 
              key={i} 
              className={`font-mono text-[0.7rem] text-center py-[0.35rem] px-[0.75rem] rounded-[5px] whitespace-nowrap border ${
                ts.isSelected 
                  ? 'bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.2)] text-white' 
                  : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.45)]'
              }`}
            >
              {ts.time}
            </div>
          ))}
        </div>
      </div>

      {/* Post-block: Touch-stages */}
      <div className="flex flex-row gap-[0.75rem] mt-4">
        {/* Touch 1 */}
        <div className="flex-1 bg-[#f7fddb] border border-[#EDE9D8] rounded-[8px] px-4 py-3 text-center">
          <div className="w-[36px] h-[36px] border-[1.5px] border-[#EDE9D8] rounded-full mx-auto flex items-center justify-center mb-2 text-[#6B6B62] font-mono text-[0.7rem]">
            1
          </div>
          <div className="font-sans text-[0.7rem] text-[#6B6B62]">Touch 1</div>
        </div>
        
        {/* Touch 2 */}
        <div className="flex-1 bg-[#f7fddb] border border-[#EDE9D8] rounded-[8px] px-4 py-3 text-center">
          <div className="w-[36px] h-[36px] border-[1.5px] border-[#EDE9D8] rounded-full mx-auto flex items-center justify-center mb-2 text-[#6B6B62] font-mono text-[0.7rem]">
            2
          </div>
          <div className="font-sans text-[0.7rem] text-[#6B6B62]">Touch 2</div>
        </div>
        
        {/* Active Session */}
        <div className="flex-1 bg-[#f7fddb] border border-[#EDE9D8] rounded-[8px] px-4 py-3 text-center">
          <div className="w-[36px] h-[36px] border-[1.5px] border-[#3E9B63] bg-[rgba(62,155,99,0.08)] rounded-full mx-auto flex items-center justify-center mb-2 text-[#1A5C35] font-mono text-[0.7rem] shadow-[0_0_8px_rgba(62,155,99,0.2)]">
            3
          </div>
          <div className="font-sans text-[0.7rem] text-[#1A5C35] font-medium">Active</div>
        </div>
        
        {/* Closed */}
        <div className="flex-1 bg-[#f7fddb] border border-[#EDE9D8] rounded-[8px] px-4 py-3 text-center text-[#B4B2A9]">
          <div className="w-[36px] h-[36px] border-[1.5px] border-[#EDE9D8] rounded-full mx-auto flex items-center justify-center mb-2 text-[#B4B2A9] font-mono text-[0.7rem] opacity-70">
            x
          </div>
          <div className="font-sans text-[0.7rem] text-[#B4B2A9]">Closed</div>
        </div>
      </div>
    </div>
  );
}


// --- Component: FeaturePanels.tsx ---
function FeaturePanels() {
  return (
    <section className="bg-cream py-[6rem] px-[3rem] grid grid-cols-1 lg:grid-cols-2 gap-[1rem]">
      <OutreachPanel />
      <SchedulingPanel />
    </section>
  );
}


// --- Component: AgentsGrid.tsx ---
type AgentStatus = 'active' | 'idle';

interface AgentCardProps {
  num: string;
  name: string;
  desc: string;
  status: AgentStatus;
  index: number;
}

function AgentCard({ num, name, desc, status, index }: AgentCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className="bg-[#f7fddb] border border-[#EDE9D8] rounded-[10px] py-[1.25rem] px-[1.5rem] flex items-start gap-[1rem] hover:border-[rgba(62,155,99,0.3)] hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="font-mono text-[0.65rem] text-[#3E9B63] min-w-[28px] pt-[0.1rem]">
        {num}
      </div>
      
      <div className="flex-1">
        <h4 className="font-sans text-[0.9rem] font-medium text-[#1A1A18] mb-[0.35rem]">
          {name}
        </h4>
        <p className="font-sans text-[0.77rem] text-[#6B6B62] leading-[1.6]">
          {desc}
        </p>
      </div>

      <div 
        className={`w-[7px] h-[7px] rounded-full mt-[0.35rem] shrink-0 ${
          status === 'active' 
            ? 'bg-[#3E9B63] shadow-[0_0_6px_rgba(62,155,99,0.5)]' 
            : 'bg-[#D3D1C7]'
        }`}
      />
    </motion.div>
  );
}

function AgentsGrid() {
  const agents: Omit<AgentCardProps, 'index'>[] = [
    { num: 'A01', name: 'Lead Ingestion Agent', desc: 'Accepts CSV, Apollo exports, manual input, or CRM webhooks. Enriches and deduplicates before passing downstream.', status: 'active' },
    { num: 'A02', name: 'Signal Scout', desc: 'Funding rounds, product launches, executive hires, and LinkedIn activity in the past 30 days. Outputs a ranked signal vector.', status: 'active' },
    { num: 'A03', name: 'Intent Scorer', desc: '0–100 composite score across ICP fit, seniority, geography, and signal recency. Full attribution breakdown included.', status: 'active' },
    { num: 'A04', name: 'Persona Analyst', desc: 'Maps title and LinkedIn style to one of four archetypes: Strategic Executive, Practitioner, Innovator, or Networker.', status: 'idle' },
    { num: 'A05', name: 'Strategy Commander', desc: 'Selects channel, send timestamp, tone, and 3-touch cadence. Every decision logged for the Explainer Agent.', status: 'idle' },
    { num: 'A06', name: 'Content Forge', desc: 'Generates all three touches per channel. Injects live signals into Touch 1. Powered by Claude Sonnet.', status: 'idle' },
    { num: 'A07', name: 'Explainer Agent', desc: 'Converts every decision trace into plain-English rationale for the Decision Theatre panel.', status: 'idle' },
    { num: 'A08', name: 'Delivery Agent', desc: 'Sends via HeyReach (LinkedIn), Aisensy (WhatsApp), and Resend (email) with exponential backoff retry.', status: 'idle' },
    { num: 'A09', name: 'Response Monitor', desc: 'Classifies incoming events as positive, neutral, negative, or no-reply using NLP sentiment analysis.', status: 'idle' },
    { num: 'A10', name: 'Learning Loop Agent', desc: 'Updates Intent Scorer weights, channel heuristics, and tone rules after every response. The engine improves with every lead.', status: 'idle' },
  ];

  return (
    <section id="intelligence" className="bg-[#F5F2E8] py-24 px-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="font-mono text-[0.68rem] text-[#1A5C35] uppercase tracking-[0.15em] mb-4">
          The Engine
        </div>
        
        <h2 className="font-heading font-bold text-[clamp(2rem,4vw,3rem)] text-[#1A1A18] leading-[1.1]">
          10 agents. One
          <br />
          <span className="italic text-[#1A5C35]">compounding flywheel.</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[0.75rem] mt-[2.5rem]">
        {agents.map((ag, idx) => (
          <AgentCard key={ag.num} {...ag} index={idx} />
        ))}
      </div>
    </section>
  );
}


// --- Component: IntegrationsGrid.tsx ---
function IntegrationsGrid() {
  const integrations = [
    { name: "Salesforce", icon: <Database className="w-6 h-6" />, category: "CRM" },
    { name: "HubSpot", icon: <Globe className="w-6 h-6" />, category: "CRM" },
    { name: "LinkedIn", icon: <Briefcase className="w-6 h-6" />, category: "Channel" },
    { name: "Apollo", icon: <Zap className="w-6 h-6" />, category: "Data" },
    { name: "Gmail/Outlook", icon: <Mail className="w-6 h-6" />, category: "Email" },
    { name: "WhatsApp", icon: <MessageCircle className="w-6 h-6" />, category: "Channel" },
    { name: "Clearbit", icon: <Shield className="w-6 h-6" />, category: "Enrichment" },
    { name: "Calendly", icon: <Calendar className="w-6 h-6" />, category: "Scheduling" },
  ];

  return (
    <section className="bg-[#F5F2E8] py-24 px-12 border-t border-b border-[#EDE9D8]/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block font-mono text-[0.68rem] text-[#1A5C35] uppercase tracking-[0.15em] mb-4">
            Ecosystem
          </div>
          <h2 className="font-heading font-bold text-[clamp(2rem,4vw,3rem)] text-[#1A1A18] leading-[1.1]">
            Native connectivity.
            <br />
            <span className="text-[#6B6B62] font-normal">Zero configuration required.</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {integrations.map((int, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -4, borderColor: "rgba(62,155,99,0.3)" }}
              className="bg-[#f7fddb] border border-[#EDE9D8] rounded-[10px] p-6 flex flex-col items-center justify-center text-center gap-4 transition-colors cursor-pointer group shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-[#F5F2E8] flex items-center justify-center text-[#1A1A18] group-hover:text-[#1A5C35] group-hover:bg-[#1A5C35]/10 transition-colors">
                {int.icon}
              </div>
              <div>
                <h4 className="font-sans text-[0.95rem] font-medium text-[#1A1A18]">{int.name}</h4>
                <div className="font-mono text-[0.65rem] text-[#6B6B62] uppercase tracking-widest mt-1">{int.category}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


// --- Component: DeveloperExperience.tsx ---
const codeSnippet = `import { Agent } from '@mastra/core';

// Agent 02: Signal Scout
export const signalScout = new Agent({
  name: 'Signal Scout',
  role: 'Analyzes live triggers across 30+ sources',
  model: 'claude-3-5-sonnet-20241022',
  memory: true,
  tools: [
    signalTools.searchCrunchbase,
    signalTools.scrapeLinkedInActivity,
    signalTools.checkProductLaunches
  ],
  systemPrompt: \`
    Analyze inputs for recent positive signals.
    Output a structured signal vector with a 
    recency decay weight. Pass directly to MemoryStore.
  \`
});`;

function DeveloperExperience() {
  return (
    <section className="bg-cream py-32 px-12 relative overflow-hidden border-t border-[#EDE9D8]/50">
      
      {/* Decorative Blur */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-light rounded-full blur-[120px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
        
        {/* Left: Code Terminal */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex-1 w-full"
        >
          <div className="border border-[#EDE9D8] bg-[#0E0E0C] rounded-xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(26,92,53,0.15)] relative">
            {/* Terminal Header */}
            <div className="flex items-center px-4 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[#1A1A18]">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <div className="ml-4 font-mono text-[0.7rem] text-[rgba(255,255,255,0.4)] tracking-wide">
                agents/signalScout.ts
              </div>
            </div>
            {/* Terminal Body */}
            <div className="p-6 overflow-x-auto">
              <pre className="font-mono text-[0.8rem] leading-[1.6]">
                <code>
                  {codeSnippet.split('\n').map((line, i) => (
                    <div key={i} className="table-row">
                      <span className="table-cell pr-6 text-[rgba(255,255,255,0.2)] select-none text-right">
                        {i + 1}
                      </span>
                      <span className="table-cell text-[rgba(255,255,255,0.75)]" dangerouslySetInnerHTML={{
                          __html: line
                            .replace(/import|export|const|new|true/g, '<span class="text-[#6B8EF0]">$&</span>')
                            .replace(/'[^']*'/g, '<span class="text-[#7BC49A]">$&</span>')
                            .replace(/\/\/.*/g, '<span class="text-[#6B6B62]">$&</span>')
                            .replace(/Agent/g, '<span class="text-[#FFBD2E]">Agent</span>')
                        }} 
                      />
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </motion.div>

        {/* Right: Text & Features */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex-1"
        >
          <div className="inline-block font-mono text-[0.68rem] text-white bg-green-deep uppercase tracking-[0.15em] mb-6 px-3 py-1.5 rounded-[4px] shadow-sm">
            Mastra-Native Architecture
          </div>
          
          <h2 className="font-heading font-black text-[clamp(2rem,3vw,2.5rem)] text-ink leading-[1.1] mb-6">
            Built for developers. <br />
            Configured in code.
          </h2>
          
          <p className="font-sans text-[0.95rem] text-[#6B6B62] leading-[1.75] mb-10 max-w-[480px]">
            Everything in NERVE is explicitly defined in your codebase using the Mastra framework. No visual builders or hidden prompt chaining. Own your agent state, define tools natively, and store every decision trace cleanly in your Postgres MemoryStore.
          </p>

          <div className="flex flex-col gap-5">
            <div className="flex lg:items-center gap-4 bg-[#f7fddb] border border-[#EDE9D8] px-5 py-4 rounded-[10px]">
              <div className="w-10 h-10 rounded-full bg-cream border border-[#EDE9D8] flex items-center justify-center shrink-0 shadow-sm">
                <Terminal className="w-4 h-4 text-green-deep" />
              </div>
              <div>
                <h4 className="font-sans font-medium text-[0.95rem] text-ink mb-1">Full TypeScript Control</h4>
                <p className="font-sans text-[0.8rem] text-[#6B6B62]">Every orchestrator, tool, and system prompt is fully typed natively.</p>
              </div>
            </div>

            <div className="flex lg:items-center gap-4 bg-[#f7fddb] border border-[#EDE9D8] px-5 py-4 rounded-[10px]">
              <div className="w-10 h-10 rounded-full bg-cream border border-[#EDE9D8] flex items-center justify-center shrink-0 shadow-sm">
                <GitBranch className="w-4 h-4 text-green-deep" />
              </div>
              <div>
                <h4 className="font-sans font-medium text-[0.95rem] text-ink mb-1">Workflow Logic Graphs</h4>
                <p className="font-sans text-[0.8rem] text-[#6B6B62]">String agents together with rigid dependencies using Core Workflows.</p>
              </div>
            </div>

            <div className="flex lg:items-center gap-4 bg-[#f7fddb] border border-[#EDE9D8] px-5 py-4 rounded-[10px]">
              <div className="w-10 h-10 rounded-full bg-cream border border-[#EDE9D8] flex items-center justify-center shrink-0 shadow-sm">
                <Database className="w-4 h-4 text-green-deep" />
              </div>
              <div>
                <h4 className="font-sans font-medium text-[0.95rem] text-ink mb-1">Shared MemoryStore</h4>
                <p className="font-sans text-[0.8rem] text-[#6B6B62]">Agents operate on unified, vetted intelligence, limiting hallucination.</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}


// --- Component: LearningLoop.tsx ---
interface WeightItemProps {
  label: string;
  value: number;
  max: number;
}

function WeightItem({ label, value, max }: WeightItemProps) {
  const [currentWidth, setCurrentWidth] = useState(0);

  useEffect(() => {
    // Mount animation for the progress bar
    const timeout = setTimeout(() => {
      setCurrentWidth((value / max) * 100);
    }, 150);
    return () => clearTimeout(timeout);
  }, [value, max]);

  return (
    <div className="flex flex-row items-center gap-[0.75rem] px-[1rem] py-[0.65rem] bg-[#f7fddb] border border-[#EDE9D8] rounded-[6px]">
      <div className="font-sans text-[0.77rem] text-[#6B6B62] flex-1">
        {label}
      </div>
      <div className="w-[100px] h-[3px] bg-[#EDE9D8] rounded-[2px] overflow-hidden">
        <div 
          className="h-full bg-[#3E9B63] rounded-[2px] transition-all duration-1000 ease-out" 
          style={{ width: `${currentWidth}%` }} 
        />
      </div>
      <div className="font-mono text-[0.7rem] text-[#1A5C35] min-w-[32px] text-right">
        {value}
      </div>
    </div>
  );
}

function LearningLoop() {
  const weights: WeightItemProps[] = [
    { label: "Series B signal weight", value: 55, max: 100 },
    { label: "LinkedIn activity recency", value: 48, max: 100 },
    { label: "Challenger tone · exec", value: 66, max: 100 },
    { label: "Tuesday 10am IST", value: 71, max: 100 },
  ];

  return (
    <section className="bg-[#F5F2E8] py-24 px-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        
        {/* LEFT COLUMN */}
        <div>
          <div className="font-mono text-[0.68rem] text-[#1A5C35] uppercase tracking-[0.15em] mb-4">
            The Flywheel
          </div>
          
          <h2 className="font-heading font-bold text-[clamp(2.5rem,4vw,3.5rem)] text-[#1A1A18] leading-[1.1] mb-5">
            Gets smarter
            <br />
            every send.
          </h2>
          
          <p className="font-sans text-[0.95rem] text-[#6B6B62] leading-[1.75] max-w-[460px] mb-8">
            After every response event, Agent 10 updates the model. Signals that correlate with replies gain weight. The next lead runs against a better engine.
          </p>
          
          <div className="flex flex-col gap-[0.6rem]">
            {weights.map((w, idx) => (
              <WeightItem key={idx} {...w} />
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex justify-center items-center">
          <div className="w-[320px] h-[320px] rounded-full border border-[rgba(62,155,99,0.2)] relative flex items-center justify-center mx-auto">
            
            {/* Inner Ring */}
            <div className="absolute inset-[20px] rounded-full border border-[rgba(62,155,99,0.1)] pointer-events-none" />

            {/* Center Content */}
            <div className="text-center">
              <div className="font-heading font-bold text-[2.5rem] text-[#7BC49A] leading-none mb-1">
                ∞
              </div>
              <div className="font-sans text-[0.73rem] text-[#6B6B62] leading-tight">
                Compounding
                <br />
                intelligence
              </div>
            </div>

            {/* Loop Nodes */}
            <div className="absolute -top-[30px] left-1/2 -translate-x-1/2 w-[60px] h-[60px] bg-[#F5F2E8] border border-[rgba(62,155,99,0.4)] rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(62,155,99,0.1)]">
              <div className="font-mono text-[0.6rem] text-[#1A5C35] uppercase tracking-[0.05em] text-center leading-[1.3] pt-[0.1rem]">
                LEAD<br/>IN
              </div>
            </div>

            <div className="absolute -right-[30px] top-1/2 -translate-y-1/2 w-[60px] h-[60px] bg-[#F5F2E8] border border-[rgba(62,155,99,0.4)] rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(62,155,99,0.1)]">
              <div className="font-mono text-[0.6rem] text-[#1A5C35] uppercase tracking-[0.05em] text-center leading-[1.3] pt-[0.1rem]">
                SEND
              </div>
            </div>

            <div className="absolute -bottom-[30px] left-1/2 -translate-x-1/2 w-[60px] h-[60px] bg-[#F5F2E8] border border-[rgba(62,155,99,0.4)] rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(62,155,99,0.1)]">
              <div className="font-mono text-[0.6rem] text-[#1A5C35] uppercase tracking-[0.05em] text-center leading-[1.3] pt-[0.1rem]">
                RESPOND
              </div>
            </div>

            <div className="absolute -left-[30px] top-1/2 -translate-y-1/2 w-[60px] h-[60px] bg-[#F5F2E8] border border-[rgba(62,155,99,0.4)] rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(62,155,99,0.1)]">
              <div className="font-mono text-[0.6rem] text-[#1A5C35] uppercase tracking-[0.05em] text-center leading-[1.3] pt-[0.1rem]">
                LEARN
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}


// --- Component: CTASection.tsx ---
function CTASection() {
  return (
    <section id="cta" className="bg-[#F5F2E8] py-24 px-12 text-center border-t border-[#EDE9D8]/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="inline-block font-mono text-[0.68rem] text-[#1A5C35] uppercase tracking-[0.15em] mb-4">
          Ready to deploy?
        </div>
        
        <h2 className="font-heading font-black text-[clamp(2.2rem,4vw,3.5rem)] text-[#1A1A18] leading-[1.1] my-4">
          Your AI that <span className="italic text-[#1A5C35]">wins</span>
          <br />
          the room.
        </h2>
        
        <p className="font-sans text-[1rem] text-[#6B6B62] max-w-[480px] mx-auto mb-10 leading-[1.7]">
          Stop building spreadsheets and start building relationships. Let NERVE execute the perfect cadence for every lead, automatically.
        </p>
        
        <div className="flex flex-wrap justify-center gap-[1rem]">
          <button className="bg-[#1A5C35] text-[#F5F2E8] font-sans text-[0.95rem] font-medium py-[0.85rem] px-[2rem] rounded-[4px] hover:bg-[#2E7D4F] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            Request Early Access →
          </button>
          <button className="bg-transparent border-[1.5px] border-[rgba(26,92,53,0.25)] text-[#3A3A35] font-sans text-[0.95rem] font-medium py-[0.85rem] px-[2rem] rounded-[4px] hover:border-[#1A5C35] hover:text-[#1A5C35] hover:bg-[#1A5C35]/5 transition-colors">
            Watch the Demo
          </button>
        </div>
      </motion.div>
    </section>
  );
}


// --- Component: Footer.tsx ---
function Footer() {
  return (
    <footer className="bg-[#1A1A18] text-[rgba(255,255,255,0.4)] py-[2.5rem] px-[3rem] flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="font-mono text-[0.9rem] text-[rgba(255,255,255,0.7)] tracking-[0.15em]">
        NERVE · CORTEXREACH
      </div>
      <div className="font-sans text-[0.78rem] text-[rgba(255,255,255,0.35)] text-center md:text-right">
        Built on Mastra · Powered by Claude Sonnet · © 2025
      </div>
    </footer>
  );
}



// --- Main Landing Page ---
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#F5F2E8] overflow-x-hidden">
      <Navbar />
      
      <section className="relative">
        <HeroSection />
        <div className="absolute hidden lg:block right-[3rem] top-1/2 -translate-y-1/2 z-[2]">
          <AgentGraphCard />
        </div>
      </section>
      
      <HowItWorks />
      
      <FeaturePanels />
      
      <AgentsGrid />
      
      <IntegrationsGrid />

      <DeveloperExperience />
      
      <LearningLoop />
      
      <CTASection />
      
      <Footer />
    </main>
  );
}
