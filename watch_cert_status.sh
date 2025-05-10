#!/bin/bash

DOMAIN="www.bishalbudhathoki.com"
REGION="us-central1"

echo "Polling certificate status for $DOMAIN every 30 seconds..."

while true; do
  STATUS=$(gcloud beta run domain-mappings describe --domain "$DOMAIN" --region "$REGION" \
    --format="value(status.conditions[?type='CertificateProvisioned'].status)")

  if [[ "$STATUS" == "True" ]]; then
    echo "✅ Certificate has been provisioned for $DOMAIN!"
    osascript -e 'display notification "Certificate ready for www.bishalbudhathoki.com" with title "Cloud Run Domain Mapping"'
    break
  else
    echo "⏳ Certificate still pending... checked at $(date)"
    sleep 30
  fi
done
