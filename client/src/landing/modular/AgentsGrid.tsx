"use client";

import React from 'react';
import { motion } from 'framer-motion';

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

export default function AgentsGrid() {
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
