"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Database, Mail, MessageCircle, Briefcase, Zap, Globe, Shield, Calendar } from 'lucide-react';

export default function IntegrationsGrid() {
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
