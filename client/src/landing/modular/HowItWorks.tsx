"use client";

import React from 'react';
import { motion } from 'framer-motion';

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

export default function HowItWorks() {
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
