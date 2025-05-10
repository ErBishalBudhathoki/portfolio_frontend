#!/bin/bash
set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║ 🔄 Portfolio GitHub Sync Tool                                  ║"
echo "║ Synchronize your project with GitHub                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Configuration section
DEFAULT_REPO_HTTPS="https://github.com/username/portfolio.git"
DEFAULT_REPO_SSH="git@github.com:username/portfolio.git"
DEFAULT_BRANCH="main"
BACKUP_DIR="github-sync-backup-$(date +%Y%m%d-%H%M%S)"

# Ask for authentication method
echo "Select authentication method:"
echo "1) HTTPS (username/password or token)"
echo "2) SSH (SSH key)"
read -p "Enter choice [2]: " AUTH_METHOD
AUTH_METHOD=${AUTH_METHOD:-2}

if [ "$AUTH_METHOD" == "1" ]; then
  # HTTPS method
  echo "Using HTTPS authentication..."
  read -p "Enter GitHub repository URL [$DEFAULT_REPO_HTTPS]: " REPO_URL
  REPO_URL=${REPO_URL:-$DEFAULT_REPO_HTTPS}
  
  # Check if GitHub CLI is installed for smoother authentication
  if command -v gh &> /dev/null; then
    echo "📝 GitHub CLI detected. You can use it for authentication."
    read -p "Would you like to authenticate using GitHub CLI? (y/N): " USE_GH_CLI
    if [[ $USE_GH_CLI =~ ^[Yy]$ ]]; then
      echo "Authenticating with GitHub CLI..."
      gh auth login
      echo "✅ Authentication completed."
    else
      echo "Skipping GitHub CLI authentication."
      echo "⚠️ Note: You'll be prompted for credentials when pushing."
    fi
  else
    echo "⚠️ GitHub CLI not found. You'll be prompted for credentials when pushing."
    
    # Offer credential caching
    read -p "Would you like to cache credentials to avoid frequent password prompts? (y/N): " CACHE_CREDS
    if [[ $CACHE_CREDS =~ ^[Yy]$ ]]; then
      # Set credential cache
      git config --global credential.helper cache
      read -p "Enter cache timeout in seconds (default: 3600): " TIMEOUT
      TIMEOUT=${TIMEOUT:-3600}
      git config --global credential.helper "cache --timeout=$TIMEOUT"
      echo "✅ Credential caching enabled for $TIMEOUT seconds."
    fi
  fi
  
else
  # SSH method (default)
  echo "Using SSH authentication..."
  read -p "Enter GitHub repository URL [$DEFAULT_REPO_SSH]: " REPO_URL
  REPO_URL=${REPO_URL:-$DEFAULT_REPO_SSH}
  
  # Check if SSH key exists
  if [ ! -f ~/.ssh/id_rsa.pub ] && [ ! -f ~/.ssh/id_ed25519.pub ]; then
    echo "❓ No SSH key found. Would you like to create one? (Y/n): "
    read -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
      echo "📝 Creating SSH key..."
      ssh-keygen -t ed25519 -C "$(whoami)@$(hostname)"
      echo "✅ SSH key created."
      
      # Display the key for easy copying
      if [ -f ~/.ssh/id_ed25519.pub ]; then
        echo ""
        echo "Here's your public SSH key to add to GitHub:"
        echo ""
        cat ~/.ssh/id_ed25519.pub
        echo ""
        echo "Add this key at: https://github.com/settings/keys"
        read -p "Press Enter when you've added the key to GitHub..." -s
        echo ""
      fi
    fi
  else
    echo "✅ SSH key found."
  fi
  
  # Test SSH connection
  echo "🔑 Testing SSH connection to GitHub..."
  if ! ssh -T git@github.com -o StrictHostKeyChecking=no -o BatchMode=yes 2>&1 | grep -q "success"; then
    echo "⚠️ SSH authentication to GitHub might not be set up correctly."
    echo "ℹ️ You can add your SSH key to GitHub at: https://github.com/settings/keys"
    echo "ℹ️ Your public key is:"
    if [ -f ~/.ssh/id_ed25519.pub ]; then
      cat ~/.ssh/id_ed25519.pub
    elif [ -f ~/.ssh/id_rsa.pub ]; then
      cat ~/.ssh/id_rsa.pub
    fi
    
    read -p "Continue anyway? (y/N): " CONTINUE
    if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
      echo "Exiting."
      exit 1
    fi
  else
    echo "✅ SSH connection to GitHub successful!"
  fi
fi

# Prompt for branch name
read -p "Enter branch name [$DEFAULT_BRANCH]: " BRANCH
BRANCH=${BRANCH:-$DEFAULT_BRANCH}

# Prompt for commit message
read -p "Enter commit message [Update portfolio project]: " COMMIT_MSG
COMMIT_MSG=${COMMIT_MSG:-"Update portfolio project"}

# Create backup of uncommitted files
echo "📦 Creating backup of current state..."
mkdir -p $BACKUP_DIR
cp -R . $BACKUP_DIR 2>/dev/null || :
echo "✅ Backup created at $BACKUP_DIR"

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
if git diff-index --quiet HEAD -- 2>/dev/null; then
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
if git show-ref --verify --quiet refs/heads/$BRANCH 2>/dev/null; then
  echo "🌿 Branch $BRANCH already exists locally."
  git checkout $BRANCH
else
  echo "🌿 Creating branch $BRANCH..."
  git checkout -b $BRANCH
fi

# Handle potential errors during push
echo "🚀 Pushing to GitHub repository: $REPO_URL, branch: $BRANCH"
if ! git push -u origin $BRANCH; then
  echo "❌ Push failed. Attempting to resolve common issues..."
  
  # Check for permission issues
  if [ "$AUTH_METHOD" == "1" ]; then
    echo "🔑 For HTTPS repositories, you may need to:"
    echo "  - Use a personal access token instead of password"
    echo "  - Ensure you have write access to the repository"
    echo "  - Try using the GitHub CLI with 'gh auth login'"
    read -p "Retry push? (y/N): " RETRY
    if [[ $RETRY =~ ^[Yy]$ ]]; then
      echo "🔄 Retrying push..."
      git push -u origin $BRANCH
    fi
  else
    echo "🔑 For SSH repositories, you may need to:"
    echo "  - Ensure your SSH key is added to GitHub"
    echo "  - Check SSH agent is running: eval \$(ssh-agent -s)"
    echo "  - Add your key to the agent: ssh-add ~/.ssh/id_ed25519 (or id_rsa)"
    
    read -p "Would you like to try adding your SSH key to the agent? (y/N): " ADD_KEY
    if [[ $ADD_KEY =~ ^[Yy]$ ]]; then
      eval $(ssh-agent -s)
      if [ -f ~/.ssh/id_ed25519 ]; then
        ssh-add ~/.ssh/id_ed25519
      elif [ -f ~/.ssh/id_rsa ]; then
        ssh-add ~/.ssh/id_rsa
      fi
      echo "🔄 Retrying push..."
      git push -u origin $BRANCH
    fi
  fi
else
  echo ""
  echo "✅ Successfully pushed to GitHub!"
  echo "🔗 View your repository at: ${REPO_URL%.git}"
  echo "🔗 For SSH URLs: $(echo $REPO_URL | sed -E 's/git@github.com:(.+)\.git/https:\/\/github.com\/\1/')"
fi 