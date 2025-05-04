# Portfolio Website

A professional portfolio website with a FastAPI backend for LinkedIn profile scraping and a Next.js frontend for displaying the portfolio.

## Project Structure

```
├── backend/           # FastAPI backend application
│   ├── app/           # Application code
│   ├── data/          # Scraped data storage
│   ├── credentials/   # Credentials for external APIs
│   ├── Dockerfile     # Docker configuration
│   ├── requirements.txt # Python dependencies
│   ├── run.py         # Application entry point
│   └── setup.sh       # Local setup script
│
├── frontend/          # Next.js frontend application
│   ├── components/    # React components
│   ├── pages/         # Next.js pages
│   ├── public/        # Static assets
│   ├── styles/        # CSS styles
│   ├── Dockerfile     # Docker configuration
│   └── package.json   # Node.js dependencies
│
├── docker-compose.yml # Docker Compose configuration
└── start.sh           # Script to start both services
```

## Getting Started

### Option 1: Using Docker (Recommended)

1. Make sure you have Docker and Docker Compose installed
2. Clone this repository
3. Start the application:

```bash
docker-compose up
```

4. Access:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Option 2: Local Development

#### Backend Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```
   - On Windows:
     ```
     venv\Scripts\activate
     ```

3. Install the dependencies:
   ```
   pip install -r requirements.txt
   ```

4. For development, you can also install development dependencies:
   ```
   pip install -r requirements-dev.txt
   ```

5. Set up environment variables:
   Create a `.env` file in the backend directory with the following variables:
   ```
   GOOGLE_SHEETS_CREDENTIALS=your_google_sheets_credentials_json
   LINKEDIN_PASSWORD=your_linkedin_password
   ```

6. Run the application:
   ```
   python run_local.py
   ```
   or
   ```
   ./run_local.py
   ```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Features

- 🔍 LinkedIn profile scraping
- 📊 Portfolio showcase
- 📝 Blog integration
- 📫 Contact form

## Environment Variables

### Backend (.env)

```
STAGE=dev
HOST=0.0.0.0
PORT=8000
LINKEDIN_USERNAME=your_username
LINKEDIN_PASSWORD=your_password
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Cleaning Up

To clean up AWS deployment files:

```bash
cd backend
./cleanup.sh
```

# Portfolio Backend

This is the backend for the portfolio application, built with FastAPI.

## Local Development Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```
   - On Windows:
     ```
     venv\Scripts\activate
     ```

3. Install the dependencies:
   ```
   pip install -r requirements.txt
   ```

4. For development, you can also install development dependencies:
   ```
   pip install -r requirements-dev.txt
   ```

5. Set up environment variables:
   Create a `.env` file in the backend directory with the following variables:
   ```
   GOOGLE_SHEETS_CREDENTIALS=your_google_sheets_credentials_json
   LINKEDIN_PASSWORD=your_linkedin_password
   ```

## Running the Application

To run the application locally:

```
python run_local.py
```

or

```
./run_local.py
```

The API will be available at http://localhost:8000

## API Endpoints

- `/linkedin/profile/{profile_url}`: Scrape and return LinkedIn profile data
- `/sheets/update/{profile_url}`: Update Google Sheets with LinkedIn profile data

## Development

For development, the application uses hot-reloading, so any changes to the code will automatically reload the application.

## Recent Updates

### LinkedIn Scraper Fixes (May 2023)

The LinkedIn scraper has been upgraded with better Chrome and ChromeDriver handling for improved reliability:

- **Robust Chrome Configuration**: Updated Chrome options to work better in headless and containerized environments
- **Multiple Driver Setup Methods**: The scraper now tries several methods to initialize the Chrome driver, making it more resilient
- **Enhanced Error Handling**: Better error recovery with fallback data if scraping fails
- **Diagnostic Tools**: Added a new test script (`test_selenium.py`) to diagnose environment issues
- **Cloud Run Compatibility**: Improved Docker configuration for Google Cloud Run

To test your environment for LinkedIn scraping compatibility, run:

```bash
cd backend
python test_selenium.py
```

## Architecture

### Frontend
- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Hosting**: Google Cloud Run

### Backend
- **Framework**: FastAPI
- **Data Storage**: Google Sheets API
- **Hosting**: Google Cloud Run

## Setup Instructions

// ... existing code ... 