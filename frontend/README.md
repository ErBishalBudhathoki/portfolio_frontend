# Portfolio Frontend

This is the frontend for Bishal Budhathoki's professional portfolio website. It's built with Next.js 14, React, Tailwind CSS, and shadcn/ui components.

## Features

- Dynamic data fetching from the backend API
- LinkedIn profile integration
- Google Sheets blog integration
- Responsive design with dark/light mode
- SEO optimized with metadata

## Directory Structure

```
frontend/
├── app/               # Next.js App Router pages
├── components/        # Reusable React components
├── lib/               # Utility functions and helpers
├── public/            # Static assets
├── Dockerfile         # Container configuration for Cloud Run
├── deploy.sh          # Script for new deployments
├── deploy-existing.sh # Script for redeploying existing images
├── next.config.mjs    # Next.js configuration
├── env.example        # Template for environment variables
└── package.json       # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend service running (see backend README)

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
4. Set up environment variables:
   ```bash
   cp env.example .env.local
   ```
   Edit `.env.local` with your configuration values.

### Running Locally

```bash
npm run dev
# or
yarn dev
```

The app will be available at http://localhost:3000

## Deployment to Google Cloud Run

The frontend is deployed to Google Cloud Run using the provided deployment script. 

### Dependencies

- Google Cloud SDK (`gcloud` command-line tool)
- Docker (for local testing only)

### Deployment Process

To deploy the application to Google Cloud Run:

```bash
# Make sure you're in the frontend directory
cd frontend

# Run the deployment script
./deploy.sh
```

This will:
1. Build a Docker image using Google Cloud Build
2. Deploy to Cloud Run with the proper configuration
3. Verify the deployment is working
4. Check domain mappings

### Image Cleanup

To clean up old images from Google Container Registry (to reduce costs):

```bash
# From the project root directory
./cleanup-simple.sh
```

### Key Files

- `frontend/Dockerfile` - Container configuration for Google Cloud Run
- `frontend/deploy.sh` - Main deployment script
- `cleanup-simple.sh` - Script to clean up old container images

### Architecture Notes

- The application is deployed as a containerized service on Google Cloud Run
- The frontend communicates with the backend API running at https://portfolio-backend-824962762241.us-central1.run.app
- Custom domains bishalbudhathoki.com and www.bishalbudhathoki.com are mapped to the Cloud Run service

## Configuration

The key configuration files are:

1. **next.config.mjs** - Contains Next.js configuration, including:
   - Image domains for optimization
   - API rewrites for backend communication
   - Standalone output for containerization

2. **.env.local** - Environment variables for development, including:
   - `NEXT_PUBLIC_API_URL` - URL of the backend API

## Tech Stack

- **Next.js 14** - React framework with Server Components and App Router
- **React** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Reusable UI components built with Radix UI and Tailwind
- **next-themes** - Theme management for dark/light mode

## License

This project is licensed under the MIT License.

## API Integration

The frontend connects to the backend API for:
- LinkedIn profile data
- Project information
- Skills and experience
- Blog posts from Google Sheets

See the backend documentation for API endpoints and details.

## Caching Strategy

The application implements a multi-level caching strategy to minimize redundant API calls and improve performance:

### Client-Side Caching

We use SWR (Stale-While-Revalidate) for client-side data fetching and caching. This is implemented in the `useApi` hook in `hooks/useApi.ts`, which provides:

- Automatic caching of API responses
- Configurable cache expiration (default: 5 minutes)
- Deduplication of requests (multiple components requesting the same data will only trigger one API call)
- Options to control revalidation behavior (on focus, reconnect, etc.)

Example usage:

```tsx
// In a component
const { data, error, isLoading } = useApi<ProfileData>('/profile', {
  dedupingInterval: 300000, // 5 minutes cache
});
```

### Server-Side Caching

API routes in `app/api/` use a custom memory cache implementation (`lib/cache.ts`) that:

- Caches responses from the backend API
- Uses a configurable expiration time (default: 5 minutes)
- Adds appropriate cache headers to responses for CDN caching
- Provides utilities for cache invalidation when needed

### Cache Headers

Our API responses include proper `Cache-Control` headers to enable CDN and browser caching:

```
Cache-Control: public, max-age=300, s-maxage=300, stale-while-revalidate=3600
```

This configuration:
- Allows public caching (by CDNs, proxies, etc.)
- Sets a maximum age of 5 minutes for the cache
- Allows serving stale content for up to an hour while fetching fresh content in the background

### Cache Invalidation

To manually invalidate cache for testing or after content updates:

1. Server-side cache can be cleared by restarting the server
2. Client-side cache can be refreshed by calling the `refresh` function returned by the `useApi` hook
3. Browser cache can be bypassed by adding a unique timestamp to API requests
