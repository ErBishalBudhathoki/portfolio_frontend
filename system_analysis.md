# Portfolio Project System Analysis

## Project Overview
- **Type**: Full-stack web portfolio application
- **Frontend**: Next.js 14+ with TypeScript, React, Tailwind CSS
- **Backend**: FastAPI (Python) with Google Sheets integration
- **Platform**: Web application (not mobile iOS/Android)
- **Architecture**: Microservices with frontend and backend separation

## Technology Stack

### Frontend Technologies
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide React icons
- **State Management**: React hooks, SWR for data fetching
- **Build Tool**: Next.js built-in bundler
- **Package Manager**: npm

### Backend Technologies
- **Framework**: FastAPI (Python)
- **Language**: Python 3.8+
- **Database**: Google Sheets (as database)
- **Authentication**: Firebase Admin SDK
- **External APIs**: LinkedIn scraping, Google Sheets API
- **Server**: Uvicorn ASGI server
- **Deployment**: Google Cloud Run

## Project Structure

### Frontend Structure
```
frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (proxy to backend)
│   │   ├── blog/          # Blog API endpoints
│   │   ├── health/        # Health check
│   │   └── profile/       # Profile API
│   ├── blog/              # Blog listing page
│   ├── blogs/             # Alternative blog page
│   ├── admin/             # Admin dashboard
│   ├── contact/           # Contact page
│   ├── projects/          # Projects page
│   └── skills/            # Skills page
├── components/            # Reusable React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
└── public/                # Static assets
```

### Backend Structure
```
backend/
├── app/
│   ├── routes/            # API route handlers
│   ├── utils/             # Utility functions
│   ├── main.py            # FastAPI application entry
│   ├── config.py          # Configuration settings
│   └── google_sheet.py    # Google Sheets integration
├── credentials/           # Google service account credentials
├── data/                  # Local data storage
└── requirements.txt       # Python dependencies
```

## Key Features

### Blog System
- **Regular Blogs**: Fetched from Google Sheets via `/api/blog`
- **Detailed Blogs**: Rich content blogs via `/api/blog/detailed`
- **Blog Pages**: 
  - `/blog` - Main blog listing (client-side)
  - `/blogs` - Alternative blog view (server-side)
  - `/blog/[slug]` - Individual blog posts

### API Architecture
- **Frontend API Routes**: Proxy requests to backend
- **Backend Endpoints**: Direct Google Sheets integration
- **Caching**: Frontend implements caching with SWR
- **Error Handling**: Comprehensive error handling and fallbacks

## Environment Configuration

### Frontend Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API URL (http://localhost:8000 for local)
- `NEXT_PUBLIC_SITE_NAME`: Site name for branding

### Backend Environment Variables
- `LINKEDIN_PROFILE_URL`: LinkedIn profile for scraping
- `LINKEDIN_EMAIL`: LinkedIn login credentials
- `LINKEDIN_PASSWORD`: LinkedIn login credentials
- `GOOGLE_CREDENTIALS_PATH`: Path to Google service account JSON
- `SHEET_ID`: Google Sheets document ID
- `SHEET_NAME`: Google Sheets tab name
- `HOST`: Server host (0.0.0.0)
- `PORT`: Server port (8000)
- `DEBUG`: Debug mode flag

## Development Setup

### Local Development
- **Start Script**: `./start_local_dev.sh`
- **Frontend URL**: http://localhost:3000
- **Backend URL**: http://localhost:8000
- **Prerequisites**: Python 3.8+, Node.js 18+, npm, pip

### Key Development Commands
```bash
# Start both frontend and backend
./start_local_dev.sh

# Frontend only
cd frontend && npm run dev

# Backend only
cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Recent Issues Fixed

### Blog Page API Endpoints Issue
- **Problem**: Blog page was calling `/blog` and `/blog/detailed` instead of `/api/blog` and `/api/blog/detailed`
- **Solution**: Updated API calls in `/app/blog/page.tsx` to use correct endpoints
- **Root Cause**: Mismatch between frontend API routes and client-side fetch calls

## Deployment

### Production Environment
- **Frontend**: Google Cloud Run
- **Backend**: Google Cloud Run
- **Domain**: Custom domain with Cloud Run
- **CI/CD**: Cloud Build with GitHub integration

## Notes for Future Development

1. **Mobile Development**: This is a web application, not iOS/Android native
2. **API Consistency**: Always use `/api/*` prefix for frontend API routes
3. **Caching Strategy**: Frontend uses SWR with 5-minute cache intervals
4. **Error Handling**: Comprehensive error boundaries and fallback UIs
5. **Google Sheets**: Used as primary data source for blog content
6. **Authentication**: Firebase Admin SDK for backend authentication

## System Requirements

### Development
- **OS**: macOS (current development environment)
- **Node.js**: 18+
- **Python**: 3.8+
- **Package Managers**: npm, pip

### Production
- **Container**: Docker containers on Google Cloud Run
- **Scaling**: Auto-scaling based on traffic
- **Monitoring**: Google Cloud monitoring and logging

Last Updated: 2025-01-19