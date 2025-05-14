#!/bin/bash
set -e

# Configuration
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
SERVICE_NAME="portfolio-frontend"

echo "🚀 Starting deployment process..."

# Build and push the container
echo "📦 Building and pushing container..."
gcloud builds submit --config cloudbuild.yaml

# Wait for build to complete
echo "⏳ Waiting for build to complete..."
sleep 10

# Update the Cloud Run service
echo "🔄 Updating Cloud Run service..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/portfolio-frontend:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars NEXT_PUBLIC_API_URL=https://portfolio-backend-824962762241.us-central1.run.app \
  --set-env-vars NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY} \
  --set-env-vars NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN} \
  --set-env-vars NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID} \
  --set-env-vars NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET} \
  --set-env-vars NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID} \
  --set-env-vars NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID} \
  --set-env-vars NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo "✅ Deployment completed!"
echo "🌎 Service URL: $SERVICE_URL"

# Verify deployment
echo "🔍 Verifying deployment..."
curl -s -o /dev/null -w "%{http_code}" $SERVICE_URL 