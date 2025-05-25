#!/bin/bash
set -e

# Variables
PROJECT_ID="portfolio-458717"
SERVICE_NAME="portfolio-frontend"
REGION="us-central1"
# Use environment variable if available, otherwise use a placeholder that will be replaced
BACKEND_URL=${BACKEND_URL:-$(gcloud run services describe portfolio-backend --platform managed --region $REGION --format 'value(status.url)')}

echo "🚀 Deploying frontend to Google Cloud Run"
echo "Project: $PROJECT_ID"
echo "Backend URL: $BACKEND_URL"
echo ""

# Step 1: Build the Docker image using Google Cloud Build
echo "☁️ Building Docker image using Google Cloud Build..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME --build-arg NEXT_PUBLIC_API_URL=$BACKEND_URL .

# Step 2: Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "NEXT_PUBLIC_API_URL=$BACKEND_URL"

# Get the URL of the deployed service
URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

# Verify custom domain mappings
echo "🔍 Checking custom domain mappings..."
MAPPINGS=$(gcloud beta run domain-mappings list --platform managed --region $REGION --filter="SERVICE:$SERVICE_NAME" --format="list(DOMAIN)")

echo ""
echo "✅ Deployment completed!"
echo "🌐 Your frontend is now available at: $URL"
echo "🔌 Connected to the backend at: $BACKEND_URL"

if [ -z "$MAPPINGS" ]; then
  echo "⚠️ No custom domain mappings found!"
else
  echo "🌐 Custom domain mappings:"
  echo "$MAPPINGS"
fi 