#!/bin/bash
set -e

# Variables
PROJECT_ID="portfolio-458717"
SERVICE_NAME="portfolio-frontend"
REGION="us-central1"
BACKEND_URL="https://portfolio-backend-824962762241.us-central1.run.app"
TAG="stable-$(date +%Y%m%d-%H%M%S)"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME:$TAG"
LOCAL_PORT=3001

# Step 1: Build the Docker image locally
echo "📦 Building Docker image locally..."
docker build -t $IMAGE_NAME .

# Step 2: Test the Docker image locally
echo "🧪 Testing Docker image locally..."
echo "Starting the container for testing. Press Ctrl+C when done testing."
echo "Container will be available at http://localhost:$LOCAL_PORT"

# Run the container in detached mode
CONTAINER_ID=$(docker run -d -p $LOCAL_PORT:3000 \
  -e NEXT_PUBLIC_API_URL=$BACKEND_URL \
  $IMAGE_NAME)

# Show logs
docker logs -f $CONTAINER_ID &
DOCKER_LOGS_PID=$!

# Wait for the user to test and press Ctrl+C
echo "Container is running. Test the app and press Enter to continue with deployment or Ctrl+C to abort."
read -r

# Stop following logs
kill $DOCKER_LOGS_PID

# Stop and remove the container
docker stop $CONTAINER_ID
docker rm $CONTAINER_ID

# Step 3: Ask for confirmation before deploying
echo "Did the local testing pass? Deploy to Google Cloud? (y/n)"
read -r DEPLOY_CONFIRMATION

if [[ "$DEPLOY_CONFIRMATION" != "y" && "$DEPLOY_CONFIRMATION" != "Y" ]]; then
  echo "Deployment canceled"
  exit 0
fi

# Step 4: Configure Docker to use gcloud credentials
echo "🔑 Configuring Docker authentication..."
gcloud auth configure-docker

# Step 5: Push the image to Google Container Registry
echo "☁️ Pushing image to Google Container Registry..."
docker push $IMAGE_NAME

# Step 6: Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "NEXT_PUBLIC_API_URL=$BACKEND_URL" \
  --set-env-vars-from-file=- <<EOF
PORT=8080
EOF

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
  echo "⚠️ No custom domain mappings found! Setting up domain mappings..."
  # Set up domain mappings if they don't exist
  gcloud beta run domain-mappings create \
    --service=$SERVICE_NAME \
    --domain=www.bishalbudhathoki.com \
    --region=$REGION
  
  gcloud beta run domain-mappings create \
    --service=$SERVICE_NAME \
    --domain=bishalbudhathoki.com \
    --region=$REGION
  
  echo "✅ Domain mappings created. DNS records may take time to propagate."
else
  echo "🌐 Custom domain mappings:"
  echo "$MAPPINGS"
fi 