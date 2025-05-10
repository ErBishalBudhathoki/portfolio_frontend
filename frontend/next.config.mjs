/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Enable standalone output for containerized deployments
  trailingSlash: true, // Add trailing slashes to all routes
  poweredByHeader: false, // Remove X-Powered-By header
  
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
    minimumCacheTTL: 60,
  },
  
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable strict mode during build
  reactStrictMode: false,
  
  // Enable static optimization where possible
  staticPageGenerationTimeout: 180,
  
  // Configure proper caching headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },
  
  env: {
    // Read API URL from environment variable or use the default backend URL
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://portfolio-backend-824962762241.us-central1.run.app',
  },
  
  async rewrites() {
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