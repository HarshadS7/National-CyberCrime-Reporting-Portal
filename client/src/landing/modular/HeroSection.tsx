"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LiveLogs = [
  "Agent 10: Learning Loop initiated.",
  "Intent Score: 87/100 (High Fit).",
  "Agent 4: Mapped Persona to 'Strategic Exec'.",
  "Agent 5: Route to LinkedIn DM, 10am IST.",
  "Agent 2: Series B Signal appended.",
];

export default function HeroSection() {
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
