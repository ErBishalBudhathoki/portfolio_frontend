# Portfolio Project

Full-stack portfolio website with a Next.js frontend and Python backend, deployed to Google Cloud.

## Project Structure

- `frontend/` - Next.js 14 frontend with TailwindCSS and TypeScript
- `backend/` - Python backend API 

## Setup

Before running the application, you need to set up the required credentials and environment variables.

**First-time users:** For a comprehensive guide on obtaining credentials and detailed setup instructions, please refer to [SETUP.md](SETUP.md).

### Credentials Setup

The project requires Google Sheets and Firebase credentials. Use the provided setup script:

```bash
# Run the credentials setup script:
./setup_credentials.sh
```

This script will:
1. Create necessary credentials directories
2. Help you copy your Google and Firebase credentials to the correct locations
3. Set up initial environment files

#### How the Credentials Setup Script Works

When a new user runs the script:

1. The script creates the `credentials` directories in both frontend and backend folders
2. It prompts the user for the path to their Google credentials JSON file
   - If provided, the script validates the JSON and copies it to `backend/credentials/google_credentials.json`
   - If skipped (by pressing Enter), the user can add it manually later
3. It prompts for the path to Firebase credentials JSON file
   - If provided, the script validates the JSON, copies it to `backend/credentials/firebase-credentials.json`
   - It extracts the Firebase project ID for use in environment files
   - It provides a direct link to the Firebase console for that project
4. It creates `.env` files with proper configurations if they don't exist
   - Backend `.env` file with LinkedIn, Google Sheets, and Firebase settings
   - Frontend `.env.local` file with API URL and site name

This approach makes it easy for new users to get started without needing to know the exact file structure requirements.

### Manual Setup (Alternative)

If you prefer to set up manually:

1. Create directories:
   ```bash
   mkdir -p backend/credentials
   ```

2. Copy your credentials:
   - Google credentials: Copy to `backend/credentials/google_credentials.json`
   - Firebase credentials: Copy to `backend/credentials/firebase-credentials.json`

3. Create environment files:
   - Copy `backend/env.example` to `backend/.env` and update with your values
   - Create `frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8000`

### Manual Firestore Database Creation (REQUIRED)

