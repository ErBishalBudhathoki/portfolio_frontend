'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Coffee, Sparkles, Cpu } from 'lucide-react';

const MESSAGES = [
  { minSeconds: 0, text: 'Loading Bishal\'s portfolio...', subtext: 'Fetching latest highlights' },
  { minSeconds: 3, text: 'Cloud container was taking a quick power nap 😴', subtext: 'Waking up the server runtime...' },
  { minSeconds: 8, text: 'Brewing fresh bytes & warming the engine ☕', subtext: 'Spinning up on-demand cloud instance...' },
  { minSeconds: 15, text: 'Shaking hands with live Google Sheets 🤝', subtext: 'Syncing latest projects and verified skills...' },
  { minSeconds: 24, text: 'Assembling experience timeline & pixel magic ✨', subtext: 'Almost ready to showcase...' },
  { minSeconds: 35, text: 'Giving the container a gentle pep talk 🚀', subtext: 'Thanks for your patience — quality code is worth the wait!' },
];

export default function Loading() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentMessage = useMemo(() => {
    for (let i = MESSAGES.length - 1; i >= 0; i--) {
      if (seconds >= MESSAGES[i].minSeconds) {
        return MESSAGES[i];
      }
    }
    return MESSAGES[0];
  }, [seconds]);

  const progressPercent = useMemo(() => {
    // Smooth progress representation that approaches 95% over ~30s
    return Math.min(15 + seconds * 2.5, 95);
  }, [seconds]);

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-50 px-4">
      <div className="flex flex-col items-center max-w-md w-full text-center">
        
        {/* Custom animated logo / spinner */}
        <div className="relative w-24 h-24 mb-6">
          {/* Outer circle - pulses */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
          
          {/* Middle spinning circle */}
          <div className="absolute inset-2 rounded-full border-t-4 border-r-4 border-accent-foreground animate-spin"></div>
          
          {/* Inner circle with initials */}
          <div className="absolute inset-5 rounded-full bg-background border border-border/60 flex items-center justify-center shadow-inner">
            <span className="text-lg font-bold text-foreground">BB</span>
          </div>
        </div>

        {/* Cold start indicator badge */}
        {seconds >= 3 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 rounded-full border border-accent-foreground/30 bg-accent-foreground/5 text-accent-foreground text-xs font-medium animate-fadeIn">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-foreground opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-foreground"></span>
            </span>
            <span>Cloud Instance Spinning Up • {seconds}s</span>
          </div>
        )}
        
        {/* Dynamic quirky message */}
        <div className="relative mb-2 min-h-[30px] flex items-center justify-center">
          <div className="text-base sm:text-lg font-semibold text-foreground transition-all duration-300">
            {currentMessage.text}
          </div>
        </div>

        {/* Subtext description */}
        <p className="text-xs sm:text-sm text-muted-foreground mb-4 max-w-xs">
          {currentMessage.subtext}
        </p>

        {/* Progress bar */}
        <div className="w-56 h-1.5 bg-muted/60 rounded-full overflow-hidden relative mb-2">
          <div 
            className="h-full bg-gradient-to-r from-primary via-accent-foreground to-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {seconds >= 10 && (
          <p className="text-[11px] text-muted-foreground/75 italic animate-fadeIn">
            💡 Free-tier containers take a few seconds to warm up from cold sleep.
          </p>
        )}
      </div>
    </div>
  );
}