'use client';

import React from 'react';

interface TechSkill {
  id: string;
  name: string;
}

const TECH_SKILLS: TechSkill[] = [
  { id: 'js', name: 'JavaScript' },
  { id: 'react', name: 'React' },
  { id: 'nextjs', name: 'Next.js' },
  { id: 'html', name: 'HTML5' },
  { id: 'androidstudio', name: 'Android Studio' },
  { id: 'kotlin', name: 'Kotlin' },
  { id: 'flutter', name: 'Flutter' },
  { id: 'nodejs', name: 'Node.js' },
  { id: 'postman', name: 'Postman' },
  { id: 'firebase', name: 'Firebase' },
  { id: 'git', name: 'Git' },
  { id: 'github', name: 'GitHub' },
  { id: 'bitbucket', name: 'Bitbucket' },
  { id: 'aws', name: 'AWS' },
  { id: 'gcp', name: 'Google Cloud' },
  { id: 'java', name: 'Java' },
  { id: 'c', name: 'C' },
  { id: 'cpp', name: 'C++' },
  { id: 'py', name: 'Python' },
  { id: 'cs', name: 'C#' },
  { id: 'ts', name: 'TypeScript' },
  { id: 'docker', name: 'Docker' },
  { id: 'postgres', name: 'PostgreSQL' },
  { id: 'mongodb', name: 'MongoDB' },
  { id: 'discord', name: 'Discord' },
];

export default function TechMarquee() {
  return (
    <div className="relative w-full overflow-hidden py-4 border-y border-border/60 bg-card/40 backdrop-blur-md">
      {/* Edge Gradients for smooth infinite flow */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-background to-transparent z-10" />

      <div className="flex w-max animate-marquee space-x-3.5 sm:space-x-4 hover:[animation-play-state:paused]">
        {/* Render doubled list for infinite marquee */}
        {[...TECH_SKILLS, ...TECH_SKILLS].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl border border-border/70 bg-background/80 shadow-sm backdrop-blur-sm group hover:border-primary/50 hover:bg-card transition-all cursor-pointer"
            title={item.name}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 relative shrink-0 flex items-center justify-center">
              <img
                src={`/images/tech/${item.id}.svg`}
                alt={item.name}
                width={40}
                height={40}
                className="w-full h-full object-contain rounded-xl group-hover:scale-110 transition-transform duration-200"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://skillicons.dev/icons?i=${item.id}&theme=dark`;
                }}
              />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-foreground tracking-tight whitespace-nowrap pr-1">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
