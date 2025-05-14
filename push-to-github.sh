#!/bin/bash
set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║ 🚀 GitHub Push Tool                                            ║"
echo "║ Push your portfolio project to GitHub                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Default values
DEFAULT_REPO="https://github.com/BishalBudhathoki/portfolio_frontend"
DEFAULT_BRANCH="main"

# Prompt for GitHub repository URL
read -p "Enter GitHub repository URL [$DEFAULT_REPO]: " REPO_URL
REPO_URL=${REPO_URL:-$DEFAULT_REPO}

# Prompt for branch name
read -p "Enter branch name [$DEFAULT_BRANCH]: " BRANCH
BRANCH=${BRANCH:-$DEFAULT_BRANCH}

# Prompt for commit message
read -p "Enter commit message [Update portfolio project]: " COMMIT_MSG
COMMIT_MSG=${COMMIT_MSG:-"Update portfolio project"}

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo "📁 Git repository not initialized. Initializing now..."
  git init
  echo "✅ Git repository initialized."
else
  echo "📁 Git repository already initialized."
fi

# Check current git status
echo "🔍 Checking git status..."
git status

# Add all files
echo "📦 Adding all files to git..."
git add .

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
  echo "❓ No changes to commit. Would you like to force a commit anyway? (y/N)"
  read -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "🛑 No changes committed. Exiting."
    exit 0
  fi
fi

# Commit changes
echo "💾 Committing changes with message: '$COMMIT_MSG'"
git commit -m "$COMMIT_MSG"

# Check if remote exists
if git remote | grep -q "^origin$"; then
  echo "🔄 Remote 'origin' already exists. Updating URL to $REPO_URL"
  git remote set-url origin "$REPO_URL"
else
  echo "🔄 Adding remote 'origin' with URL $REPO_URL"
  git remote add origin "$REPO_URL"
fi

# Check if the branch exists locally
if git show-ref --verify --quiet refs/heads/$BRANCH; then
  echo "🌿 Branch $BRANCH already exists locally."
else
  echo "🌿 Creating branch $BRANCH..."
  git checkout -b $BRANCH
fi

# Push to GitHub
echo "🚀 Pushing to GitHub repository: $REPO_URL, branch: $BRANCH"
git push -u origin $BRANCH

echo ""
echo "✅ Successfully pushed to GitHub!"
echo "🔗 View your repository at: ${REPO_URL%.git}" 