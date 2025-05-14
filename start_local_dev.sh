#!/bin/bash

# Start Local Development Script for Portfolio Project
# This script helps start the local development environment with better diagnostics

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables
BACKEND_DIR="$PWD/backend"
FRONTEND_DIR="$PWD/frontend"
BACKEND_PID=""
FRONTEND_PID=""

# Print banner
function print_banner() {
  clear
  echo -e "${BLUE}"
  echo "============================================================================="
  echo "                Portfolio Project - Local Development Starter                 "
  echo "============================================================================="
  echo -e "${NC}"
}

# Print section header
function print_section() {
  echo -e "\n${CYAN}=== $1 ===${NC}\n"
}

# Check if command exists
function command_exists() {
  command -v "$1" &> /dev/null
}

# Check if required tools are installed
function check_prerequisites() {
  print_section "Checking Prerequisites"
  
  local all_ok=true
  
  # Check for Python
  if command_exists python3; then
    echo -e "${GREEN}✓${NC} Python3 installed: $(python3 --version)"
  else
    echo -e "${RED}✗${NC} Python3 not found. Please install Python 3.8 or higher."
    all_ok=false
  fi
  
  # Check for Node.js
  if command_exists node; then
    echo -e "${GREEN}✓${NC} Node.js installed: $(node --version)"
  else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 18 or higher."
    all_ok=false
  fi
  
  # Check for npm
  if command_exists npm; then
    echo -e "${GREEN}✓${NC} npm installed: $(npm --version)"
  else
    echo -e "${RED}✗${NC} npm not found. Please install npm."
    all_ok=false
  fi
  
  # Check for pip
  if command_exists pip3; then
    echo -e "${GREEN}✓${NC} pip installed: $(pip3 --version)"
  else
    echo -e "${RED}✗${NC} pip not found. Please install pip."
    all_ok=false
  fi
  
  if [ "$all_ok" = true ]; then
    return 0
  else
    return 1
  fi
}

