'use client';

import { ReactNode, useEffect } from 'react';
import useAnalytics from '@/hooks/useAnalytics';

interface AnalyticsProviderProps {
  children: ReactNode;
}

export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__analyticsTracker = trackEvent;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__analyticsTracker;
      }
    };
  }, [trackEvent]);

  return <>{children}</>;
} 
