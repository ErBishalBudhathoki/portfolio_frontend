# Portfolio Backend

FastAPI backend for the portfolio application, providing data from LinkedIn and other sources.

## Features

- LinkedIn profile data integration
- Google Sheets data storage
- RESTful API endpoints for frontend consumption
- Containerized for deployment to Google Cloud Run
- Telegram notifications for critical events

## Directory Structure

```
backend/
├── app/             # Main application code
├── credentials/     # Authentication credentials (gitignored)
├── data/            # Cached data files (gitignored)
├── docs/            # API documentation
├── scripts/         # Utility scripts for maintenance tasks  
├── Dockerfile       # Container configuration
├── env.example      # Template for environment variables
├── requirements.txt # Production dependencies
├── run_app.py       # Local development runner script
└── startup.sh       # Container startup script
```

## Getting Started

### Prerequisites

- Python 3.8+
- pip
- Docker (for containerized deployment)

### Local Development

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy `env.example` to `.env` and configure your environment variables.

4. Run the application:
```bash
python run_app.py
```

The API will be available at http://localhost:8000

## API Documentation

Once running, API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Deployment

The backend is deployed to Google Cloud Run. See the project's main [DEPLOYMENT.md](../DEPLOYMENT.md) for deployment instructions.

## License

This project is licensed under the MIT License.

## API Endpoints

- `/linkedin/profile/{profile_url}`: Scrape and return LinkedIn profile data
- `/sheets/update/{profile_url}`: Update Google Sheets with LinkedIn profile data

## Development

For development, the application uses hot-reloading, so any changes to the code will automatically reload the application. 