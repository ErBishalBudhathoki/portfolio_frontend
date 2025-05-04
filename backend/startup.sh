#!/bin/bash
set -e

# Display system information for diagnostics
echo "=== System Information ==="
echo "Date: $(date)"
echo "Hostname: $(hostname)"
echo "Linux Version: $(uname -a)"
echo

# Check and display Chrome installation
echo "=== Checking Chrome Installation ==="
if ! command -v google-chrome &> /dev/null; then
    echo "ERROR: Google Chrome is not installed. Trying to install now..."
    apt-get update && apt-get install -y google-chrome-stable
    if ! command -v google-chrome &> /dev/null; then
        echo "CRITICAL ERROR: Failed to install Google Chrome. Exiting."
        exit 1
    fi
fi

CHROME_VERSION=$(google-chrome --version | awk '{print $3}')
echo "Google Chrome version: $CHROME_VERSION"

# Check and set up ChromeDriver
echo
echo "=== Setting up ChromeDriver ==="

# First try to use webdriver_manager to set up ChromeDriver
echo "Attempting to set up ChromeDriver with webdriver_manager..."
mkdir -p /app/chromedriver

python -c "
import sys
try:
    from webdriver_manager.chrome import ChromeDriverManager
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    
    print('Selenium version:', webdriver.__version__)
    
    driver_path = ChromeDriverManager().install()
    print('ChromeDriver installed at:', driver_path)
    print('ChromeDriver setup with webdriver_manager successful')
    sys.exit(0)
except Exception as e:
    print('Error setting up ChromeDriver with webdriver_manager:', str(e))
    sys.exit(1)
"

# If webdriver_manager fails, try manual installation
if [ $? -ne 0 ]; then
    echo "Manual ChromeDriver installation..."
    
    # Get the Chrome major version
    CHROME_MAJOR_VERSION=$(echo $CHROME_VERSION | cut -d '.' -f 1)
    echo "Chrome major version: $CHROME_MAJOR_VERSION"
    
    # Find the compatible ChromeDriver version
    echo "Finding compatible ChromeDriver version..."
    CHROMEDRIVER_VERSION=$(curl -s "https://chromedriver.storage.googleapis.com/LATEST_RELEASE_$CHROME_MAJOR_VERSION")
    
    if [ -z "$CHROMEDRIVER_VERSION" ]; then
        echo "Failed to find compatible ChromeDriver version. Trying latest..."
        CHROMEDRIVER_VERSION=$(curl -s "https://chromedriver.storage.googleapis.com/LATEST_RELEASE")
    fi
    
    echo "Using ChromeDriver version: $CHROMEDRIVER_VERSION"
    
    # Download and install ChromeDriver
    echo "Downloading ChromeDriver..."
    wget -q -O /tmp/chromedriver.zip "https://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip"
    unzip -q /tmp/chromedriver.zip -d /app/chromedriver
    chmod +x /app/chromedriver/chromedriver
    mv /app/chromedriver/chromedriver /usr/local/bin/
    rm /tmp/chromedriver.zip
    
    echo "ChromeDriver installation completed"
fi

# Verify ChromeDriver is in path
echo
echo "=== Verifying ChromeDriver ==="
if ! command -v chromedriver &> /dev/null; then
    echo "WARNING: chromedriver not in PATH. Checking in common locations..."
    CHROMEDRIVER_LOCATIONS=(
        "/usr/local/bin/chromedriver"
        "/usr/bin/chromedriver"
        "/app/chromedriver/chromedriver"
    )
    
    for loc in "${CHROMEDRIVER_LOCATIONS[@]}"; do
        if [ -f "$loc" ]; then
            echo "Found ChromeDriver at $loc"
            export PATH="$PATH:$(dirname $loc)"
            break
        fi
    done
    
    if ! command -v chromedriver &> /dev/null; then
        echo "WARNING: ChromeDriver not found in common locations. Selenium may fail."
    fi
fi

if command -v chromedriver &> /dev/null; then
    CHROMEDRIVER_VERSION=$(chromedriver --version | awk '{print $2}')
    echo "ChromeDriver version: $CHROMEDRIVER_VERSION"
else
    echo "WARNING: chromedriver command not found"
fi

# Test Selenium setup
echo
echo "=== Testing Selenium Setup ==="
python -c "
import sys
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    
    options = Options()
    options.add_argument('--headless=new')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    
    print('Creating Chrome driver...')
    driver = webdriver.Chrome(options=options)
    
    print('Fetching test page...')
    driver.get('https://www.google.com')
    print('Page title:', driver.title)
    
    driver.quit()
    print('Selenium test successful!')
except Exception as e:
    print('Selenium test failed:', str(e))
    # Continue anyway as this is just a test
"

# Create necessary directories
mkdir -p /app/data
mkdir -p /app/credentials
mkdir -p /app/screenshots

# Check environment variables
echo
echo "=== Checking Environment Variables ==="
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:8080}
echo "API URL: $NEXT_PUBLIC_API_URL"

if [ -z "$GOOGLE_SHEETS_CREDENTIALS" ]; then
    echo "WARNING: GOOGLE_SHEETS_CREDENTIALS environment variable not set"
else
    echo "GOOGLE_SHEETS_CREDENTIALS is set"
    
    # Decode the credentials if they're base64 encoded
    if [[ "$GOOGLE_SHEETS_CREDENTIALS" == *"="* ]]; then
        echo "Detected base64 encoded credentials, decoding..."
        echo $GOOGLE_SHEETS_CREDENTIALS | base64 -d > /app/credentials/google_credentials.json
    else
        echo "Credentials appear to be a file path, checking..."
        if [ -f "$GOOGLE_SHEETS_CREDENTIALS" ]; then
            echo "Copying credentials from $GOOGLE_SHEETS_CREDENTIALS"
            cp "$GOOGLE_SHEETS_CREDENTIALS" /app/credentials/google_credentials.json
        else
            echo "WARNING: Credentials file not found at $GOOGLE_SHEETS_CREDENTIALS"
        fi
    fi
    
    if [ -f "/app/credentials/google_credentials.json" ]; then
        echo "Google credentials file created successfully"
    else
        echo "WARNING: Failed to create Google credentials file"
    fi
fi

# Start the application
echo
echo "=== Starting FastAPI Application ==="
exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 