"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function CTASection() {
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
