/**
 * Data fetching utilities with caching support for the portfolio site
 */

// Cache keys
const CACHE_KEYS = {
  PROFILE: 'portfolio_profile_data',
  PROJECTS: 'portfolio_projects_data',
  CACHE_TIMESTAMP: 'portfolio_data_timestamp'
};

// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Get base API URL from env or use relative URL for custom domains
const getApiUrl = (endpoint: string): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const apiEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Add timestamp to avoid browser caching
  const timestamp = new Date().getTime();
  const queryChar = apiEndpoint.includes('?') ? '&' : '?';
  return `${apiEndpoint}${queryChar}t=${timestamp}`;
};

// Save data to localStorage
const saveToCache = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
    console.log(`Data cached for ${key}`);
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

// Get data from localStorage
const getFromCache = (key: string) => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cachedData = localStorage.getItem(key);
    if (!cachedData) return null;
    
    const timestamp = localStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
    const timestampNumber = timestamp ? parseInt(timestamp, 10) : 0;
    
    // Check if cache is expired
    if (Date.now() - timestampNumber > CACHE_DURATION) {
      console.log('Cache expired, clearing');
      localStorage.removeItem(key);
      return null;
    }
    
    return JSON.parse(cachedData);
  } catch (error) {
    console.warn('Failed to get from localStorage:', error);
    return null;
  }
};

// Check if we should use cached data or fetch fresh data
const shouldUseCachedData = (endpoint: string) => {
  // Map endpoints to cache keys
  const cacheKeyMap: { [key: string]: string } = {
    'api/profile': CACHE_KEYS.PROFILE,
    'api/projects': CACHE_KEYS.PROJECTS
  };
  
  const cacheKey = cacheKeyMap[endpoint.replace(/^\//, '')] || null;
  if (!cacheKey) return { shouldUse: false, cacheKey: null, data: null };
  
  const cachedData = getFromCache(cacheKey);
  return { 
    shouldUse: !!cachedData, 
    cacheKey, 
    data: cachedData 
  };
};

/**
 * Fetches data from API with localStorage caching and fallback mechanisms
 * - First checks localStorage cache
 * - Then tries relative URL (works with Next.js rewrites on same domain)
 * - Falls back to direct backend URL if provided in env
 */
export async function fetchData(endpoint: string) {
  // Check if we have valid cached data
  const { shouldUse, cacheKey, data: cachedData } = shouldUseCachedData(endpoint);
  
  if (shouldUse && cachedData) {
    console.log(`Using cached data for ${endpoint}`);
    return cachedData;
  }
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const relativeUrl = getApiUrl(endpoint);
  
  try {
    // First try with relative URL
    console.log(`Attempting to fetch data using relative URL: ${relativeUrl}`);
    
    try {
      // For client-side fetching, we need to use the absolute URL with the window origin
      const fullUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}${relativeUrl}`
        : relativeUrl;
      
      const res = await fetch(fullUrl, {
        next: { revalidate: 3600 }, // Cache for 1 hour
      });
      
      if (res.ok) {
        console.log(`Successfully fetched data from ${relativeUrl}`);
        const data = await res.json();
        
        // Cache the new data if we have a valid cache key
        if (cacheKey) {
          saveToCache(cacheKey, data);
        }
        
        return data;
      }
    } catch (error) {
      console.error(`Error fetching with relative URL: ${relativeUrl}`, error);
    }
    
    // If relative URL fails and we have a backend URL, try direct fetch
    if (apiUrl) {
      const directUrl = `${apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      console.log(`Falling back to direct backend URL: ${directUrl}`);
      
      const res = await fetch(`${directUrl}?t=${new Date().getTime()}`, {
        next: { revalidate: 3600 }, // Cache for 1 hour
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch data: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Cache the new data if we have a valid cache key
      if (cacheKey) {
        saveToCache(cacheKey, data);
      }
      
      return data;
    } else {
      throw new Error("No API URL available and relative URL failed");
    }
  } catch (error) {
    console.error(`Error fetching data for ${endpoint}:`, error);
    
    // If all fetch attempts fail but we have cached data, use it as fallback
    if (cachedData) {
      console.log(`Falling back to cached data for ${endpoint} after fetch error`);
      return cachedData;
    }
    
    return null;
  }
}

/**
 * Posts data to the API with fallback mechanisms
 */
export async function postData(endpoint: string, data: any) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const relativeUrl = getApiUrl(endpoint);
  
  try {
    // First try with relative URL
    console.log(`Attempting to post data using relative URL: ${relativeUrl}`);
    
    try {
      // For client-side fetching, we need to use the absolute URL with the window origin
      const fullUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}${relativeUrl}`
        : relativeUrl;
      
      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (res.ok) {
        console.log(`Successfully posted data to ${relativeUrl}`);
        const responseData = await res.json();
        
        // When posting data, clear any related cache
        if (typeof window !== 'undefined') {
          Object.values(CACHE_KEYS).forEach(key => {
            localStorage.removeItem(key);
          });
        }
        
        return responseData;
      }
    } catch (error) {
      console.error(`Error posting to relative URL: ${relativeUrl}`, error);
    }
    
    // If relative URL fails and we have a backend URL, try direct fetch
    if (apiUrl) {
      const directUrl = `${apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      console.log(`Falling back to direct backend URL for POST: ${directUrl}`);
      
      const res = await fetch(`${directUrl}?t=${new Date().getTime()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to post data: ${res.status}`);
      }
      
      return await res.json();
    } else {
      throw new Error("No API URL available and relative URL failed");
    }
  } catch (error) {
    console.error(`Error posting data for ${endpoint}:`, error);
    throw error;
  }
} 