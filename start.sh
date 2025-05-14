#!/bin/bash

# Start script for the portfolio application
# This script starts both the backend and frontend services

echo "Starting Portfolio Application"
echo "-----------------------------"

# Check if the script is being run from the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
  echo "Error: Please run this script from the root directory of the project"
  exit 1
fi

# Create environment file for frontend if it doesn't exist
if [ ! -f "frontend/.env.local" ]; then
  echo "Creating frontend environment file..."
  cat > frontend/.env.local << EOL
# Frontend environment variables for Portfolio

# API Base URL - connect to backend
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# Site Configuration
NEXT_PUBLIC_SITE_NAME="Bishal Budhathoki Portfolio"
NEXT_PUBLIC_SITE_DESCRIPTION="Professional portfolio website of Bishal Budhathoki showcasing projects, skills, and experience."
EOL
  echo "Frontend environment file created."
fi

# Kill any existing backend processes
EXISTING_BACKEND=$(ps aux | grep -i python | grep -i run.py | awk '{print $2}')
if [ ! -z "$EXISTING_BACKEND" ]; then
  echo "Stopping existing backend process..."
  kill $EXISTING_BACKEND 2>/dev/null
  sleep 2
fi

# Start backend in the background
echo "Starting backend..."
cd backend
python3 -m venv venv
source venv/bin/activate || { echo "Error: Virtual environment not found. Please run setup.sh first"; exit 1; }
python run_app.py &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Give the backend a moment to start
sleep 3

# Test if backend is running
echo "Testing backend connection..."
if curl -s "http://127.0.0.1:8000/" > /dev/null; then
  echo "Backend is running correctly at http://127.0.0.1:8000"
else
  echo "Warning: Backend may not be running properly. Check for errors."
fi

# Start frontend
echo "Starting frontend..."
cd ../frontend
npm run dev

# This section runs when the frontend is shut down with Ctrl+C
echo "Shutting down services..."
kill $BACKEND_PID
echo "Backend service stopped"
echo "Application shutdown complete" 