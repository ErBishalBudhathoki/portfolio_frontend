#!/bin/bash
set -e

GCLOUD_BIN="${GCLOUD_BIN:-$(command -v gcloud)}"

if [ -z "$GCLOUD_BIN" ]; then
  echo "gcloud CLI not found in PATH"
  exit 1
fi

# Configuration
PROJECT_ID=$("$GCLOUD_BIN" config get-value project)
REGION="us-central1"
SERVICE_NAME="portfolio-frontend"
BACKEND_SERVICE_NAME="portfolio-backend"
BACKEND_URL="${BACKEND_URL:-$("$GCLOUD_BIN" run services describe "$BACKEND_SERVICE_NAME" --region "$REGION" --format 'value(status.url)' 2>/dev/null)}"

if [ -z "$BACKEND_URL" ]; then
  echo "Backend URL not found. Set BACKEND_URL or deploy the backend service first."
  exit 1
fi

echo "🚀 Starting deployment process..."

# Build and push the container
echo "📦 Building and pushing container..."
"$GCLOUD_BIN" builds submit --config cloudbuild.yaml

# Wait for build to complete
echo "⏳ Waiting for build to complete..."
sleep 10

# Update the Cloud Run service
echo "🔄 Updating Cloud Run service..."
"$GCLOUD_BIN" run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/portfolio-frontend:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars NEXT_PUBLIC_API_URL="$BACKEND_URL"

# Get the service URL
SERVICE_URL=$("$GCLOUD_BIN" run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo "✅ Deployment completed!"
echo "🌎 Service URL: $SERVICE_URL"
