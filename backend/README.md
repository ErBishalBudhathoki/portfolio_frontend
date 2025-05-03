# Portfolio Backend

This is the backend service for the developer portfolio website. It provides APIs for LinkedIn profile data and blog posts from Google Sheets.

## Features

- LinkedIn profile scraping (using Selenium)
- Google Sheets integration for blog posts
- FastAPI REST endpoints
- Caching to minimize API calls and scraping

## Setup

### Prerequisites

- Python 3.8+
- Chrome browser (for Selenium)
- Google API credentials (for Sheets access)

### Installation

1. Create a virtual environment and activate it:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up environment variables:

```bash
cp env.example .env
```

Edit the `.env` file with your configuration.

4. Google Sheets API Setup:

To access the Google Sheets API, you need either:
- A Google API key (simpler but less secure)
- A service account (recommended for production)

For service account setup:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Sheets API
4. Create a service account and download the JSON credentials
5. Place the credentials file at `credentials/google_credentials.json`
6. Share the Google Sheet with the service account email

### Running the Server

```bash
python run.py
```

The API will be available at http://localhost:8000

## Scheduled Scraping

To set up automated daily LinkedIn profile scraping:

### On Linux/Mac (Cron)

```bash
crontab -e
```

Add the following line to run daily at 1 AM:

```
0 1 * * * cd /path/to/backend && source venv/bin/activate && python scripts/scheduled_scraping.py >> logs/scraping.log 2>&1
```

### On Windows (Task Scheduler)

Create a batch file `scrape.bat`:

```batch
@echo off
cd C:\path\to\backend
call venv\Scripts\activate.bat
python scripts\scheduled_scraping.py >> logs\scraping.log 2>&1
```

Then add this batch file to Windows Task Scheduler.

## API Endpoints

- `GET /`: API status check
- `GET /api/profile`: Get LinkedIn profile data
- `GET /api/blog`: Get blog posts from Google Sheet
- `POST /api/trigger-linkedin-scrape`: Manually trigger LinkedIn scraping 