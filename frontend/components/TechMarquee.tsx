'use client';

import React from 'react';
import {
  Smartphone,
  Code2,
  Layers3,
  Globe,
  Server,
  Cpu,
  Cloud,
  Database,
  GitBranch,
  Github,
  BrainCircuit,
  Terminal,
} from 'lucide-react';

interface TechItem {
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const TECH_ITEMS: TechItem[] = [
  { name: 'Flutter', category: 'Mobile', icon: Smartphone, color: 'text-sky-400' },
  { name: 'Kotlin', category: 'Android', icon: Smartphone, color: 'text-purple-400' },
  { name: 'Android SDK', category: 'Native', icon: Smartphone, color: 'text-emerald-400' },
  { name: 'React', category: 'Web', icon: Globe, color: 'text-cyan-400' },
  { name: 'Next.js 15', category: 'Frontend', icon: Layers3, color: 'text-foreground' },
  { name: 'TypeScript', category: 'Language', icon: Code2, color: 'text-blue-400' },
  { name: 'Node.js', category: 'Backend', icon: Server, color: 'text-emerald-500' },
  { name: 'Python', category: 'Language', icon: Terminal, color: 'text-yellow-400' },
  { name: 'FastAPI', category: 'Microservices', icon: Server, color: 'text-teal-400' },
  { name: 'Core Java', category: 'Systems', icon: Cpu, color: 'text-orange-400' },
  { name: 'Google Cloud Run', category: 'Cloud', icon: Cloud, color: 'text-blue-500' },
  { name: 'Docker', category: 'DevOps', icon: Layers3, color: 'text-sky-500' },
  { name: 'Firebase', category: 'Cloud DB', icon: Database, color: 'text-amber-500' },
  { name: 'PostgreSQL', category: 'Database', icon: Database, color: 'text-indigo-400' },
  { name: 'MongoDB', category: 'NoSQL', icon: Database, color: 'text-green-500' },
  { name: 'Git & GitHub', category: 'VCS', icon: Github, color: 'text-foreground' },
  { name: 'Genetic Algorithms', category: 'AI/Optimization', icon: BrainCircuit, color: 'text-pink-400' },
];

export default function TechMarquee() {
  return (
    <div className="relative w-full overflow-hidden py-4 border-y border-border/60 bg-card/60 backdrop-blur-md">
      {/* Edge Gradients for seamless infinite flow */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-background to-transparent z-10" />

      <div className="flex w-max animate-marquee space-x-4 sm:space-x-6 hover:[animation-play-state:paused]">
        {/* Render doubled list for infinite marquee */}
        {[...TECH_ITEMS, ...TECH_ITEMS].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-border/70 bg-background/80 shadow-sm backdrop-blur-sm group hover:border-primary/50 hover:bg-card transition-all cursor-default"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Icon className={`w-4 h-4 ${item.color} group-hover:scale-110 transition-transform`} />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-foreground tracking-tight whitespace-nowrap">
                {item.name}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-muted border border-border/50">
                {item.category}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
