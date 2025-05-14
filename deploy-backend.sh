#!/bin/bash
set -e

# Configuration
PROJECT_ID="portfolio-458717" # Your actual project ID
SERVICE_NAME="portfolio-backend"
REGION="us-central1"

# Change to the backend directory
cd backend

# Load environment variables
if [ -f ".env" ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' .env | xargs)
fi

# Build and push the container image
echo "Building and pushing backend container image..."
~/downloads/google-cloud-sdk/bin/gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME .

# Create environment variables string
ENV_VARS="MAIN_MODULE=app.main:app"
ENV_VARS="$ENV_VARS,LINKEDIN_PROFILE_URL=$LINKEDIN_PROFILE_URL"
ENV_VARS="$ENV_VARS,LINKEDIN_EMAIL=$LINKEDIN_EMAIL"
ENV_VARS="$ENV_VARS,GITHUB_URL=$GITHUB_URL"
ENV_VARS="$ENV_VARS,GOOGLE_CREDENTIALS_PATH=$GOOGLE_CREDENTIALS_PATH"
ENV_VARS="$ENV_VARS,SHEET_ID=$SHEET_ID"
ENV_VARS="$ENV_VARS,SHEET_NAME=$SHEET_NAME"
ENV_VARS="$ENV_VARS,HOST=$HOST"
ENV_VARS="$ENV_VARS,DEBUG=$DEBUG"

# Add Telegram configuration if available
if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
  ENV_VARS="$ENV_VARS,TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN"
fi

if [ -n "$TELEGRAM_CHAT_ID" ]; then
  # Remove any trailing % if present
  TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID%%%}
  ENV_VARS="$ENV_VARS,TELEGRAM_CHAT_ID=$TELEGRAM_CHAT_ID"
fi

# Construct environment variables
ENV_VARS="--update-env-vars GOOGLE_SHEETS_ID=${GOOGLE_SHEETS_ID}"
ENV_VARS="${ENV_VARS},TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}"
ENV_VARS="${ENV_VARS},TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID}"
ENV_VARS="${ENV_VARS},GOOGLECLOUD_API_KEY=${GOOGLECLOUD_API_KEY}"
ENV_VARS="${ENV_VARS},TELEGRAM_ADMIN_CHAT_ID=${TELEGRAM_ADMIN_CHAT_ID}"

# Deploy to Cloud Run with secrets and environment variables
echo "Deploying to Cloud Run..."
~/downloads/google-cloud-sdk/bin/gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --cpu=1 \
  --memory=1Gi \
  --timeout=300 \
  --min-instances=0 \
  --max-instances=2 \
  --set-env-vars="$ENV_VARS" \
  --set-secrets="GOOGLE_SHEETS_CREDENTIALS=GOOGLE_SHEETS_CREDENTIALS:latest,LINKEDIN_PASSWORD=LINKEDIN_PASSWORD:latest" \
  --command="/app/startup.sh" \
  --cpu-boost \
  --execution-environment=gen2

# Get the URL of the deployed service
SERVICE_URL=$(~/downloads/google-cloud-sdk/bin/gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format "value(status.url)")
echo "Backend deployed successfully at: $SERVICE_URL"
echo "Save this URL as you'll need it for the frontend deployment!"

# Return to original directory
cd .. 