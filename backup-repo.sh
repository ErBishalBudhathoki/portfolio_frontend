#!/bin/bash
set -e

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="portfolio_backup_${TIMESTAMP}"
BACKUP_PATH="${HOME}/Backups/${BACKUP_DIR}"
GIT_BUNDLE="${BACKUP_PATH}/portfolio_repo.bundle"
EXCLUDE_DIRS="--exclude=node_modules --exclude=.git --exclude=.next --exclude=.ruff_cache"
CURRENT_DIR=$(pwd)

# Print banner
echo "================================================="
echo "📦 Creating comprehensive repository backup"
echo "================================================="
echo "Source: ${CURRENT_DIR}"
echo "Backup location: ${BACKUP_PATH}"
echo "Timestamp: ${TIMESTAMP}"
echo "================================================="

# Create backup directory
echo "📁 Creating backup directory..."
mkdir -p "${BACKUP_PATH}"

# Create a git bundle (complete repository backup)
echo "🔄 Creating Git bundle backup..."
git bundle create "${GIT_BUNDLE}" --all

# Copy all files except excluded directories
echo "📋 Copying repository files..."
rsync -av --progress ${EXCLUDE_DIRS} "${CURRENT_DIR}/" "${BACKUP_PATH}/files/"

# Backup package-lock files separately (important for dependencies)
echo "📦 Backing up dependency files..."
mkdir -p "${BACKUP_PATH}/dependencies"
[ -f package-lock.json ] && cp package-lock.json "${BACKUP_PATH}/dependencies/"
[ -f yarn.lock ] && cp yarn.lock "${BACKUP_PATH}/dependencies/"
[ -f frontend/package-lock.json ] && cp frontend/package-lock.json "${BACKUP_PATH}/dependencies/frontend-package-lock.json"
[ -f backend/package-lock.json ] && cp backend/package-lock.json "${BACKUP_PATH}/dependencies/backend-package-lock.json"

# Create a backup info file
echo "📝 Creating backup information file..."
cat > "${BACKUP_PATH}/BACKUP_INFO.md" << EOF
# Portfolio Repository Backup

**Backup Date:** $(date)
**Source Directory:** ${CURRENT_DIR}

## Contents

- \`files/\`: Complete repository files (excluding node_modules, .git, etc.)
- \`dependencies/\`: Package lock files for dependency restoration
- \`portfolio_repo.bundle\`: Complete Git repository bundle
- \`deployment_config/\`: Deployment configuration files

## Restoration Instructions

### Git Repository Restoration

To restore the Git repository:

\`\`\`bash
mkdir restored_repo
cd restored_repo
git clone "${GIT_BUNDLE}" .
\`\`\`

### Files Restoration

To restore just the files:

\`\`\`bash
cp -r ${BACKUP_PATH}/files/* /path/to/destination/
\`\`\`

### Dependencies Restoration

After restoring files, reinstall dependencies:

\`\`\`bash
# Root directory
npm install
# Frontend
cd frontend && npm install
# Backend
cd backend && npm install
\`\`\`
EOF

# Backup deployment configuration files
echo "⚙️ Backing up deployment configuration files..."
mkdir -p "${BACKUP_PATH}/deployment_config"
find . -name "*.yaml" -o -name "*.yml" -o -name "Dockerfile" -o -name "*.sh" | while read file; do
  dir=$(dirname "${BACKUP_PATH}/deployment_config/${file}")
  mkdir -p "$dir"
  cp "$file" "${BACKUP_PATH}/deployment_config/${file}"
done

# Optional: Create a compressed archive
echo "🗜️ Creating compressed archive..."
ARCHIVE_PATH="${HOME}/Backups/portfolio_backup_${TIMESTAMP}.tar.gz"
tar -czf "${ARCHIVE_PATH}" -C "${HOME}/Backups" "${BACKUP_DIR}"

echo "================================================="
echo "✅ Backup completed successfully!"
echo "📂 Full backup: ${BACKUP_PATH}"
echo "📦 Compressed archive: ${ARCHIVE_PATH}"
echo "================================================="
echo ""
echo "To restore the Git repository:"
echo "  git clone ${GIT_BUNDLE} restored_repo"
echo "" 