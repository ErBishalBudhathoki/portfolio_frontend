import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get backend URL from environment variable or use a fallback
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://portfolio-backend-ixvhxw7sqq-uc.a.run.app';
    
    // Log for debugging
    console.log(`Detailed blog API proxy route - Using backend URL: ${apiUrl}`);
    
    // Forward the request to the backend with all query parameters
    const url = new URL(request.url);
    const backendRequestUrl = `${apiUrl}/api/blog/detailed${url.search}`;
    
    console.log(`Proxying detailed blog request to: ${backendRequestUrl}`);
    
    const response = await fetch(backendRequestUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    // Check if the backend request was successful
    if (!response.ok) {
      console.error(`Backend detailed blog request failed: ${response.status} ${response.statusText}`);
      
      // Attempt to get the error message from the response
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error response body';
      }
      
      console.error(`Error response: ${errorText}`);
      
      return NextResponse.json(
        { error: `Backend request failed with status ${response.status}` },
        { status: response.status }
      );
    }
    
    // Parse and return the response data
    const data = await response.json();
    console.log(`Successfully proxied detailed blog request, got data with ${data.posts?.length || 0} posts`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in detailed blog API proxy route:', error);
    return NextResponse.json(
      { error: 'Internal server error in API proxy' },
      { status: 500 }
    );
  }
} 