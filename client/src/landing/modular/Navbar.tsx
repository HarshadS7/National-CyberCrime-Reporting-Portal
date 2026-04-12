"use client";

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export default function Navbar() {
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
