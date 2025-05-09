/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Enable standalone output for containerized deployments
  
  images: {
    remotePatterns: [
      { hostname: 'media.licdn.com' },     // For LinkedIn profile images
      { hostname: 'static.licdn.com' },    // For LinkedIn content
      { hostname: 'platform-lookaside.fbsbx.com' }, // For profile images from Facebook
      { hostname: 'lh3.googleusercontent.com' },   // For Google-hosted images
      { hostname: 'i.imgur.com' },         // For Imgur-hosted images
      { hostname: 'drive.google.com' },    // For Google Drive images
      { hostname: 'firebasestorage.googleapis.com' }, // For Firebase Storage images
      { hostname: 'ui-avatars.com' },      // For placeholder avatars
    ],
  },
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable static generation (SSG) and use server-side rendering (SSR) instead
  staticPageGenerationTimeout: 120,
  env: {
    // Read API URL from environment variable or use the default backend URL
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://portfolio-backend-824962762241.us-central1.run.app',
  },
  // Add redirect for non-www to www
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'bishalbudhathoki.com',
          },
        ],
        destination: 'https://www.bishalbudhathoki.com/:path*',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // Log the API URL configuration for debugging
    console.log('Next.js rewrite configuration:');
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || 'not set (will use localhost:8000)');
    
    // Rewrite API calls to the backend
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*` 
          : 'http://localhost:8000/api/:path*',
      }
    ];
  },
};

export default nextConfig; 