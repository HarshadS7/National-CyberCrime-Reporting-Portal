import React from 'react';

export default function Footer() {
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
