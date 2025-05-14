#!/bin/bash
set -e

# Color codes for output
green='\033[0;32m'
red='\033[0;31m'
reset='\033[0m'

function info() {
  echo -e "${green}[INFO] $1${reset}"
}
function warn() {
  echo -e "${red}[WARN] $1${reset}"
}

info "Cleaning frontend build artifacts and caches..."
rm -rf frontend/.next || warn ".next not found"
rm -rf frontend/node_modules || warn "node_modules not found"
rm -rf frontend/out || warn "out not found"
rm -rf frontend/deploy-tmp || warn "deploy-tmp not found"

info "Cleaning backend Python cache..."
rm -rf backend/app/__pycache__ || warn "__pycache__ not found"

info "Cleaning backend data logs and cache..."
rm -f backend/data/blog_cache.json backend/data/linkedin_scraper.log backend/data/linkedin_data.json backend/data/linkedin_profile.json backend/data/linkedin_cookies.json || warn "Some backend/data files not found"

info "Cleanup complete. Project directory is now clean."

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