import useSWR from 'swr';

interface ApiOptions {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  dedupingInterval?: number;
  revalidateIfStale?: boolean;
  revalidateOnMount?: boolean;
}

const defaultOptions: ApiOptions = {
  refreshInterval: 0, // Default to no auto-refresh
  revalidateOnFocus: true, // Revalidate when window gets focus
  revalidateOnReconnect: true, // Revalidate when reconnecting after being offline
  dedupingInterval: 5000, // 5 seconds deduping interval
  revalidateIfStale: true, // Always revalidate if data is stale
};

// Default fetcher that handles API responses, cold-starts, and errors
const defaultFetcher = async (url: string) => {
  const timestamp = new Date().getTime();
  const [base, query] = url.split('?');
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const fullUrl = query 
    ? `${normalizedBase}?${query}&t=${timestamp}` 
    : `${normalizedBase}?t=${timestamp}`;
  
  const response = await fetch(fullUrl);
  
  if (!response.ok) {
    const error: any = new Error(`Error ${response.status}: ${response.statusText}`);
    error.status = response.status;
    if (response.status === 502 || response.status === 503 || response.status === 504) {
      error.isWarming = true;
    }
    throw error;
  }
  
  const responseData = await response.json();
  return responseData;
};

export function useApi<T>(path: string, options?: ApiOptions) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const isServerSide = typeof window === 'undefined';
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const pathWithSlash = cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`;

  // Use a relative URL if on client-side, otherwise use absolute URL
  const fullUrl = isServerSide 
    ? `${apiUrl}/api${pathWithSlash}` 
    : `/api${pathWithSlash}`;
    
  // Merge default options with user-provided options
  const swrOptions = { ...defaultOptions, ...options };
  
  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    fullUrl,
    defaultFetcher,
    {
      revalidateIfStale: swrOptions.revalidateIfStale,
      revalidateOnFocus: swrOptions.revalidateOnFocus,
      revalidateOnReconnect: swrOptions.revalidateOnReconnect,
      revalidateOnMount: swrOptions.revalidateOnMount,
      refreshInterval: swrOptions.refreshInterval,
      dedupingInterval: swrOptions.dedupingInterval,
      shouldRetryOnError: true,
      errorRetryInterval: 3000,
      errorRetryCount: 15, // Patiently retry during ~45s cold starts
    }
  );

  const isWarming = Boolean(
    error && (
      (error as any).isWarming || 
      (error as any).status === 503 || 
      (error as any).status === 502 ||
      (error as any).message?.includes('503') ||
      (error as any).message?.includes('502')
    )
  );

  return {
    data,
    error,
    isLoading: isLoading || (isWarming && !data),
    isWarming,
    isValidating,
    refresh: mutate
  };
} 
