"use client";

import React, { useEffect, useState } from 'react';

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

export default function LearningLoop() {
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
