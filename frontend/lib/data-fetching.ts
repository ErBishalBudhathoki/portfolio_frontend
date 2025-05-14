// data-fetching.ts (The CORRECT version)
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function fetchData(endpoint: string) {
  // Ensure there's exactly one slash between API_URL and endpoint
  const fullUrl = `${API_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  // For debugging, let's keep these logs for a moment
  console.log('[data-fetching.ts - CORRECTED] API_URL:', API_URL);
  console.log('[data-fetching.ts - CORRECTED] Endpoint:', endpoint);
  console.log('[data-fetching.ts - CORRECTED] Full URL being fetched:', fullUrl);

  try {
    const response = await axios.get(fullUrl);
    return response.data;
  } catch (error: any) {
    console.error(`[data-fetching.ts - CORRECTED] Error fetching ${fullUrl}:`, error.message);
    if (error.isAxiosError && error.config) {
      console.error('[data-fetching.ts - CORRECTED] Axios config URL:', error.config.url);
    }
    throw error; // Re-throw the error so SWR can handle it
  }
}

// Helper function to check if the response is valid
export function isValidResponse(data: any): boolean {
  return data !== null && data !== undefined;
}

// Helper function to handle API errors
export function handleApiError(error: any): never {
  console.error('API Error:', error);
  throw new Error(error.message || 'An error occurred while fetching data');
}