# Check if .env files exist
function check_env_files() {
  print_section "Checking Environment Files"
  
  local all_ok=true
  
  # Check backend .env
  if [ -f "$BACKEND_DIR/.env" ]; then
    echo -e "${GREEN}✓${NC} Backend .env file found"
    
    # Use grep to check for required variables instead of sourcing
    local missing=()
    local required_vars=("LINKEDIN_PROFILE_URL" "LINKEDIN_EMAIL" "LINKEDIN_PASSWORD" "SHEET_ID" "SHEET_NAME" "HOST" "PORT")
    
    for var in "${required_vars[@]}"; do
      if ! grep -q "^$var=" "$BACKEND_DIR/.env"; then
        missing+=("$var")
      fi
    done
    
    if [ ${#missing[@]} -eq 0 ]; then
      echo -e "${GREEN}✓${NC} All required backend environment variables found"
    else
      echo -e "${YELLOW}!${NC} Missing backend environment variables: ${missing[*]}"
      all_ok=false
    fi
  else
    echo -e "${RED}✗${NC} Backend .env file not found at $BACKEND_DIR/.env"
    echo -e "${YELLOW}Creating a sample .env file...${NC}"
    
    cat > "$BACKEND_DIR/.env" << EOL
# LinkedIn Scraping Configuration
LINKEDIN_PROFILE_URL=https://www.linkedin.com/in/bishalbudhathoki/
LINKEDIN_EMAIL=your-email@example.com
LINKEDIN_PASSWORD=your-password

# Github URL
GITHUB_URL=https://github.com/bishalbudhathoki

# Google Sheet ID (from URL)
GOOGLE_CREDENTIALS_PATH=credentials/google_credentials.json
SHEET_ID=1blqFnWjYgB1idiYqqEZR5qfueO0k6vPZv4eP8Yn3xTg
SHEET_NAME="linkedin_sheet"

# API Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# Telegram Bot Configuration (optional)
# TELEGRAM_BOT_TOKEN=your_bot_token
# TELEGRAM_CHAT_ID=your_chat_id
EOL
    echo -e "${YELLOW}Created sample .env file. Please edit with your actual credentials.${NC}"
  fi
  
  # Check frontend .env
  if [ -f "$FRONTEND_DIR/.env.local" ]; then
    echo -e "${GREEN}✓${NC} Frontend .env.local file found"
  else
    echo -e "${YELLOW}!${NC} No frontend .env.local file found. Creating a basic one..."
    echo -e "NEXT_PUBLIC_API_URL=http://localhost:8000\nNEXT_PUBLIC_SITE_NAME=\"Bishal Budhathoki Portfolio\"" > "$FRONTEND_DIR/.env.local"
    echo -e "${GREEN}✓${NC} Created frontend/.env.local with basic configuration"
  fi
  
  if [ "$all_ok" = true ]; then
    return 0
  else
    return 1
  fi
}

# Run backend debug script
function run_backend_diagnostic() {
  print_section "Running Backend Diagnostics"
  
  if [ -f "$BACKEND_DIR/debug_environment.py" ]; then
    echo "Running backend diagnostic tool..."
    cd "$BACKEND_DIR" && python3 debug_environment.py
    return $?
  else
    echo -e "${RED}✗${NC} Backend diagnostic script not found"
    return 1
  fi
}

# Start backend
function start_backend() {
  print_section "Starting Backend"
  
  if [ -d "$BACKEND_DIR" ]; then
    # Activate virtual environment if it exists
    if [ -d "$BACKEND_DIR/venv" ]; then
      echo "Activating virtual environment..."
      source "$BACKEND_DIR/venv/bin/activate"
    fi
    
    # Install dependencies if requirements.txt exists
    if [ -f "$BACKEND_DIR/requirements.txt" ]; then
      echo "Installing/updating backend dependencies..."
      cd "$BACKEND_DIR" && pip3 install -r requirements.txt
    fi
    
    # Set environment variable for local development
    export PORTFOLIO_ENVIRONMENT="LOCAL_DEVELOPMENT"
    
    # Start backend server
    echo -e "${MAGENTA}Starting FastAPI backend server...${NC}"
    cd "$BACKEND_DIR" && python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    echo "Backend running with PID: $BACKEND_PID"
    
    # Wait for backend to start
    echo "Waiting for backend to start..."
    sleep 3
    
    # Check if backend is running
    if kill -0 $BACKEND_PID 2>/dev/null; then
      echo -e "${GREEN}✓${NC} Backend started successfully"
    else
      echo -e "${RED}✗${NC} Backend failed to start"
      return 1
    fi
  else
    echo -e "${RED}✗${NC} Backend directory not found"
    return 1
  fi
}

# Start frontend
function start_frontend() {
  print_section "Starting Frontend"
  
  if [ -d "$FRONTEND_DIR" ]; then
    # Install dependencies
    echo "Installing/updating frontend dependencies..."
    cd "$FRONTEND_DIR" && npm install
    
    # Set environment variable for local development
    export PORTFOLIO_ENVIRONMENT="LOCAL_DEVELOPMENT"
    
    # Start frontend development server
    echo -e "${MAGENTA}Starting Next.js frontend server...${NC}"
    cd "$FRONTEND_DIR" && npm run dev &
    FRONTEND_PID=$!
    echo "Frontend running with PID: $FRONTEND_PID"
    
    # Wait for frontend to start
    echo "Waiting for frontend to start..."
    sleep 5
    
    # Check if frontend is running
    if kill -0 $FRONTEND_PID 2>/dev/null; then
      echo -e "${GREEN}✓${NC} Frontend started successfully"
      echo -e "\n${GREEN}Frontend should be accessible at: ${BLUE}http://localhost:3000${NC}"
    else
      echo -e "${RED}✗${NC} Frontend failed to start"
      return 1
    fi
  else
    echo -e "${RED}✗${NC} Frontend directory not found"
    return 1
  fi
}

# Cleanup function to ensure processes are killed on exit
function cleanup() {
  print_section "Shutting Down"
  
  echo "Shutting down services..."
  
  if [ ! -z "$BACKEND_PID" ]; then
    echo "Stopping backend (PID: $BACKEND_PID)..."
    kill -15 $BACKEND_PID 2>/dev/null || kill -9 $BACKEND_PID 2>/dev/null
  fi
  
  if [ ! -z "$FRONTEND_PID" ]; then
    echo "Stopping frontend (PID: $FRONTEND_PID)..."
    kill -15 $FRONTEND_PID 2>/dev/null || kill -9 $FRONTEND_PID 2>/dev/null
  fi
  
  echo -e "${GREEN}All processes stopped. Thank you for using the Portfolio Development Environment!${NC}"
  exit 0
}

# Register the cleanup function to run on script exit
trap cleanup EXIT INT TERM

# Main function
function main() {
  print_banner
  
  # Check prerequisites
  check_prerequisites
  if [ $? -ne 0 ]; then
    echo -e "\n${RED}Some prerequisites are missing. Please install them and try again.${NC}"
    exit 1
  fi
  
  # Check environment files
  check_env_files
  env_status=$?
  
  # Skip backend diagnostic as the script doesn't exist
  echo -e "\n${YELLOW}Note: Skipping backend diagnostic check as the script doesn't exist.${NC}"
  diag_status=0
  
  # If there are serious issues, ask for confirmation
  if [ $env_status -ne 0 ]; then
    echo -e "\n${YELLOW}Warning: Some issues were detected with your environment.${NC}"
    read -p "Do you still want to continue starting the development servers? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "Exiting. Please fix the issues and try again."
      exit 1
    fi
  fi
  
  # Start backend and frontend
  start_backend
  if [ $? -eq 0 ]; then
    start_frontend
  else
    echo -e "${RED}Failed to start backend. Not starting frontend.${NC}"
    exit 1
  fi
  
  # Keep script running to maintain the started services
  print_section "Development Environment Running"
  echo -e "${GREEN}Both backend and frontend are now running.${NC}"
  echo -e "Backend API: ${BLUE}http://localhost:8000${NC}"
  echo -e "Frontend:    ${BLUE}http://localhost:3000${NC}"
  echo -e "\nPress ${YELLOW}Ctrl+C${NC} to stop all services and exit.\n"
  
  # Wait for user to press Ctrl+C
  while true; do
    sleep 1
  done
}

# Run the main function
main 