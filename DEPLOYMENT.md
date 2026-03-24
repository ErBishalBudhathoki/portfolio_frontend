# Portfolio Application Deployment Documentation

This document provides a detailed overview of how the portfolio application (frontend and backend) was deployed to Google Cloud Run, including all commands used, configuration changes made, and domain setup.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Backend Deployment](#backend-deployment)
   - [Backend Configuration](#backend-configuration)
   - [Building and Deploying the Backend](#building-and-deploying-the-backend)
3. [Frontend Deployment](#frontend-deployment)
   - [Frontend Configuration](#frontend-configuration)
   - [Building and Deploying the Frontend](#building-and-deploying-the-frontend)
4. [Domain Configuration](#domain-configuration)
   - [Domain Verification](#domain-verification)
   - [Custom Domain Mapping](#custom-domain-mapping)
   - [DNS Configuration](#dns-configuration)
   - [Root Domain to WWW Redirection](#root-domain-to-www-redirection)
5. [Troubleshooting](#troubleshooting)
6. [Maintenance and Updates](#maintenance-and-updates)

## Project Overview

The portfolio application consists of two main components:

- **Frontend**: A Next.js application built with React, deployed to Google Cloud Run
- **Backend**: A FastAPI application built with Python, deployed to Google Cloud Run

Both components are containerized using Docker and deployed as independent services in Google Cloud Run.

## Backend Deployment

### Backend Configuration

The backend application uses a simplified FastAPI application for testing and initial deployment. The main entry point is located at `backend/app/simple_main.py`:

```python
from fastapi import FastAPI
import os
from datetime import datetime

app = FastAPI()

@app.get("/")
async def root():
    return {
        "message": "Portfolio API is running",
        "port": os.environ.get("PORT", "No PORT env var"),
        "host": os.environ.get("HOST", "No HOST env var")
    }

@app.get("/health")
async def health():
    return {"status": "ok"} 

@app.get("/status")
async def status():
    return {
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "service": "portfolio-backend"
    } 
```

The Docker configuration for the backend is defined in `backend/Dockerfile`:

```dockerfile
# Use Python 3.9 as the base image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements.txt
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Command to run the application
CMD ["uvicorn", "app.simple_main:app", "--host", "0.0.0.0", "--port", "8080"]
```

The required Python packages are defined in `backend/requirements.txt`:
```
fastapi>=0.68.0
uvicorn>=0.15.0
pandas>=1.3.0
requests>=2.28.0
gspread>=5.4.0
google-auth>=2.6.0
```

### Building and Deploying the Backend

To build and deploy the backend to Google Cloud Run, the following commands were used:

```bash
# Navigate to the backend directory
cd backend

# Submit the build to Google Cloud Build
~/downloads/google-cloud-sdk/bin/gcloud builds submit --tag gcr.io/portfolio-458717/portfolio-backend .

# Deploy the container to Google Cloud Run
~/downloads/google-cloud-sdk/bin/gcloud run deploy portfolio-backend \
  --image gcr.io/portfolio-458717/portfolio-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

After deployment, the backend service was available at the following URL:
```
https://portfolio-backend-824962762241.us-central1.run.app
```

## Frontend Deployment

### Frontend Configuration

The frontend application is a Next.js application with a custom configuration. The main configuration file is located at `frontend/next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'media.licdn.com',  // For LinkedIn profile images
      'static.licdn.com', // For LinkedIn content
      'platform-lookaside.fbsbx.com', // For profile images that might be from Facebook
      'lh3.googleusercontent.com', // For Google-hosted images
      'i.imgur.com', // For Imgur-hosted images
      'drive.google.com', // For Google Drive images
      'firebasestorage.googleapis.com', // For Firebase Storage images
      'ui-avatars.com', // For placeholder avatars
    ],
  },
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*` : 'http://localhost:8000/api/:path*'
      }
    ];
  }
};

export default nextConfig;
```

The Docker configuration for the frontend is defined in `frontend/Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Set environment variables for React compatibility
ENV NODE_OPTIONS="--max_old_space_size=4096"
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build application (skipping linting and type checking)
RUN npm run build -- --no-lint

# Expose the port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
```

### Building and Deploying the Frontend

To build and deploy the frontend to Google Cloud Run, the following commands were used:

```bash
# Navigate to the frontend directory
cd frontend

# Set the backend URL as an environment variable for the build
BACKEND_URL="https://portfolio-backend-824962762241.us-central1.run.app"

# Submit the build to Google Cloud Build
~/downloads/google-cloud-sdk/bin/gcloud builds submit --tag gcr.io/portfolio-458717/portfolio-frontend .

# Deploy the container to Google Cloud Run with the backend URL as an environment variable
~/downloads/google-cloud-sdk/bin/gcloud run deploy portfolio-frontend \
  --image gcr.io/portfolio-458717/portfolio-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NEXT_PUBLIC_API_URL=https://portfolio-backend-824962762241.us-central1.run.app"
```

After deployment, the frontend service was available at the following URL:
```
https://portfolio-frontend-824962762241.us-central1.run.app
```

## Domain Configuration

### Domain Verification

Before mapping a custom domain to the Cloud Run service, the domain ownership needed to be verified:

```bash
# Initiate domain verification process
~/downloads/google-cloud-sdk/bin/gcloud domains verify www.bishalbudhathoki.com
```

This command opened a browser window to Google Search Console, where the domain ownership was verified using one of the available methods (DNS verification, HTML file upload, or meta tag).

### Custom Domain Mapping

After domain verification, the custom domain was mapped to the frontend service:

```bash
# Create domain mapping for the frontend service
~/downloads/google-cloud-sdk/bin/gcloud beta run domain-mappings create \
  --service=portfolio-frontend \
  --domain=www.bishalbudhathoki.com \
  --region=us-central1
```

### DNS Configuration

After creating the domain mapping, DNS records needed to be configured at the domain registrar. The following CNAME record was added:

```
Type: CNAME
Name: www
Value: ghs.googlehosted.com.
TTL: 3600 (or default)
```

To verify that the DNS record was properly configured, this command was used:

```bash
# Verify DNS configuration
dig www.bishalbudhathoki.com CNAME
```

After DNS configuration, the SSL certificate provisioning process began automatically. This process can take anywhere from a few minutes to 24 hours to complete. The status can be checked using:

```bash
# Check domain mapping status
~/downloads/google-cloud-sdk/bin/gcloud beta run domain-mappings describe \
  --domain=www.bishalbudhathoki.com \
  --region=us-central1
```

Once the certificate is provisioned, the website will be accessible at:
```
https://www.bishalbudhathoki.com
```

### Root Domain to WWW Redirection

To set up redirection from the root domain (bishalbudhathoki.com) to the www subdomain (www.bishalbudhathoki.com), the following steps were taken:

#### 1. Verify the Root Domain

```bash
# Initiate domain verification process for the root domain
~/downloads/google-cloud-sdk/bin/gcloud domains verify bishalbudhathoki.com
```

#### 2. Map the Root Domain to Cloud Run

```bash
# Create domain mapping for the root domain to the frontend service
~/downloads/google-cloud-sdk/bin/gcloud beta run domain-mappings create \
  --service=portfolio-frontend \
  --domain=bishalbudhathoki.com \
  --region=us-central1
```

#### 3. Configure DNS for the Root Domain

For the root domain, the following A records were added to the DNS settings:

```
NAME                RECORD TYPE  CONTENTS
(root/@)            A            216.239.32.21
(root/@)            A            216.239.34.21
(root/@)            A            216.239.36.21
(root/@)            A            216.239.38.21
```

For IPv6 support, these AAAA records were also added:

```
(root/@)            AAAA         2001:4860:4802:32::15
(root/@)            AAAA         2001:4860:4802:34::15
(root/@)            AAAA         2001:4860:4802:36::15
(root/@)            AAAA         2001:4860:4802:38::15
```

#### 4. Configure Redirection in Next.js

To handle the redirection in the application, the `next.config.mjs` file was updated to include a redirect configuration:

```javascript
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
```

This configuration ensures that any request to the root domain (bishalbudhathoki.com) will be permanently redirected to the www subdomain (www.bishalbudhathoki.com) while preserving the path.

#### 5. Redeploy the Frontend

After updating the Next.js configuration, the frontend was redeployed:

```bash
# Navigate to the frontend directory
cd frontend

# Submit the new build
~/downloads/google-cloud-sdk/bin/gcloud builds submit --tag gcr.io/portfolio-458717/portfolio-frontend .

# Deploy the new version
~/downloads/google-cloud-sdk/bin/gcloud run deploy portfolio-frontend \
  --image gcr.io/portfolio-458717/portfolio-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NEXT_PUBLIC_API_URL=https://portfolio-backend-824962762241.us-central1.run.app"
```

After these steps and once the SSL certificate for the root domain is provisioned, visitors to bishalbudhathoki.com will be automatically redirected to www.bishalbudhathoki.com.

## Troubleshooting

### Backend Issues

If the backend is not responding correctly, you can check the logs using:

```bash
# View backend logs
~/downloads/google-cloud-sdk/bin/gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=portfolio-backend" --limit=50
```

### Frontend Issues

If the frontend is not rendering correctly, you can check the frontend logs:

```bash
# View frontend logs
~/downloads/google-cloud-sdk/bin/gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=portfolio-frontend" --limit=50
```

### Domain Mapping Issues

If the custom domain is not working correctly:

1. Verify DNS propagation:
```bash
dig www.bishalbudhathoki.com CNAME
```

2. Check certificate provisioning status:
```bash
~/downloads/google-cloud-sdk/bin/gcloud beta run domain-mappings describe \
  --domain=www.bishalbudhathoki.com \
  --region=us-central1
```

## Maintenance and Updates

### Updating the Backend

To update the backend application:

```bash
# Navigate to the backend directory
cd backend

# Make your changes

# Submit the new build
~/downloads/google-cloud-sdk/bin/gcloud builds submit --tag gcr.io/portfolio-458717/portfolio-backend .

# Deploy the new version
~/downloads/google-cloud-sdk/bin/gcloud run deploy portfolio-backend \
  --image gcr.io/portfolio-458717/portfolio-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Updating the Frontend

To update the frontend application:

```bash
# Navigate to the frontend directory
cd frontend

# Make your changes

# Submit the new build
~/downloads/google-cloud-sdk/bin/gcloud builds submit --tag gcr.io/portfolio-458717/portfolio-frontend .

# Deploy the new version
~/downloads/google-cloud-sdk/bin/gcloud run deploy portfolio-frontend \
  --image gcr.io/portfolio-458717/portfolio-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NEXT_PUBLIC_API_URL=https://portfolio-backend-824962762241.us-central1.run.app"
```

---

## Conclusion

This document provides a comprehensive overview of the deployment process for the portfolio application. By following these steps, the application was successfully deployed to Google Cloud Run and configured with a custom domain. 

# Portfolio Deployment Guide

This document contains comprehensive instructions for deploying the portfolio application to Google Cloud Run.

## Prerequisites

1. Google Cloud SDK installed (`gcloud` command)
2. Docker installed
3. Node.js and npm for frontend development
4. Python 3.8+ for backend development
5. A Google Cloud project with billing enabled
6. Google Sheets API enabled in your Google Cloud project
7. Proper credentials for Google Sheets API (service account)

## Quick Deployment

For a quick deployment of both frontend and backend services:

```bash
./deploy-all.sh
```

This script will handle both backend and frontend deployment with proper configuration.

## Manual Deployment Steps

### Backend Deployment

1. Set up Google Sheets credentials:
   ```bash
   ./update-google-credentials.sh
   ```

2. Deploy the backend service:
   ```bash
   ./deploy-backend.sh
   ```

3. Note the backend URL provided in the output.

### Frontend Deployment

1. Deploy the frontend using the backend URL:
   ```bash
   cd frontend
   ./deploy.sh
   ```

2. The Cloud Run URL will be displayed after deployment.

## Environment Variables

### Backend Environment Variables

The backend requires the following environment variables:

- `LINKEDIN_PROFILE_URL`: LinkedIn profile URL to scrape
- `LINKEDIN_EMAIL`: LinkedIn login email
- `LINKEDIN_PASSWORD`: LinkedIn login password (stored as a secret)
- `GITHUB_URL`: GitHub profile URL
- `GOOGLE_CREDENTIALS_PATH`: Path to Google credentials JSON
- `SHEET_ID`: Google Sheet ID
- `SHEET_NAME`: Google Sheet name/tab
- `HOST`: Host to bind the server to (0.0.0.0 for most cases)
- `PORT`: Port to run the server on (8000 for local development)
- `DEBUG`: Set to True for development

### Frontend Environment Variables

- `NEXT_PUBLIC_API_URL`: URL of the backend API
- `NEXT_PUBLIC_GITHUB_URL`: GitHub profile URL
- `NEXT_PUBLIC_TWITTER_URL`: Twitter profile URL
- `NEXT_PUBLIC_LINKEDIN_URL`: LinkedIn profile URL

## Troubleshooting

If you encounter issues during deployment, check the following:

1. **Authentication issues**: Make sure you are logged in to Google Cloud with proper permissions
   ```bash
   gcloud auth login
   ```

2. **Build failures**: Check the build logs for detailed errors
   ```bash
   gcloud builds list
   ```

3. **Runtime errors**: Check the Cloud Run logs for each service
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=portfolio-backend"
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=portfolio-frontend"
   ```

## Custom Domains

To set up a custom domain for your Cloud Run service:

1. Verify domain ownership in Google Cloud Console
2. Map the domain to your Cloud Run service:
   ```bash
   gcloud beta run domain-mappings create --service portfolio-frontend --domain your-domain.com
   ```
3. Add the DNS records provided by Google to your domain registrar
4. Wait for DNS propagation (can take up to 24-48 hours)

## Profile Image Issues

If profile images aren't loading, check:

1. The domain is properly configured in Next.js config:
   ```js
   // frontend/next.config.mjs
   const nextConfig = {
     images: {
       domains: [
         'media.licdn.com',
         'static.licdn.com',
         'platform-lookaside.fbsbx.com',
         'lh3.googleusercontent.com',
         'i.imgur.com',
         'drive.google.com',
         'firebasestorage.googleapis.com',
         'ui-avatars.com',
       ],
     },
   }
   ```

2. Images are being loaded with proper Image components in Next.js

## Local Development

To start local development:

```bash
./start_local_dev.sh
```

This will:
1. Check prerequisites
2. Start the backend server
3. Start the frontend development server
4. Configure the environment for local development

## Telegram Notifications

To set up Telegram notifications:

```bash
python setup_telegram.py
```

Follow the prompts to create a bot and configure it for notifications.

## Security Notes

1. Never commit sensitive credentials to Git
2. Use Google Cloud Secret Manager for sensitive data
3. Set appropriate access controls for your Google Cloud resources

## Performance Optimization

1. Use `--min-instances=1` with Cloud Run to keep the service warm
2. Configure CPU and memory based on your workload needs
3. Use CDN for static assets 