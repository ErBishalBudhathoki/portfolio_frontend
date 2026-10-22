'use client';

import React from 'react';

const TECH_ITEMS = [
  { name: 'Flutter', category: 'Mobile' },
  { name: 'Kotlin', category: 'Android' },
  { name: 'Next.js 15', category: 'Frontend' },
  { name: 'React', category: 'Web' },
  { name: 'FastAPI', category: 'Backend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Python', category: 'Language' },
  { name: 'TypeScript', category: 'Language' },
  { name: 'Google Cloud Run', category: 'Cloud' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'Firebase', category: 'Backend' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'Android SDK', category: 'Mobile' },
  { name: 'Core Java', category: 'Language' },
];

export default function TechMarquee() {
  return (
    <div className="relative w-full overflow-hidden py-6 border-y border-border/50 bg-card/40 backdrop-blur-sm">
      <div className="flex w-max animate-marquee space-x-6 hover:[animation-play-state:paused]">
        {/* Double the list for infinite seamless loop */}
        {[...TECH_ITEMS, ...TECH_ITEMS].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-border/70 bg-background/80 shadow-sm backdrop-blur-md group hover:border-primary/40 transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-primary/70 group-hover:scale-125 transition-transform" />
            <span className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">
              {item.name}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest px-1.5 py-0.5 rounded bg-muted">
              {item.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
