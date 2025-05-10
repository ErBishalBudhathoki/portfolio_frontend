#!/bin/bash
set -e

PROD_BACKEND_URL="https://portfolio-backend-ixvhxw7sqq-uc.a.run.app"
LOCAL_BACKEND_URL="http://localhost:8000"
PROD_FRONTEND_URL="https://portfolio-frontend-ixvhxw7sqq-uc.a.run.app"
LOCAL_FRONTEND_URL="http://localhost:3000"

check_endpoint() {
  local url=$1
  local description=$2
  local hide_output=${3:-false}
  
  echo "Testing $description: $url"
  
  if [[ $hide_output == true ]]; then
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    echo "Response code: $response"
  else
    echo "Response:"
    curl -s "$url" | head -n 20
    echo -e "\n...(response truncated)...\n"
  fi
  
  echo "--------------------------"
}

echo "=== Portfolio Environment Diagnostic Tool ==="
echo "This tool checks both local and production environments to help debug issues"
echo "==================================================="

# Check if local backend is running
local_backend_running=false
if curl -s "$LOCAL_BACKEND_URL/health" > /dev/null 2>&1; then
  echo "✅ Local backend is running"
  local_backend_running=true
else
  echo "❌ Local backend is not running"
fi

# Check if local frontend is running
local_frontend_running=false
if curl -s "$LOCAL_FRONTEND_URL" > /dev/null 2>&1; then
  echo "✅ Local frontend is running"
  local_frontend_running=true
else
  echo "❌ Local frontend is not running"
fi

echo -e "\n=== Production Backend Checks ==="
check_endpoint "$PROD_BACKEND_URL/health" "Health endpoint" true
check_endpoint "$PROD_BACKEND_URL/api/profile" "Profile API" 

echo -e "\n=== Production Frontend ==="
echo "Frontend URL: $PROD_FRONTEND_URL"
echo "To open in browser: open $PROD_FRONTEND_URL"

if [ "$local_backend_running" = true ]; then
  echo -e "\n=== Local Backend Checks ==="
  check_endpoint "$LOCAL_BACKEND_URL/health" "Health endpoint" true
  check_endpoint "$LOCAL_BACKEND_URL/api/profile" "Profile API"
fi

# Check if images exist in production and local
echo -e "\n=== Image Availability Checks ==="
IMAGE_PATH="/images/01.png"
PROD_IMAGE_URL="$PROD_FRONTEND_URL$IMAGE_PATH"
LOCAL_IMAGE_URL="$LOCAL_FRONTEND_URL$IMAGE_PATH"

# Check production image
echo "Checking production image: $PROD_IMAGE_URL"
prod_image_response=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_IMAGE_URL")
if [[ $prod_image_response == 200 ]]; then
  echo "✅ Production image accessible"
else
  echo "❌ Production image returned: $prod_image_response"
fi

# Check local image if frontend is running
if [ "$local_frontend_running" = true ]; then
  echo "Checking local image: $LOCAL_IMAGE_URL"
  local_image_response=$(curl -s -o /dev/null -w "%{http_code}" "$LOCAL_IMAGE_URL")
  if [[ $local_image_response == 200 ]]; then
    echo "✅ Local image accessible"
  else
    echo "❌ Local image returned: $local_image_response"
  fi
fi

echo -e "\n=== Telegram Bot Status ==="
if [ -f "backend/.env" ]; then
  # Get values using grep instead of sourcing the file
  TELEGRAM_BOT_TOKEN=$(grep -o 'TELEGRAM_BOT_TOKEN=.*' backend/.env | cut -d= -f2)
  TELEGRAM_CHAT_ID=$(grep -o 'TELEGRAM_CHAT_ID=.*' backend/.env | cut -d= -f2 | tr -d '%')
  
  if [[ -n "$TELEGRAM_BOT_TOKEN" && -n "$TELEGRAM_CHAT_ID" ]]; then
    echo "✅ Telegram configuration found in .env file"
    echo "Bot Token: ${TELEGRAM_BOT_TOKEN:0:5}...${TELEGRAM_BOT_TOKEN: -4}"
    echo "Chat ID: $TELEGRAM_CHAT_ID"
    
    # Check connection to Telegram API
    BOT_API_URL="https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"
    response=$(curl -s "$BOT_API_URL")
    if [[ $response == *"\"ok\":true"* ]]; then
      echo "✅ Telegram API connection working"
    else
      echo "❌ Telegram API connection failed"
    fi
  else
    echo "❌ Telegram configuration incomplete in .env file"
  fi
else
  echo "❌ No .env file found in backend directory"
fi

echo -e "\n=== Report Summary ==="
echo "Production Backend: $PROD_BACKEND_URL"
echo "Production Frontend: $PROD_FRONTEND_URL"
echo "Local Backend: $LOCAL_BACKEND_URL (running: $local_backend_running)"
echo "Local Frontend: $LOCAL_FRONTEND_URL (running: $local_frontend_running)"
echo "Image path used: $IMAGE_PATH"

echo -e "\nDiagnostic completed. Use this information to identify whether issues are in local or production environments." 