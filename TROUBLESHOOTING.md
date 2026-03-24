# Portfolio Troubleshooting Guide

## Common Issues and Solutions

### 1. Missing Profile Image / No Data from Google Sheets

**Symptoms:**
- No profile image on the homepage
- Missing data that should come from Google Sheets
- UI only shows hardcoded data

**Causes:**
- Backend API endpoints returning 404 errors
- Google Sheets credentials not properly configured
- Backend not running the correct FastAPI application

**Solutions:**

1. **Check the backend logs:**
   ```bash
   # Make check-deployment.sh executable
   chmod +x check-deployment.sh
   
   # Run the check deployment script
   ./check-deployment.sh
   ```

2. **Verify Google Sheets credentials:**
   ```bash
   # Make check-credentials.sh executable
   chmod +x check-credentials.sh
   
   # Run the credentials check script
   ./check-credentials.sh
   ```

3. **Redeploy the backend with proper environment variables:**
   ```bash
   # Make deploy-backend.sh executable
   chmod +x deploy-backend.sh
   
   # Deploy the backend
   ./deploy-backend.sh
   ```

4. **Update the frontend with the correct backend URL:**
   ```bash
   # Get the backend URL
   BACKEND_URL=$(~/downloads/google-cloud-sdk/bin/gcloud run services describe portfolio-backend --platform managed --region us-central1 --format "value(status.url)")
   
   # Navigate to frontend directory and deploy with the correct URL
   cd frontend
   chmod +x deploy-frontend.sh
   ./deploy-frontend.sh
   # When prompted, enter the backend URL from above
   ```

### 2. Telegram /scrape Command Not Working

**Symptoms:**
- Telegram bot doesn't respond to the /scrape command
- LinkedIn profile data is not updated

**Causes:**
- Backend not configured for external access
- Telegram webhook not properly set up

**Solutions:**

1. **Test endpoint manually:**
   ```bash
   # Get the backend URL
   BACKEND_URL=$(~/downloads/google-cloud-sdk/bin/gcloud run services describe portfolio-backend --platform managed --region us-central1 --format "value(status.url)")
   
   # Test the trigger-linkedin-scrape endpoint
   curl -X GET "$BACKEND_URL/api/trigger-linkedin-scrape"
   ```

2. **Check notification configuration:**
   - Review the backend logs for any errors related to Telegram
   - Verify that the Telegram bot token is correctly configured

### 3. General Troubleshooting Steps

1. **Check the backend is running the correct application:**
   - The deployment should use `app.main:app` as the entry point, not `app.simple_main:app`
   - Update the MAIN_MODULE environment variable in deploy-backend.sh

2. **Verify secret access permissions:**
   - The service account needs the Secret Manager Secret Accessor role
   - Add the role if missing:
   ```bash
   SERVICE_ACCOUNT=$(~/downloads/google-cloud-sdk/bin/gcloud run services describe portfolio-backend --platform managed --region us-central1 --format "value(spec.template.spec.serviceAccountName)")
   
   ~/downloads/google-cloud-sdk/bin/gcloud projects add-iam-policy-binding portfolio-458717 --member=serviceAccount:$SERVICE_ACCOUNT --role=roles/secretmanager.secretAccessor
   ```

3. **Check CORS configuration:**
   - Ensure www.bishalbudhathoki.com is in the allowed origins list in main.py

4. **Validate Google Sheets API access:**
   - The service account used must have access to the Google Sheet
   - Check the sharing settings of the sheet to ensure the service account email has access

## Frontend Issues

### Next.js build fails

1. Check for TypeScript errors:
   ```bash
   cd frontend
   npm run lint
   ```

2. Check for missing dependencies:
   ```bash
   cd frontend
   npm install
   ```

### Frontend can't connect to backend

1. Check if the backend is running:
   ```bash
   curl http://localhost:8080/health
   ```

2. Verify that the `NEXT_PUBLIC_API_URL` environment variable is set correctly in the frontend.

## Backend Issues

### FastAPI server won't start

1. Check for Python dependency issues:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Verify port availability:
   ```bash
   lsof -i :8080
   ```

### Google Sheets API errors

1. Confirm credentials file exists and is properly formatted:
   ```bash
   cd backend
   python -c "import json; json.load(open('credentials/google_credentials.json'))"
   ```

2. Check if the Google Sheets API is enabled for your project in Google Cloud Console.

## LinkedIn Scraper Issues

### ChromeDriver and Selenium Problems

If you encounter issues with the LinkedIn scraper related to Chrome and ChromeDriver, follow these diagnostic steps:

1. **Run the Selenium test script to diagnose environment issues**:
   ```bash
   cd backend
   python test_selenium.py
   ```
   This script will test different ChromeDriver setup methods and report which ones work in your environment.

2. **Common ChromeDriver errors and solutions**:

   - **"Chrome not found" error**:
     - Ensure Google Chrome is installed on your system
     - For Cloud Run: Make sure Chrome is properly installed in the container
     - Run `google-chrome --version` to verify installation

   - **"ChromeDriver not found" error**:
     - Install ChromeDriver manually: `apt-get install chromium-driver` (Linux)
     - Use webdriver_manager: `pip install webdriver_manager`
     - Make sure ChromeDriver version matches your Chrome version

   - **"Chrome crashed" or "Failed to start Chrome" errors**:
     - Add the `--no-sandbox` and `--disable-dev-shm-usage` flags to Chrome options
     - For Docker/Cloud environments, ensure you're using proper headless mode flags
     - Add `--headless=new` instead of just `--headless` for newer Chrome versions

3. **In Cloud Run environments**:
   - Update the `startup.sh` script to include diagnostic steps
   - Check Cloud Run logs for Chrome/ChromeDriver initialization errors
   - Ensure the container has enough memory (at least 512MB recommended)
   - Use the most compatible Chrome options for containerized environments:
     ```python
     options.add_argument("--headless=new")
     options.add_argument("--no-sandbox")
     options.add_argument("--disable-dev-shm-usage")
     options.add_argument("--disable-gpu")
     options.add_argument("--window-size=1920,1080")
     ```

4. **For detection issues with LinkedIn**:
   - Add a realistic user agent string to avoid bot detection
   - Implement delays between actions to mimic human behavior
   - Consider using a proxy service if LinkedIn is blocking your IP

## Deployment Issues

### Google Cloud Run deployment fails

1. Verify gcloud CLI is authenticated:
   ```bash
   gcloud auth list
   ```

2. Check for Docker build issues:
   ```bash
   cd backend
   docker build -t backend-test .
   ```

3. Review deployment logs:
   ```bash
   gcloud app logs tail
   ```

## Google Sheets Integration

### Cannot access Google Sheets data

1. Verify the service account has access to the Google Sheet:
   - Share the Google Sheet with the service account email address

2. Check if the Sheet ID is correct:
   - The Sheet ID is the long string in the URL of your Google Sheet

## Environment Variables

### Environment variables not being recognized

1. Check if `.env` file is properly formatted:
   ```bash
   cd backend
   cat .env
   ```

2. Verify environment variables are properly exported:
   ```bash
   export $(grep -v '^#' .env | xargs)
   ```

3. For Cloud Run, ensure environment variables are set in the deployment command. 