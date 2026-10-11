#!/bin/bash
set -e

GCLOUD_BIN="${GCLOUD_BIN:-$(command -v gcloud)}"

if [ -z "$GCLOUD_BIN" ]; then
  echo "gcloud CLI not found in PATH"
  exit 1
fi

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
"$GCLOUD_BIN" builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME .

# Construct environment variables
ENV_ITEMS=("MAIN_MODULE=app.main:app")

add_env_var() {
  local key="$1"
  local value="$2"
  if [ -n "$value" ]; then
    ENV_ITEMS+=("${key}=${value}")
  fi
}

add_env_var "LINKEDIN_PROFILE_URL" "$LINKEDIN_PROFILE_URL"
add_env_var "LINKEDIN_EMAIL" "$LINKEDIN_EMAIL"
add_env_var "GITHUB_URL" "$GITHUB_URL"
add_env_var "GITHUB_USERNAME" "$GITHUB_USERNAME"
add_env_var "GITHUB_TOKEN" "$GITHUB_TOKEN"
add_env_var "GOOGLE_CREDENTIALS_PATH" "$GOOGLE_CREDENTIALS_PATH"
add_env_var "GOOGLE_SHEETS_ID" "$GOOGLE_SHEETS_ID"
add_env_var "GOOGLECLOUD_API_KEY" "$GOOGLECLOUD_API_KEY"
add_env_var "SHEET_ID" "$SHEET_ID"
add_env_var "SHEET_NAME" "$SHEET_NAME"
add_env_var "HOST" "$HOST"
add_env_var "DEBUG" "$DEBUG"
add_env_var "TELEGRAM_BOT_TOKEN" "$TELEGRAM_BOT_TOKEN"
add_env_var "TELEGRAM_ADMIN_CHAT_ID" "$TELEGRAM_ADMIN_CHAT_ID"

if [ -n "$TELEGRAM_CHAT_ID" ]; then
  TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID%%%}
  add_env_var "TELEGRAM_CHAT_ID" "$TELEGRAM_CHAT_ID"
fi

ENV_VARS=$(IFS=,; echo "${ENV_ITEMS[*]}")

# Deploy to Cloud Run with secrets and environment variables
echo "Deploying to Cloud Run..."
"$GCLOUD_BIN" run deploy $SERVICE_NAME \
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
SERVICE_URL=$("$GCLOUD_BIN" run services describe $SERVICE_NAME --platform managed --region $REGION --format "value(status.url)")
echo "Backend deployed successfully at: $SERVICE_URL"
echo "Save this URL as you'll need it for the frontend deployment!"

# Return to original directory
cd .. 
