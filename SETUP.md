# Detailed Setup Guide

This guide provides detailed instructions for setting up the portfolio project from scratch, including obtaining necessary credentials and configuring the environment.

## Prerequisites

Before starting, ensure you have the following installed:

- **Python 3.8+** - Used for the backend API
- **Node.js 16+** - Used for the Next.js frontend
- **npm** - For managing frontend dependencies
- **Git** - For version control

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd portfolio
```

## Step 2: Obtaining Required Credentials

The project requires two sets of credentials:

### Google Cloud Credentials

1. Create or use an existing Google Cloud project at [console.cloud.google.com](https://console.cloud.google.com/)
2. Enable the Google Sheets API and Google Drive API
3. Create a Service Account:
   - Go to **IAM & Admin** > **Service Accounts**
   - Click **Create Service Account**
   - Enter a name and description
   - Grant the role **Editor** for Google Sheets API access
   - Click **Create Key** and select **JSON** format
   - Save the JSON file to your computer

### Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Set up Firestore Database:
   - Click **Firestore Database** in the left menu
   - Click **Create database**
   - Choose either production mode or test mode (you can change this later)
   - Select a location close to your users
4. Generate service account credentials:
   - Go to **Project Settings** > **Service accounts**
   - Click **Generate new private key**
   - Save the JSON file to your computer

## Step 3: Run the Setup Script

Once you have both credential files, run the setup script:

```bash
./setup_credentials.sh
```

Follow the prompts:

1. When asked for Google credentials, enter the full path to the Google JSON file you downloaded
2. When asked for Firebase credentials, enter the full path to the Firebase JSON file you downloaded
3. The script will copy these files to the correct locations and create initial environment files

## Step 4: Edit Environment Variables

The setup script creates `.env` files with default values. You'll need to edit these with your specific information:

### Backend Environment (backend/.env)

Open `backend/.env` and update the following variables:

```
# LinkedIn Scraping Configuration
LINKEDIN_PROFILE_URL=https://www.linkedin.com/in/yourusername/
LINKEDIN_EMAIL=your-email@example.com
LINKEDIN_PASSWORD=your-linkedin-password

# Google Sheet ID
# This is the long string in the URL when you open your Google Sheet
# Example: https://docs.google.com/spreadsheets/d/1abcdefghijklmnopqrstuvwxyz/edit
SHEET_ID=1abcdefghijklmnopqrstuvwxyz 
SHEET_NAME="linkedin_sheet"

# Other configurations can be left as default initially
```

### Frontend Environment (frontend/.env.local)

For local development, the defaults should work fine:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_NAME="Your Portfolio Name"
```

## Step 5: Start the Development Environment

Run the following command to start both backend and frontend:

```bash
./start_local_dev.sh
```

The script will:
1. Check that all requirements are installed
2. Verify your environment files
3. Run diagnostics to ensure everything is properly configured
4. Start the backend server on port 8000
5. Start the frontend server on port 3000

If the diagnostics detect any issues, follow the instructions provided to resolve them.

## Step 6: Set Up Firebase Database

If this is a new Firebase project, you'll need to set up the database collections:

```bash
cd backend
python setup_firebase.py
```

This script automatically:
1. Creates the necessary Firestore collections
2. Sets up initial documents and schema
3. Tests read/write operations to ensure everything works

## Step 7: Accessing the Application

Once everything is running:

- Backend API: http://localhost:8000
- Frontend: http://localhost:3000
- API Documentation: http://localhost:8000/docs

## Troubleshooting

If you encounter issues during setup:

1. **Backend fails to start**: Check `backend/.env` file for correct credentials paths
2. **Firebase connection errors**: Ensure Firestore is enabled in your Firebase project
3. **Google Sheets errors**: Verify the SHEET_ID is correct and your service account has access to the sheet
4. **Selenium/Chrome errors**: Make sure Chrome is installed and path is correct

For more detailed troubleshooting, see `TROUBLESHOOTING.md`.

## Next Steps

After successfully setting up the development environment, you can:

1. Customize the frontend in the `frontend` directory
2. Modify backend API endpoints in `backend/app`
3. Deploy to Google Cloud using the deployment scripts

Refer to `DEPLOYMENT.md` for instructions on deploying to production. 