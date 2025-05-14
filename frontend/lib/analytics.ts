import axios from 'axios';

// Define the API URL based on environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fetch analytics summary data
 * @param days Number of days to include in the summary
 */
export async function fetchAnalyticsSummary(days: number = 30) {
  try {
    const response = await axios.get(`${API_URL}/api/analytics/summary`, {
      params: { days },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      withCredentials: true,
      timeout: 10000 // 10 second timeout
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return null;
  }
}

/**
 * Fetch recent analytics events
 * @param limit Maximum number of events to return
 * @param eventType Optional filter by event type
 */
// lib/analytics.ts
export async function fetchRecentEvents(limit: number = 100, eventType?: string) {
  try {
    const params: Record<string, any> = { limit };
    if (eventType) {
      params.event_type = eventType;
    }

    const fullUrl = `${API_URL}/api/analytics/events`; // Construct the full URL
    console.log('Fetching recent events from URL:', fullUrl); // Log the URL
    console.log('With params:', params); // Log the params
    console.log('API_URL is:', API_URL); // Confirm API_URL

    const response = await axios.get(fullUrl, { // Use fullUrl
      params,
      headers: {
        'Accept': 'application/json',
        // 'Content-Type': 'application/json' // Content-Type is not strictly needed for GET
      },
      withCredentials: true,
      timeout: 10000
    });
    console.log('Recent events response:', response.data); // Log successful response
    return response.data;
  } catch (error: any) { // Catch specific AxiosError if possible
    console.error('Error fetching recent events:', error);
    if (error.isAxiosError) {
      console.error('Axios error request:', error.request);
      console.error('Axios error response:', error.response);
      console.error('Axios error config:', error.config);
    }
    return [];
  }
}