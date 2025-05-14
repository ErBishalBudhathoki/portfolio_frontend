#!/bin/bash

# Setup script for portfolio project credentials
# This script helps set up the necessary credential files

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}=== Portfolio Project Credentials Setup ===${NC}"
echo

# Check if necessary directories exist
echo -e "${YELLOW}Creating necessary directories...${NC}"
mkdir -p backend/credentials
mkdir -p frontend/credentials

# Function to check if file exists and is valid JSON
check_json_file() {
    local file=$1
    local name=$2
    
    if [ -f "$file" ]; then
        # Check if it's valid JSON
        if python -c "import json; json.load(open('$file'))" 2>/dev/null; then
            echo -e "${GREEN}✓ $name file found and is valid JSON${NC}"
            return 0
        else
            echo -e "${RED}✗ $name file found but is NOT valid JSON${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ $name file not found${NC}"
        return 1
    fi
}

# Check for Google credentials
echo
echo -e "${BOLD}Checking for Google credentials...${NC}"

# Prompt for Google credentials file path
read -p "Enter the path to your Google credentials JSON file (or press Enter to skip): " google_creds_path

if [ -n "$google_creds_path" ]; then
    if check_json_file "$google_creds_path" "Google credentials"; then
        # Copy the file to the backend credentials directory
        cp "$google_creds_path" backend/credentials/google_credentials.json
        echo -e "${GREEN}✓ Google credentials copied to backend/credentials/google_credentials.json${NC}"
    else
        echo -e "${RED}Failed to copy Google credentials. Please check the file path and try again.${NC}"
    fi
else
    echo -e "${YELLOW}Skipping Google credentials setup${NC}"
fi

# Check for Firebase credentials
echo
echo -e "${BOLD}Checking for Firebase credentials...${NC}"

# Prompt for Firebase credentials file path
read -p "Enter the path to your Firebase credentials JSON file (or press Enter to skip): " firebase_creds_path

if [ -n "$firebase_creds_path" ]; then
    if check_json_file "$firebase_creds_path" "Firebase credentials"; then
        # Copy the file to the backend credentials directory
        cp "$firebase_creds_path" backend/credentials/firebase-credentials.json
        echo -e "${GREEN}✓ Firebase credentials copied to backend/credentials/firebase-credentials.json${NC}"
        
        # Extract project ID from Firebase credentials
        project_id=$(python -c "import json; print(json.load(open('$firebase_creds_path')).get('project_id', 'unknown'))")
        echo -e "${BLUE}Firebase Project ID: ${BOLD}$project_id${NC}"
        
        # Inform about Firebase setup
        echo
        echo -e "${YELLOW}Note: You may need to enable Firestore in your Firebase project.${NC}"
        echo -e "Visit: ${BLUE}https://console.firebase.google.com/project/$project_id/firestore${NC}"
    else
        echo -e "${RED}Failed to copy Firebase credentials. Please check the file path and try again.${NC}"
    fi
else
    echo -e "${YELLOW}Skipping Firebase credentials setup${NC}"
fi

# Create .env file from template if it doesn't exist
echo
echo -e "${BOLD}Setting up environment files...${NC}"

if [ ! -f "backend/.env" ]; then
    if [ -f "backend/env.example" ]; then
        cp backend/env.example backend/.env
        echo -e "${GREEN}✓ Created backend/.env from template${NC}"
        echo -e "${YELLOW}Please edit backend/.env with your actual credentials${NC}"
    else
        echo -e "${YELLOW}Backend env.example not found, creating minimal .env file...${NC}"
        cat > backend/.env << EOL
# LinkedIn Scraping Configuration
LINKEDIN_PROFILE_URL=https://www.linkedin.com/in/bishalbudhathoki/
LINKEDIN_EMAIL=your-email@example.com
LINKEDIN_PASSWORD=your-password

# Google Sheet ID (from URL)
GOOGLE_CREDENTIALS_PATH=credentials/google_credentials.json
SHEET_ID=your-sheet-id-here
SHEET_NAME="linkedin_sheet"

# API Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT=credentials/firebase-credentials.json
FIREBASE_STORAGE_BUCKET=your-bucket-name.appspot.com
FIREBASE_PROJECT_ID=$project_id
EOL
        echo -e "${GREEN}✓ Created basic backend/.env file${NC}"
        echo -e "${YELLOW}Please edit backend/.env with your actual credentials${NC}"
    fi
else
    echo -e "${GREEN}✓ Backend .env file already exists${NC}"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo -e "NEXT_PUBLIC_API_URL=http://localhost:8000\nNEXT_PUBLIC_SITE_NAME=\"Bishal Budhathoki Portfolio\"" > frontend/.env.local
    echo -e "${GREEN}✓ Created frontend/.env.local with basic configuration${NC}"
else
    echo -e "${GREEN}✓ Frontend .env.local file already exists${NC}"
fi

# Summary
echo
echo -e "${BLUE}${BOLD}=== Setup Summary ===${NC}"
echo

# Check if backend credential files exist
echo -e "${BOLD}Backend Credentials:${NC}"
check_json_file "backend/credentials/google_credentials.json" "Google credentials"
check_json_file "backend/credentials/firebase-credentials.json" "Firebase credentials"

echo
echo -e "${BOLD}Environment Files:${NC}"
[ -f "backend/.env" ] && echo -e "${GREEN}✓ Backend .env file exists${NC}" || echo -e "${RED}✗ Backend .env file is missing${NC}"
[ -f "frontend/.env.local" ] && echo -e "${GREEN}✓ Frontend .env.local file exists${NC}" || echo -e "${RED}✗ Frontend .env.local file is missing${NC}"

echo
echo -e "${GREEN}${BOLD}Credentials setup completed!${NC}"
echo -e "Run ${BLUE}./start_local_dev.sh${NC} to start the development environment"
echo 