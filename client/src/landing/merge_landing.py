import os
import re

components_dir = "src/components"
page_path = "src/app/page.tsx"

targets = [
    "Navbar.tsx",
    "HeroSection.tsx",
    "AgentGraphCard.tsx",
    "HowItWorks.tsx",
    "OutreachPanel.tsx",
    "SchedulingPanel.tsx",
    "FeaturePanels.tsx",
    "AgentsGrid.tsx",
    "IntegrationsGrid.tsx",
    "DeveloperExperience.tsx",
    "LearningLoop.tsx",
    "CTASection.tsx",
    "Footer.tsx",
]

# Hardcoded unified imports to avoid regex headaches
unified_imports = """\"use client\";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Terminal, Database, GitBranch, Cpu, Mail, MessageCircle, Briefcase, Zap, Globe, Shield, Calendar } from 'lucide-react';
"""

all_code = [unified_imports]

for file in targets:
    path = os.path.join(components_dir, file)
    if not os.path.exists(path):
        print(f"Skipping {file}, not found.")
        continue
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
        
        # Strip import statements
        content = re.sub(r'^import [^\n]+;\n?', '', content, flags=re.MULTILINE)
        content = re.sub(r'^import\n[\s\S]*?from[^\n]+;\n?', '', content, flags=re.MULTILINE)
        
        # Strip use client directives
        content = content.replace('"use client";', '')
        content = content.replace("'use client';", '')
        
        # Replace `export default function` with `function`
        content = re.sub(r'export default function (\w+)', r'function \1', content)
        
        # Quick clean multiple newlines
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        all_code.append(f"// --- Component: {file} ---")
        all_code.append(content.strip() + "\n\n")

# Complete App Page
page_comp = """
// --- Main Landing Page ---
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#F5F2E8] overflow-x-hidden">
      <Navbar />
      
      <section className="relative">
        <HeroSection />
        <div className="absolute hidden lg:block right-[3rem] top-1/2 -translate-y-1/2 z-[2]">
          <AgentGraphCard />
        </div>
      </section>
      
      <HowItWorks />
      
      <FeaturePanels />
      
      <AgentsGrid />
      
      <IntegrationsGrid />

      <DeveloperExperience />
      
      <LearningLoop />
      
      <CTASection />
      
      <Footer />
    </main>
  );
}
"""
all_code.append(page_comp)

with open(page_path, "w", encoding="utf-8") as f:
    f.write('\n'.join(all_code))
