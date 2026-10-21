'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Server, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  HelpCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WARMING_STAGES, FUN_TECH_FACTS, FALLBACK_PROFILE_DATA } from '@/lib/fallback-data';
import { ProfileData } from '@/app/(site)/types';

interface ServerWarmingScreenProps {
  onUseFallback?: (fallback: ProfileData) => void;
  title?: string;
  subtitle?: string;
}

export function ServerWarmingScreen({
  onUseFallback,
  title = "Connecting to Cloud Backend",
  subtitle = "Connecting to backend cloud services. Initializing the live data pipeline to load projects, verified skills, and experience highlights."
}: ServerWarmingScreenProps) {
  const router = useRouter();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [isServerReady, setIsServerReady] = useState(false);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  // Determine current warming stage based on elapsed time
  const currentStage = useMemo(() => {
    for (let i = WARMING_STAGES.length - 1; i >= 0; i--) {
      if (elapsedSeconds >= WARMING_STAGES[i].minSeconds) {
        return WARMING_STAGES[i];
      }
    }
    return WARMING_STAGES[0];
  }, [elapsedSeconds]);

  // Check backend availability
  const checkBackendStatus = useCallback(async () => {
    if (isChecking || isServerReady) return;
    setIsChecking(true);

    try {
      // Use relative API URL on client, with cache busting
      const res = await fetch(`/api/profile?t=${Date.now()}`, {
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        if (data && (data.basic_info || data.experience || data.projects)) {
          setIsServerReady(true);
          // Wait 600ms for happy animation, then refresh to render full page
          setTimeout(() => {
            router.refresh();
          }, 800);
          return;
        }
      }
    } catch {
      // Still warming up, ignore error
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, isServerReady, router]);

  // Elapsed seconds timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Background polling every 3 seconds
  useEffect(() => {
    // Initial check after 2 seconds
    const initialTimer = setTimeout(() => {
      checkBackendStatus();
    }, 2000);

    const pollInterval = setInterval(() => {
      checkBackendStatus();
    }, 3500);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(pollInterval);
    };
  }, [checkBackendStatus]);

  // Rotate fun tech facts every 7 seconds
  useEffect(() => {
    const factTimer = setInterval(() => {
      setCurrentFactIndex(prev => (prev + 1) % FUN_TECH_FACTS.length);
    }, 7000);
    return () => clearInterval(factTimer);
  }, []);

  const handleInstantView = () => {
    if (onUseFallback) {
      onUseFallback(FALLBACK_PROFILE_DATA);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background ambient lighting matching portfolio style */}
      <div className="absolute inset-0 z-0 bg-[url('/grid-pattern.svg')] opacity-10 pointer-events-none"></div>
      <div className="absolute -top-12 -left-12 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute -bottom-12 -right-12 w-96 h-96 bg-accent-foreground/10 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl w-full mx-auto">
        <div className="rounded-3xl border border-border/60 bg-card/85 backdrop-blur-xl shadow-2xl p-6 sm:p-10 text-center transition-all">
          
          {/* Header Status Badge */}
          <div className="flex justify-center mb-6">
            <Badge 
              variant="outline" 
              className="px-4 py-1.5 text-xs sm:text-sm font-medium border-accent-foreground/40 bg-accent-foreground/5 text-accent-foreground flex items-center gap-2"
            >
              {isServerReady ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  <span className="text-emerald-500 font-semibold">Server Ready! Loading Portfolio...</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-foreground opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-foreground"></span>
                  </span>
                  <span>Warming Up Server • {elapsedSeconds}s elapsed</span>
                </>
              )}
            </Badge>
          </div>

          {/* Animated Hero Icon Graphic */}
          <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-accent-foreground/30 animate-spin-slow"></div>
            
            {/* Inner pulsing glow */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-primary/20 via-accent-foreground/10 to-transparent animate-pulse"></div>

            {/* Central icon */}
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-background/90 border border-border/80 shadow-md flex items-center justify-center group">
              {isServerReady ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-bounce" />
              ) : (
                <Sparkles className="w-8 h-8 text-accent-foreground animate-pulse" />
              )}
            </div>
          </div>

          {/* Main Title & Subtitle */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            {isServerReady ? "Container Awake! Rendering Page..." : title}
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto mb-6 leading-relaxed">
            {isServerReady 
              ? "All systems go! Connecting you to Bishal's live experience and projects right now."
              : subtitle}
          </p>

          {/* Live Progress Bar with Stage Indicator */}
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-background/60 border border-border/50 text-left">
            <div className="flex items-center justify-between text-xs sm:text-sm font-medium mb-2">
              <span className="text-foreground flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-accent-foreground" />
                {currentStage.message}
              </span>
              <span className="text-muted-foreground font-mono">
                {Math.min(currentStage.progressPercent + Math.min(elapsedSeconds * 1.5, 10), 99)}%
              </span>
            </div>

            {/* Progress line */}
            <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-primary via-accent-foreground to-emerald-400 rounded-full transition-all duration-700 ease-out"
                style={{ 
                  width: `${isServerReady ? 100 : Math.min(currentStage.progressPercent + Math.min(elapsedSeconds * 1.5, 10), 99)}%` 
                }}
              ></div>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              {currentStage.detail}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={checkBackendStatus}
              disabled={isChecking}
              className="rounded-full border-accent-foreground/40 text-accent-foreground hover:bg-accent-foreground/10 text-xs sm:text-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking status...' : 'Check Status Now'}
            </Button>
          </div>

          {/* Rotating Fun Tech Fact */}
          <div className="py-3 px-4 rounded-xl bg-card border border-border/40 text-xs text-muted-foreground/90 italic mb-6 min-h-[44px] flex items-center justify-center transition-all">
            {FUN_TECH_FACTS[currentFactIndex]}
          </div>

          {/* Secondary Action: Instant Snapshot */}
          <div className="pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>
              Tired of waiting?
            </span>
            <div className="flex items-center gap-3">
              {onUseFallback ? (
                <button
                  type="button"
                  onClick={handleInstantView}
                  className="font-medium text-accent-foreground hover:underline inline-flex items-center"
                >
                  View Instant Snapshot
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              ) : (
                <Link
                  href="/projects"
                  className="font-medium text-accent-foreground hover:underline inline-flex items-center"
                >
                  Browse Projects Directly
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
export default ServerWarmingScreen;
