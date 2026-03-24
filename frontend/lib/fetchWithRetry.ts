/**
 * Enhanced fetch utilities with retry logic and validation
 */

// Default retry configuration
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffFactor: 1.5,
};

/**
 * Fetch with automatic retry for failed requests
 */
export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | null = null;
  let delay = retryConfig.retryDelay;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Fetch attempt ${attempt + 1}/${retryConfig.maxRetries + 1} failed:`, lastError.message);
      
      if (attempt === retryConfig.maxRetries) {
        break;
      }
      
      // Wait before next retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= retryConfig.backoffFactor;
    }
  }

  throw lastError || new Error('Failed to fetch after multiple attempts');
}

/**
 * Fetch with validation function to ensure response meets requirements
 */
export async function fetchWithValidation<T>(
  url: string,
  options: RequestInit = {},
  validator: (data: any) => boolean,
  retryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  const data = await fetchWithRetry<any>(url, options, retryConfig);
  
  if (!validator(data)) {
    throw new Error('Response validation failed');
  }
  
  return data;
} 