#!/bin/bash
set -e

# Variables - edit these as needed
PROJECT_ID="portfolio-458717"
SERVICE_NAME="portfolio-frontend"
REGION="us-central1"
BACKEND_URL="https://portfolio-backend-824962762241.us-central1.run.app"
IMAGE_TAG="latest-$(date +%Y%m%d-%H%M%S)"
IMAGE_URL="gcr.io/$PROJECT_ID/$SERVICE_NAME:$IMAGE_TAG"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║ 🚀 Portfolio Frontend Deployment Tool                          ║"
echo "║ Target: Google Cloud Run                                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Project: $PROJECT_ID"
echo "Image: $IMAGE_URL"
echo "Backend URL: $BACKEND_URL"
echo ""

# Build with Cloud Build (faster, more reliable than local Docker)
echo "📦 Building with Cloud Build..."
gcloud builds submit --tag $IMAGE_URL

# Deploy to Cloud Run with production configuration
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_URL \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_API_URL=$BACKEND_URL"

# Get deployment URL
URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

echo "✅ Deployment completed successfully!"
echo "🌐 Service URL: $URL"

# Verify the deployment is accessible
echo "🔍 Verifying deployment..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL)
if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Service is responding with status 200"
else
  echo "⚠️ Service returned status code: $HTTP_STATUS"
fi

# Verify custom domain mappings
echo "🔍 Checking domain mappings..."
MAPPINGS=$(gcloud beta run domain-mappings list --platform managed --region $REGION --filter="SERVICE:$SERVICE_NAME" --format="list(DOMAIN)")

if [ -n "$MAPPINGS" ]; then
  echo "🌐 Custom domain mappings:"
  echo "$MAPPINGS"
else
  echo "⚠️ No custom domain mappings found! Creating them now..."
  
  # Add mappings if they don't exist
  echo "Creating mapping for www.bishalbudhathoki.com..."
  gcloud beta run domain-mappings create \
    --service=$SERVICE_NAME \
    --domain=www.bishalbudhathoki.com \
    --region=$REGION
  
  echo "Creating mapping for bishalbudhathoki.com..."
  gcloud beta run domain-mappings create \
    --service=$SERVICE_NAME \
    --domain=bishalbudhathoki.com \
    --region=$REGION
  
  echo "✅ Domain mappings created."
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║ 🎉 Deployment Complete!                                        ║"
echo "║                                                                ║"
echo "║ Notes:                                                         ║"
echo "║ - Custom domain may take a few minutes to update               ║"
echo "║ - Check logs in GCP Console if issues persist                  ║"
echo "╚════════════════════════════════════════════════════════════════╝" 