> **Important:** Before running the backend for the first time, you must manually create a Firestore database for your Firebase project. This cannot be done by code or deployment scripts.
>
> **How to do it:**
> 1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
> 2. Select your project.
> 3. In the left menu, click **Firestore Database**.
> 4. Click **Create database**.
> 5. Choose **Native mode** and select a location (irreversible).
> 6. Click **Create**.
>
> Alternatively, you can use the [Google Cloud Console Firestore setup](https://console.cloud.google.com/datastore/setup?project=YOUR_PROJECT_ID).
>
> After this, your backend code will be able to create collections and documents automatically.

## Local Development

Start the development environment with:

```bash
./start_local_dev.sh
```

This script will:
1. Check prerequisites (Python, Node.js)
2. Verify environment files and credentials
3. Run diagnostics
4. Start the backend and frontend servers

### Backend Diagnostics

The project includes a comprehensive diagnostic script (`backend/debug_environment.py`) that:

- Checks Python version and required packages
- Validates environment variables and credential files
- Tests connections to Google Sheets and Firebase
- Verifies Selenium and Chrome WebDriver setup
- Provides a detailed report of any issues found

This diagnostics script runs automatically during startup but can also be run manually:

```bash
cd backend
python debug_environment.py
```

### Firebase Database Setup

If you're using a new Firebase project or need to set up the database:

```bash
cd backend
python setup_firebase.py
```

This script automatically creates the necessary collections and documents for the application:

1. Initializes Firebase with your credentials
2. Creates and configures Firestore collections:
   - `messages` - For storing user messages
   - `analytics` - For tracking page views and events
   - `visitors` - For counting site visitors
3. Tests read/write operations to ensure everything is working
4. Provides direct links to your Firebase console

The Firebase setup happens automatically during deployment and local startup if the database is not already configured.

## When to Use backend/startup.sh

The `backend/startup.sh` script is designed as the entrypoint for the backend when running in a Docker container or production environment (such as Google Cloud Run or GKE).

### When is startup.sh used?

- **Production/Container Deployments:**
  - `startup.sh` is executed automatically as the entrypoint when the backend Docker image is run (e.g., in Cloud Run, GKE, or any Docker environment).
  - It installs and verifies Chrome/ChromeDriver for Selenium, sets up credentials, runs diagnostics, and starts the FastAPI server.
- **Cloud Build/Cloud Run:**
  - When deploying to Google Cloud Run, the Dockerfile's `CMD` or `ENTRYPOINT` runs `startup.sh` to ensure all dependencies and environment checks are performed before launching the API.

### When NOT to use startup.sh

- **Local Development:**
  - You do **not** need to run `startup.sh` manually during local development.
  - Instead, use `./start_local_dev.sh` from the project root, which handles both backend and frontend in a developer-friendly way.

### Summary Table

| Environment         | How to Start Backend         | Uses `startup.sh`? |
|---------------------|-----------------------------|--------------------|
| Local Development   | `./start_local_dev.sh`      | No                 |
| Docker/Production   | Dockerfile/Cloud Run deploy | Yes (automatic)    |

**You only need to use `startup.sh` directly if you are running the backend container outside the dev script, e.g., for manual Docker testing or custom production setups.**

## Deployment

### Frontend Deployment

The frontend is deployed to Google Cloud Run using the provided deployment script:

```bash
cd frontend
./deploy.sh
```

See `frontend/README.md` for more detailed information.

### Utility Scripts

Several utility scripts are included to help manage the project:

- `cleanup-simple.sh` - Cleans up unused Docker images from Google Container Registry to reduce costs
- `github-sync.sh` - Comprehensive tool to push the project to GitHub with proper authentication handling
- `push-to-github.sh` - Simple script to push to GitHub quickly

### GitHub Integration

To push the entire project to GitHub:

```bash
# For a comprehensive guided experience with authentication handling:
./github-sync.sh

# For a simpler push:
./push-to-github.sh
```

The GitHub sync tool will:
- Initialize git if needed
- Add and commit all files
- Configure the remote repository
- Push to GitHub
- Handle common authentication issues
- Provide clear instructions for SSH and HTTPS

## Maintenance

To clean up unused Docker images from Google Container Registry:

```bash
./cleanup-simple.sh
```

This helps reduce storage costs in Google Cloud by removing old images while keeping the most recent ones and any images tagged as "express".

## Automation Scripts

The project includes several automation scripts to simplify development and maintenance:

### Setup Scripts

- `setup_credentials.sh` - Interactive script to set up credentials and environment files
- `start_local_dev.sh` - Comprehensive script to start the development environment
- `backend/setup_firebase.py` - Sets up Firebase database collections and initial documents
- `backend/debug_environment.py` - Runs diagnostics on the backend environment

### Deployment Scripts

- `deploy.sh` - Deploys the entire application to Google Cloud
- `frontend/deploy.sh` - Deploys only the frontend to Cloud Run
- `backend/deploy.sh` - Deploys only the backend to Cloud Run

### Maintenance Scripts

- `cleanup-simple.sh` - Cleans up unused Docker images
- `github-sync.sh` - Syncs the codebase with GitHub
- `push-to-github.sh` - Simple GitHub push script

These scripts are designed to make it easy for anyone to work with the codebase, even without deep knowledge of all the technologies involved.

## Documentation

Detailed documentation for each part of the project can be found in:
- `frontend/README.md` - Frontend documentation
- `backend/README.md` - Backend documentation
- `DEPLOYMENT.md` - Detailed deployment guide
- `TROUBLESHOOTING.md` - Solutions to common issues
