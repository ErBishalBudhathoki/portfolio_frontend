'use client';

import { ReactNode, useEffect, useState } from 'react';
import useAnalytics from '@/hooks/useAnalytics';

interface AnalyticsProviderProps {
  children: ReactNode;
}

export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const { trackEvent } = useAnalytics();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window !== 'undefined') {
      (window as any).__analyticsTracker = trackEvent;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__analyticsTracker;
      }
    };
  }, [trackEvent, mounted]);

  // Only render children after mount to avoid hydration mismatch
  if (!mounted) return null;
  return <>{children}</>;
} 