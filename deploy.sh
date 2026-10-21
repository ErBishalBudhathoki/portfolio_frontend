#!/bin/bash
set -euo pipefail

GCLOUD_BIN="${GCLOUD_BIN:-$(command -v gcloud || true)}"

if [ -z "$GCLOUD_BIN" ]; then
  echo "gcloud CLI not found in PATH"
  exit 1
fi

# Configuration
PROJECT_ID="$("$GCLOUD_BIN" config get-value project 2>/dev/null || true)"
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "(unset)" ]; then
  echo "No active gcloud project. Run: gcloud config set project <PROJECT_ID>"
  exit 1
fi

REGION="us-central1"
SERVICE_NAME="portfolio-frontend"
BACKEND_SERVICE_NAME="portfolio-backend"
IMAGE="gcr.io/$PROJECT_ID/portfolio-frontend"
GITHUB_URL="${NEXT_PUBLIC_GITHUB_URL:-https://github.com/ErBishalBudhathoki}"

BACKEND_URL="${BACKEND_URL:-$("$GCLOUD_BIN" run services describe "$BACKEND_SERVICE_NAME" --region "$REGION" --format 'value(status.url)' 2>/dev/null || true)}"

if [ -z "$BACKEND_URL" ]; then
  echo "Backend URL not found. Set BACKEND_URL or deploy the backend service first."
  exit 1
fi

echo "🚀 Deploying frontend"
echo "   project : $PROJECT_ID"
echo "   service : $SERVICE_NAME ($REGION)"
echo "   backend : $BACKEND_URL"

BUILD_LOG="$(mktemp -t cloudbuild.XXXXXX)"
trap 'rm -f "$BUILD_LOG"' EXIT

# Build and push the container.
# The API URL must reach the BUILD stage (NEXT_PUBLIC_* is inlined by Next.js),
# so it is passed as a build substitution rather than only a runtime env var.
# This call BLOCKS until Cloud Build finishes and fails the script on error.
echo "📦 Building container (waiting for Cloud Build to finish)…"
if ! "$GCLOUD_BIN" builds submit --config cloudbuild.yaml \
  --substitutions "_API_URL=$BACKEND_URL,_GITHUB_URL=$GITHUB_URL" 2>&1 | tee "$BUILD_LOG"; then
  BUILD_ID="$(grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' "$BUILD_LOG" | head -1)"
  echo ""
  echo "❌ Cloud Build failed — not touching the running service."
  if [ -n "$BUILD_ID" ]; then
    echo "   last 40 log lines of build $BUILD_ID:"
    "$GCLOUD_BIN" builds log "$BUILD_ID" --tail 40 || true
  fi
  exit 1
fi

BUILD_ID="$(grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' "$BUILD_LOG" | head -1 || true)"
echo "✅ Build succeeded${BUILD_ID:+ (build $BUILD_ID)}"

# Only now, with a confirmed image in the registry, update the service.
echo "🔄 Updating Cloud Run service…"
"$GCLOUD_BIN" run deploy "$SERVICE_NAME" \
  --image "$IMAGE:latest" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 10 \
  --set-env-vars NEXT_PUBLIC_API_URL="$BACKEND_URL",NEXT_PUBLIC_GITHUB_URL="$GITHUB_URL" \
  --quiet

SERVICE_URL="$("$GCLOUD_BIN" run services describe "$SERVICE_NAME" --region "$REGION" --format 'value(status.url)' 2>/dev/null || true)"

# Wait for the new revision to actually answer before declaring success.
# Cloud Run cold starts take a few seconds; these bounds are generous but finite.
READY_ATTEMPTS="${DEPLOY_READY_ATTEMPTS:-20}"
READY_TIMEOUT="${DEPLOY_READY_TIMEOUT:-10}"

if [ -n "$SERVICE_URL" ]; then
  echo "⏳ Waiting for the new revision to serve traffic…"
  ready=0
  for _ in $(seq 1 "$READY_ATTEMPTS"); do
    code="$(curl -s -o /dev/null -w '%{http_code}' -m "$READY_TIMEOUT" "$SERVICE_URL/" 2>/dev/null || echo 000)"
    case "$code" in
      200|307|308) ready=1; echo "   ready (HTTP $code)"; break ;;
    esac
    sleep 5
  done
  if [ "$ready" != 1 ]; then
    echo "❌ $SERVICE_URL did not become ready within $((READY_ATTEMPTS * (READY_TIMEOUT + 5)))s."
    exit 1
  fi

  # Smoke test the page that was previously failing intermittently.
  skills_body="$(curl -sL -m 25 "$SERVICE_URL/skills/" 2>/dev/null || true)"
  if printf '%s' "$skills_body" | grep -q "Unable to load skills"; then
    echo "❌ /skills/ rendered the error state — backend may be unreachable."
    exit 1
  fi
  echo "🔎 /skills/ served OK ($(printf '%s' "$skills_body" | wc -c | tr -d ' ') bytes)"
fi

echo ""
echo "✅ Deployment completed!"
[ -n "$SERVICE_URL" ] && echo "🌎 Service URL: $SERVICE_URL"
