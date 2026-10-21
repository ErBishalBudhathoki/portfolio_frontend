'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Cpu } from 'lucide-react';

const MESSAGES = [
  { minSeconds: 0, text: 'Loading Bishal\'s portfolio...', subtext: 'Connecting to services' },
  { minSeconds: 3, text: 'Initializing cloud microservices ⚡', subtext: 'Starting server runtime on Google Cloud...' },
  { minSeconds: 8, text: 'Synchronizing live data pipeline 🔄', subtext: 'Connecting to Google Sheets data source...' },
  { minSeconds: 16, text: 'Loading verified skills and projects 🚀', subtext: 'Formatting experience timeline and repositories...' },
  { minSeconds: 25, text: 'Assembling interactive components ✨', subtext: 'Almost ready to render...' },
  { minSeconds: 35, text: 'Finalizing server connection 🛰️', subtext: 'Preparing your view right now...' },
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

        {/* Status indicator badge */}
        {seconds >= 3 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 rounded-full border border-accent-foreground/30 bg-accent-foreground/5 text-accent-foreground text-xs font-medium animate-fadeIn">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-foreground opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-foreground"></span>
            </span>
            <span>Cloud Services Initializing • {seconds}s</span>
          </div>
        )}
        
        {/* Dynamic message */}
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
      </div>
    </div>
  );
}