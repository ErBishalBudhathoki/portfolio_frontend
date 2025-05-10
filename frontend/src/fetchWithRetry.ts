/**
 * Fetch data with automatic retry logic to handle intermittent failures
 * 
 * @param url The URL to fetch
 * @param options Fetch options
 * @param retries Number of retries to attempt
 * @param backoff Initial backoff time in ms (doubles with each retry)
 * @returns The fetch response
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = 2,
  backoff: number = 300
): Promise<Response> {
  try {
    // Ensure URL is properly formatted
    const parsedUrl = url.startsWith('http') 
      ? url 
      : (typeof window !== 'undefined' 
        ? new URL(url, window.location.origin).toString() 
        : url);
    
    const response = await fetch(parsedUrl, options);
    
    // Check if response is empty or missing data
    if (response.ok) {
      const clone = response.clone();
      try {
        const data = await clone.json();
        
        // Check if the response contains actual data or is empty
        const hasData = data && 
          (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);
          
        if (!hasData && retries > 0) {
          console.log(`Response contains empty data, retrying... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, backoff));
          return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
      } catch (e) {
        // If we can't parse JSON, assume response is not empty
      }
    }
    
    // Check for error responses, retry if possible
    if (!response.ok && retries > 0) {
      console.log(`Fetch failed with status ${response.status}, retrying... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    
    return response;
  } catch (error) {
    // Retry on network errors
    if (retries > 0) {
      console.log(`Fetch error: ${error}, retrying... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
}

/**
 * Fetch data with prefetch and validation to ensure complete data
 * 
 * @param url The URL to fetch
 * @param options Fetch options
 * @param validateFn Function to validate if data is complete
 * @returns The parsed JSON data
 */
export async function fetchWithValidation<T>(
  url: string, 
  options: RequestInit = {}, 
  validateFn?: (data: any) => boolean
): Promise<T> {
  // Ensure URL is properly formatted
  const parsedUrl = url.startsWith('http') 
    ? url 
    : (typeof window !== 'undefined' 
      ? new URL(url, window.location.origin).toString() 
      : url);

  // First attempt with retry logic
  try {
    const response = await fetchWithRetry(parsedUrl, {
      ...options,
      cache: 'no-store',
      next: { revalidate: 0 }
    }, 1, 300);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // If validation function provided and data fails validation, try one more time
    if (validateFn && !validateFn(data)) {
      console.log('Data validation failed, retrying with longer timeout...');
      
      // Second attempt with longer timeout
      const retryResponse = await fetchWithRetry(parsedUrl, {
        ...options,
        cache: 'no-store',
        next: { revalidate: 0 }
      }, 1, 1000);
      
      if (!retryResponse.ok) {
        throw new Error(`Failed to fetch data on retry: ${retryResponse.status} ${retryResponse.statusText}`);
      }
      
      return await retryResponse.json();
    }
    
    return data;
  } catch (error) {
    console.error(`Error in fetchWithValidation for ${parsedUrl}:`, error);
    
    // If the URL is relative and we're on the server, try with the absolute backend URL
    if (!url.startsWith('http') && typeof window === 'undefined') {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiUrl) {
        console.log(`Trying with absolute backend URL: ${apiUrl}${url}`);
        return fetchWithValidation<T>(`${apiUrl}${url}`, options, validateFn);
      }
    }
    
    throw error;
  }
} 