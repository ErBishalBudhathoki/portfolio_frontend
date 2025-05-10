/**
 * A simple in-memory cache implementation with expiration
 */

type CacheItem<T> = {
  data: T;
  timestamp: number;
};

type CacheStore = {
  [key: string]: CacheItem<any>;
};

// Default cache expiration in milliseconds (5 minutes)
const DEFAULT_EXPIRATION = 5 * 60 * 1000;

// The cache store
const cache: CacheStore = {};

/**
 * Gets a value from the cache, or executes and caches the fetcher function if not found or expired
 * 
 * @param key The cache key
 * @param fetcher Function to execute if cache is empty or expired
 * @param expiration Expiration time in milliseconds (defaults to 5 minutes)
 * @returns The cached or freshly fetched data
 */
export async function getCachedData<T>(
  key: string, 
  fetcher: () => Promise<T>, 
  expiration: number = DEFAULT_EXPIRATION
): Promise<T> {
  const now = Date.now();
  
  // Check if data is in cache and not expired
  if (cache[key] && (now - cache[key].timestamp < expiration)) {
    console.log(`Cache hit for key: ${key}`);
    return cache[key].data;
  }
  
  // Otherwise, fetch data and update cache
  console.log(`Cache miss for key: ${key}, fetching fresh data`);
  const data = await fetcher();
  
  // Store in cache
  cache[key] = {
    data,
    timestamp: now
  };
  
  return data;
}

/**
 * Invalidates a specific cache entry
 * 
 * @param key The cache key to invalidate
 */
export function invalidateCache(key: string): void {
  if (cache[key]) {
    delete cache[key];
    console.log(`Cache invalidated for key: ${key}`);
  }
}

/**
 * Invalidates all cache entries
 */
export function invalidateAllCache(): void {
  Object.keys(cache).forEach(key => delete cache[key]);
  console.log('All cache entries invalidated');
}

/**
 * Cache headers for Next.js API routes
 * 
 * @param maxAge Maximum age in seconds
 * @param staleWhileRevalidate How long to serve stale content while revalidating
 * @returns Object with appropriate headers
 */
export function getCacheHeaders(maxAge: number = 300, staleWhileRevalidate: number = 3600) {
  return {
    'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
  };
} 