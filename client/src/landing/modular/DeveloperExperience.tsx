"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Database, GitBranch } from 'lucide-react';

const codeSnippet = `import { Agent } from '@mastra/core';
import { signalTools } from './tools/signals';
import { intentModel } from './models/intent';

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

export default function DeveloperExperience() {
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
