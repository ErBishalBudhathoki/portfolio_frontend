import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://portfolio-backend-824962762241.us-central1.run.app';
  const fullUrl = `${backendUrl}/api/profile`;
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`API route /api/profile calling ${fullUrl} (attempt ${attempt}/${maxAttempts})`);

      const response = await fetch(fullUrl, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        // Cold starts on Cloud Run typically present as 502, 503, or 504
        if ((response.status === 502 || response.status === 503 || response.status === 504) && attempt < maxAttempts) {
          console.warn(`[Cold Start] Backend returned ${response.status}. Retrying in 2s...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          continue;
        }
        throw new Error(`Backend API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.experience && Array.isArray(data.experience)) {
        data.experience = data.experience.map((exp: ExperienceItem) => ({
          ...exp,
          title: exp.title || exp.role,
        }));
      }

      data.last_updated = data.last_updated || new Date().toISOString();

      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      });
    } catch (error) {
      if (attempt < maxAttempts) {
        console.warn(`[Cold Start] Connection failed on attempt ${attempt}. Retrying in 2s...`, error instanceof Error ? error.message : error);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }

      console.error('Error in /api/profile route after retries:', error);
      return NextResponse.json(
        { 
          status: 'warming',
          error: 'Server is currently waking up from cold sleep',
          retryAfter: 3
        },
        { status: 503 }
      );
    }
  }

  return NextResponse.json(
    { status: 'warming', error: 'Server warming up', retryAfter: 3 },
    { status: 503 }
  );
} 
