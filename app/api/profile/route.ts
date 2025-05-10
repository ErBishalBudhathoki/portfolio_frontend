export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://portfolio-backend-ixvhxw7sqq-uc.a.run.app';
    console.log(`Fetching profile data from ${apiUrl}/api/profile`);
    
    const response = await fetch(`${apiUrl}/api/profile`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Backend API error: ${response.status}`);
      return new Response(
        JSON.stringify({ error: `Backend API error: ${response.status}` }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    console.log('Profile data fetched successfully');
    
    return new Response(
      JSON.stringify(data),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching profile data:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch profile data' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 