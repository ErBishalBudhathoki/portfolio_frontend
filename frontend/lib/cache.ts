import { NextResponse } from 'next/server';

// Cache duration in seconds
const CACHE_DURATION = 60 * 5; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

export function getCacheHeaders() {
  return {
    'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`,
    'CDN-Cache-Control': `public, s-maxage=${CACHE_DURATION}`,
    'Vercel-CDN-Cache-Control': `public, s-maxage=${CACHE_DURATION}`,
  };
}

export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);

  // If we have cached data and it's not expired, return it
  if (cached && now - cached.timestamp < CACHE_DURATION * 1000) {
    console.log(`Cache hit for key: ${key}`);
    return cached.data;
  }

  try {
    // Fetch fresh data
    console.log(`Cache miss for key: ${key}, fetching fresh data...`);
    const freshData = await fetchFn();

    // Update cache
    cache.set(key, {
      data: freshData,
      timestamp: now,
    });

    return freshData;
  } catch (error) {
    console.error(`Error fetching data for key ${key}:`, error);
    
    // If we have stale cached data, return it as fallback
    if (cached) {
      console.log(`Returning stale cached data for key: ${key}`);
      return cached.data;
    }
    
    throw error;
  }
}

// Helper to clear cache
export function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

// Helper to get cache size
export function getCacheSize(): number {
  return cache.size;
}

// Helper to check if key exists in cache
export function isCached(key: string): boolean {
  return cache.has(key);
} 