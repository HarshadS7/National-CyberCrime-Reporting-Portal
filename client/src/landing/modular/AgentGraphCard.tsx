"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function AgentGraphCard() {
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
