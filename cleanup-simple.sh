#!/bin/bash
set -e

# Variables - edit these as needed
PROJECT_ID="portfolio-458717"
SERVICE_NAME="portfolio-frontend"
REPO_PATH="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🧹 GCR Simple Image Cleanup Tool"
echo "Target: $REPO_PATH"
echo ""

# List all images and their sizes
echo "📋 Current images in repository:"
gcloud container images list-tags $REPO_PATH --format="table(digest,tags,timestamp,size_bytes.sum())" | sort -k3

echo ""
echo "Choose an option:"
echo "1. Delete specific image (provide tag)"
echo "2. Delete all except latest 3 and 'express' tag"
echo "3. Exit"
read -p "Option: " CHOICE

case $CHOICE in
  1)
    read -p "Enter tag to delete: " TAG
    DIGEST=$(gcloud container images list-tags $REPO_PATH --filter="tags=$TAG" --format="get(digest)")
    
    if [ -n "$DIGEST" ]; then
      echo "Found image with digest: $DIGEST"
      read -p "Delete this image? (y/N) " -n 1 -r
      echo ""
      
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        gcloud container images delete "$REPO_PATH:$TAG" --force-delete-tags --quiet
        echo "✅ Image deleted!"
      else
        echo "Deletion cancelled."
      fi
    else
      echo "No image found with tag '$TAG'"
    fi
    ;;
    
  2)
    # Keep express tag if it exists
    EXPRESS_DIGEST=$(gcloud container images list-tags $REPO_PATH --filter="tags:express" --format="get(digest)" || echo "")
    
    # Keep 3 most recent images
    RECENT_DIGESTS=$(gcloud container images list-tags $REPO_PATH --sort-by="~timestamp" --limit=3 --format="get(digest)")
    
    # Combine digests to keep
    TO_KEEP="${EXPRESS_DIGEST} ${RECENT_DIGESTS}"
    
    echo "Will keep:"
    echo "- Any image tagged 'express'"
    echo "- The 3 most recent images"
    echo ""
    
    # List all images
    ALL_IMAGES=$(gcloud container images list-tags $REPO_PATH --format="json")
    
    # Delete each image not in keep list
    DELETE_COUNT=0
    
    echo "Starting deletion of old images..."
    gcloud container images list-tags $REPO_PATH --format="get(digest,timestamp)" | while read line; do
      DIGEST=$(echo $line | awk '{print $1}')
      
      # Skip if in keep list
      if echo "$TO_KEEP" | grep -q "$DIGEST"; then
        echo "Keeping $DIGEST (in keep list)"
        continue
      fi
      
      echo "Deleting $DIGEST"
      gcloud container images delete "$REPO_PATH@$DIGEST" --force-delete-tags --quiet || echo "Failed to delete $DIGEST"
      DELETE_COUNT=$((DELETE_COUNT+1))
    done
    
    echo "✅ Deleted old images"
    ;;
    
  3)
    echo "Exiting without changes"
    exit 0
    ;;
    
  *)
    echo "Invalid option"
    exit 1
    ;;
esac

# Show current status
echo ""
echo "📊 Current repository status:"
gcloud container images list-tags $REPO_PATH --format="table(digest,tags,timestamp,size_bytes.sum())" | sort -k3 