import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Track a custom event (client-side only)
 * @param eventType Type of event to track
 * @param additionalData Additional data to include with the event
 */
export function trackEvent(eventType: string, additionalData: Record<string, any> = {}) {
  // Ensure we're on the client side
  if (typeof window === 'undefined') return;
  
  // Don't track events in development mode
  if (process.env.NODE_ENV === 'development') return;
  
  try {
    // Get the analytics hook from the window object (set by the AnalyticsProvider)
    const analyticsHook = (window as any).__analyticsTracker;
    
    if (analyticsHook && typeof analyticsHook === 'function') {
      analyticsHook(eventType, additionalData);
    }
  } catch (error) {
    // Silently fail to avoid breaking user experience
    console.error('Failed to track event:', error);
  }
} 