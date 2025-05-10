#!/bin/bash
set -e

echo "🧹 Cleaning up unnecessary deployment and Docker files..."

# Files to keep - DO NOT DELETE THESE
KEEP_FILES=(
  "frontend/Dockerfile"
  "frontend/deploy.sh"
  "cleanup-simple.sh"
  "cleanup-files.sh"  # Keep this script
)

# Move to backup folder instead of directly deleting
BACKUP_DIR="backup-deploy-scripts-$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

echo "📦 Moving unwanted files to backup folder: $BACKUP_DIR"

# Move Docker variant files
find . -type f -name "Dockerfile.*" | while read file; do
  # Check if it's not in the keep list
  if [[ ! " ${KEEP_FILES[@]} " =~ " ${file#./} " ]]; then
    echo "Moving: $file"
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    mv "$file" "$BACKUP_DIR/$file"
  fi
done

# Move deployment scripts
find . -type f -name "deploy-*.sh" | while read file; do
  # Check if it's not in the keep list
  if [[ ! " ${KEEP_FILES[@]} " =~ " ${file#./} " ]]; then
    echo "Moving: $file"
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    mv "$file" "$BACKUP_DIR/$file"
  fi
done

# Move cleanup scripts except the ones we want to keep
find . -type f -name "cleanup-*.sh" | while read file; do
  # Skip if it's in the keep list
  if [[ ! " ${KEEP_FILES[@]} " =~ " ${file#./} " ]]; then
    echo "Moving: $file"
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    mv "$file" "$BACKUP_DIR/$file"
  fi
done

echo "✅ Cleanup completed! All unwanted files moved to $BACKUP_DIR"
echo ""
echo "Important files kept:"
for file in "${KEEP_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  - $file"
  fi
done 