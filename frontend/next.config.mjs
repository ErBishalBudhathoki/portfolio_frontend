/** @type {import('next').NextConfig} */
import { default as withPWA } from 'next-pwa';

const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
    disableStaticImages: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/**',
      },
      { hostname: 'media.licdn.com' },
      { hostname: 'static.licdn.com' },
      { hostname: 'platform-lookaside.fbsbx.com' },
      { hostname: 'lh3.googleusercontent.com' },
      { hostname: 'i.imgur.com' },
      { hostname: 'drive.google.com' },
      { hostname: 'firebasestorage.googleapis.com' },
      { hostname: 'ui-avatars.com' },
    ],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  staticPageGenerationTimeout: 180,
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
  async redirects() {
    return [
      {
        source: '/resume',
        destination: '/about',
        permanent: true,
      },
    ];
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

let config = nextConfig;

try {
  config = withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development'
  })(nextConfig);
} catch (e) {
  console.log('PWA module not found, using standard config');
}

export default config; 