import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import axios from 'axios';

// Define the API URL based on environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Custom hook for tracking analytics events
 */
export const useAnalytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Track page view when the route changes
  useEffect(() => {
    // Don't track page views in development mode
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    
    // Don't track admin pages
    if (pathname?.startsWith('/admin')) {
      return;
    }
    
    trackEvent('pageview');
  }, [pathname, searchParams]);
  
  // Function to track custom events
  const trackEvent = useCallback((eventType: string, additionalData = {}) => {
    try {
      // Don't track events in development mode
      if (process.env.NODE_ENV === 'development') {
        return;
      }
      
      // Prepare event data
      const eventData = {
        event_type: eventType,
        pathname: pathname || '/',
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        ...additionalData
      };
      
      // Send to backend
      axios.post(`${API_URL}/api/analytics/track`, eventData, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(err => {
        // Silently fail to avoid breaking user experience
        console.error('Analytics error:', err);
      });
    } catch (error) {
      // Silently fail to avoid breaking user experience
      console.error('Analytics error:', error);
    }
  }, [pathname]);
  
  return { trackEvent };
};

export default useAnalytics; 