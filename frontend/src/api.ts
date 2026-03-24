// Simple in-memory cache implementation
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ApiCache {
  private cache: Record<string, CacheEntry<any>> = {};
  private readonly TTL = 5 * 60 * 1000; // 5 minutes cache lifetime

  get<T>(key: string): T | null {
    const entry = this.cache[key];
    if (!entry) return null;
    
    // Check if the cache entry has expired
    const now = Date.now();
    if (now - entry.timestamp > this.TTL) {
      delete this.cache[key];
      return null;
    }
    
    return entry.data as T;
  }
  
  set<T>(key: string, data: T): void {
    this.cache[key] = {
      data,
      timestamp: Date.now()
    };
  }
  
  clear(): void {
    this.cache = {};
  }
}

const apiCache = new ApiCache();

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cacheKey = `${endpoint}`;
  
  // Try to get from cache first
  const cachedData = apiCache.get<T>(cacheKey);
  if (cachedData) {
    console.log(`Using cached data for: ${endpoint}`);
    return cachedData;
  }
  
  // Cache miss, fetch from API
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const res = await fetch(`${apiUrl}${endpoint}`, options);
  
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  
  // Store in cache
  apiCache.set(cacheKey, data);
  
  return data;
} 