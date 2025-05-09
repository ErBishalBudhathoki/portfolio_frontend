#!/bin/bash

echo "Building and deploying Next.js application to Google Cloud Run"

# Set project ID variable
PROJECT_ID="portfolio-415702"

# Authenticate to Google Cloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
  echo "Not authenticated to Google Cloud. Please run 'gcloud auth login' first."
  exit 1
fi

# Submit build to Google Cloud Build using cloudbuild.yaml
echo "Submitting build to Google Cloud Build using cloudbuild.yaml..."
gcloud builds submit --config=cloudbuild.yaml --timeout=30m .

echo "Deployment completed! Your application will be available at:"
gcloud run services describe portfolio-frontend --platform managed --region us-central1 --format 'value(status.url)' 