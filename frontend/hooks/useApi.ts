import useSWR from 'swr';

interface ApiOptions {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  dedupingInterval?: number;
}

const defaultOptions: ApiOptions = {
  refreshInterval: 0, // Default to no auto-refresh
  revalidateOnFocus: false, // Don't revalidate when window gets focus
  revalidateOnReconnect: true, // Revalidate when reconnecting after being offline
  dedupingInterval: 60000, // 1 minute deduping interval
};

// Default fetcher that handles API responses and errors
const defaultFetcher = async (url: string) => {
  const timestamp = new Date().getTime();
  const fullUrl = url.includes('?') ? `${url}&t=${timestamp}` : `${url}?t=${timestamp}`;
  
  const response = await fetch(fullUrl);
  
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.message = `Error ${response.status}: ${response.statusText}`;
    throw error;
  }
  
  return response.json();
};

export function useApi<T>(path: string, options?: ApiOptions) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const isServerSide = typeof window === 'undefined';
  
  // Use a relative URL if on client-side, otherwise use absolute URL
  let fullUrl = isServerSide 
    ? `${apiUrl}/api${path}` 
    : `/api${path}`;
    
  // Merge default options with user-provided options
  const swrOptions = { ...defaultOptions, ...options };
  
  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    fullUrl,
    defaultFetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: swrOptions.revalidateOnFocus,
      revalidateOnReconnect: swrOptions.revalidateOnReconnect,
      refreshInterval: swrOptions.refreshInterval,
      dedupingInterval: swrOptions.dedupingInterval,
    }
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    refresh: mutate
  };
} 