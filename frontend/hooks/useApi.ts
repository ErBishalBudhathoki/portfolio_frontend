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
  revalidateOnFocus: false, // Don't revalidate when window gets focus
  revalidateOnReconnect: true, // Revalidate when reconnecting after being offline
  dedupingInterval: 60000, // 1 minute deduping interval
  revalidateIfStale: false,
};

// Default fetcher that handles API responses, cold-starts, and errors
const defaultFetcher = async (url: string) => {
  const timestamp = new Date().getTime();
  const fullUrl = url.includes('?') ? `${url}&t=${timestamp}` : `${url}?t=${timestamp}`;
  
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
  
  // Use a relative URL if on client-side, otherwise use absolute URL
  const fullUrl = isServerSide 
    ? `${apiUrl}/api${path}` 
    : `/api${path}`;
    
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
