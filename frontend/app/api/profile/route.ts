import { NextResponse } from 'next/server';
import { getCachedData, getCacheHeaders } from '@/lib/cache';

// Define interfaces for the API data
interface ExperienceItem {
  role?: string;
  title?: string;
  company: string;
  date_range: string;
  description: string;
  [key: string]: any; // For other possible fields
}

export async function GET() {
  try {
    console.log('API route /api/profile was called');
    
    // Get cached data or fetch from backend
    const data = await getCachedData('profile', async () => {
      // Get the backend URL from environment variables or use the default
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://portfolio-backend-ixvhxw7sqq-uc.a.run.app';
      const fullUrl = `${backendUrl}/api/profile`;
      
      console.log(`API route is forwarding to: ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        next: { revalidate: 300 }, // 5 minutes revalidation for Next.js cache
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error(`Backend API request failed: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch data from backend: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API route successfully fetched data');
      
      if (process.env.NEXT_PUBLIC_API_DEBUG === 'true') {
        console.log(`API data preview: ${JSON.stringify(data).substring(0, 200)}...`);
      }
      
      // Process experience data to match frontend expectations
      if (data.experience && Array.isArray(data.experience)) {
        data.experience = data.experience.map((exp: ExperienceItem) => ({
          ...exp,
          title: exp.title || exp.role, // Map 'role' to 'title' if title doesn't exist
        }));
      }
  
      // Add or update last_updated timestamp
      data.last_updated = data.last_updated || new Date().toISOString();
      
      console.log(`Successfully processed profile data with ${data.experience?.length || 0} experiences`);
      
      return data;
    });
    
    // Return data with cache headers
    return NextResponse.json(data, {
      headers: getCacheHeaders()
    });
  } catch (error) {
    console.error('Error in /api/profile route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 