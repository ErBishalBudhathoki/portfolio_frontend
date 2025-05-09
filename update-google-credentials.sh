#!/bin/bash
set -e

# Make sure we have the Google credentials file
GOOGLE_CREDS_FILE="backend/credentials/google_credentials.json"

if [ ! -f "$GOOGLE_CREDS_FILE" ]; then
  echo "Error: Google credentials file not found at $GOOGLE_CREDS_FILE"
  echo "Please obtain the Google Service Account credentials file and place it in backend/credentials/google_credentials.json"
  exit 1
fi

echo "=== Updating Google Sheets Credentials in Secret Manager ==="
cat "$GOOGLE_CREDS_FILE" | ~/downloads/google-cloud-sdk/bin/gcloud secrets versions add GOOGLE_SHEETS_CREDENTIALS --data-file=-

echo "=== Verifying Secret ==="
~/downloads/google-cloud-sdk/bin/gcloud secrets versions list GOOGLE_SHEETS_CREDENTIALS

echo "=== Updating Service Account Permissions ==="
# Get the service account used by the Cloud Run service
SERVICE_ACCOUNT=$(~/downloads/google-cloud-sdk/bin/gcloud run services describe portfolio-backend --platform managed --region us-central1 --format "value(spec.template.spec.serviceAccountName)")

# Add Secret Manager Secret Accessor role to the service account
~/downloads/google-cloud-sdk/bin/gcloud projects add-iam-policy-binding portfolio-458717 \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

echo "=== Credentials Updated Successfully ==="
echo "Now redeploy the backend service to apply changes:"
echo "./deploy-backend.sh" 