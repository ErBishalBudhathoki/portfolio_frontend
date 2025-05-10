import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function fetchData(endpoint: string) {
  try {
    const response = await axios.get(`${API_URL}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
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