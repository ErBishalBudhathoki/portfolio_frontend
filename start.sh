#!/bin/bash

# Start script for the portfolio application
# This script starts both the backend and frontend services

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PID=""

cleanup() {
  echo "Shutting down services..."
  if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID"
    echo "Backend service stopped"
  else
    echo "Backend service already stopped"
  fi
  echo "Application shutdown complete"
}

trap cleanup EXIT

cd "$ROOT_DIR" || exit 1

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
EXISTING_BACKEND=$(ps aux 2>/dev/null | grep -i "[p]ython" | grep -i "run_app.py" | awk '{print $2}' || true)
if [ ! -z "$EXISTING_BACKEND" ]; then
  echo "Stopping existing backend process..."
  kill $EXISTING_BACKEND 2>/dev/null
  sleep 2
fi

# Start backend in the background
echo "Starting backend..."
cd "$ROOT_DIR/backend" || exit 1
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

if [ -x "$ROOT_DIR/backend/venv/bin/python3" ]; then
  VENV_PYTHON="$ROOT_DIR/backend/venv/bin/python3"
elif [ -x "$ROOT_DIR/backend/venv/bin/python3.14" ]; then
  VENV_PYTHON="$ROOT_DIR/backend/venv/bin/python3.14"
elif [ -x "$ROOT_DIR/backend/venv/bin/python" ]; then
  VENV_PYTHON="$ROOT_DIR/backend/venv/bin/python"
else
  echo "No usable Python interpreter found in backend/venv. Recreating virtual environment..."
  python3 -m venv --clear venv
  VENV_PYTHON="$ROOT_DIR/backend/venv/bin/python3"
fi

if [ -x "$ROOT_DIR/backend/venv/bin/pip3" ]; then
  VENV_PIP="$ROOT_DIR/backend/venv/bin/pip3"
elif [ -x "$ROOT_DIR/backend/venv/bin/pip3.14" ]; then
  VENV_PIP="$ROOT_DIR/backend/venv/bin/pip3.14"
else
  VENV_PIP="$ROOT_DIR/backend/venv/bin/pip"
fi

if [ ! -x "$VENV_PYTHON" ] || [ ! -x "$VENV_PIP" ]; then
  echo "Error: Virtual environment was not created correctly."
  exit 1
fi

if [ -f "requirements.txt" ]; then
  if ! "$VENV_PYTHON" -c "from app.main import app" >/dev/null 2>&1; then
    echo "Installing backend dependencies..."
    "$VENV_PIP" install -r requirements.txt || {
      echo "Error: Failed to install backend dependencies."
      exit 1
    }
  fi
fi
"$VENV_PYTHON" run_app.py &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Give the backend a moment to start
sleep 1

# Test if backend is running
echo "Testing backend connection..."
BACKEND_READY=0
for _ in $(seq 1 15); do
  if "$VENV_PYTHON" -c "import sys, urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=5); sys.exit(0)" >/dev/null 2>&1; then
    BACKEND_READY=1
    break
  fi
  sleep 1
done

if [ "$BACKEND_READY" -eq 1 ]; then
  echo "Backend is running correctly at http://127.0.0.1:8000"
else
  echo "Warning: Backend may not be running properly. Check for errors."
fi

# Start frontend
echo "Starting frontend..."
cd "$ROOT_DIR/frontend" || exit 1
npm run dev
