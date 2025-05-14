
import { NextRequest, NextResponse } from 'next/server';
import { getCachedData, getCacheHeaders } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for cache key generation
    const url = new URL(request.url);
    const cacheKey = `blog${url.search}`;
    
    // Get backend URL from environment variable or use a fallback
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://portfolio-backend-ixvhxw7sqq-uc.a.run.app';
    
    // Log for debugging
    console.log(`Blog API proxy route - Using backend URL: ${apiUrl}`);
    
    // Get cached data or fetch from backend
    const data = await getCachedData(cacheKey, async () => {
      // Forward the request to the backend with all query parameters
      const backendRequestUrl = `${apiUrl}/api/blog${url.search}`;
      
      console.log(`Proxying blog request to: ${backendRequestUrl}`);
      
      const response = await fetch(backendRequestUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 } // 5 minutes revalidation
      });
      
      // Check if the backend request was successful
      if (!response.ok) {
        console.error(`Backend blog request failed: ${response.status} ${response.statusText}`);
        
        // Attempt to get the error message from the response
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Could not read error response body';
        }
        
        console.error(`Error response: ${errorText}`);
        
        throw new Error(`Backend request failed with status ${response.status}`);
      }
      
      // Parse the response data
      const data = await response.json();
      console.log(`Successfully proxied blog request, got data with ${data.posts?.length || 0} posts`);
      
      return data;
    });
    
    // Return data with cache headers
    return NextResponse.json(data, {
      headers: getCacheHeaders()
    });
  } catch (error) {
    console.error('Error in blog API proxy route:', error);
    return NextResponse.json(
      { error: 'Internal server error in API proxy' },
      { status: 500 }
    );
  }
} 