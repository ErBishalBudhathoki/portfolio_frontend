# Portfolio Website

A professional portfolio website with LinkedIn profile integration, Google Sheets-based blog system, and contact form.

## Features

- Dynamic data fetching from LinkedIn profile
- Blog content managed through Google Sheets
- Responsive design with dark/light mode
- Project showcase with descriptions and technologies
- Skills visualization by category
- Contact form with Google Sheets backend

## Project Structure

The project is divided into two main parts:

- **Backend**: Python-based FastAPI service that handles data fetching and caching
- **Frontend**: Next.js application with React and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- Python 3.8+
- Google Sheets API credentials (provided in the credentials folder)

### Setup Guide

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd portf
```

#### 2. Set Up Environment Variables

Both the frontend and backend need their own environment variables.

**Backend Environment Setup**:

The backend already has the `.env` file configured with:
- LinkedIn profile URL
- Google Sheet ID (1blqFnWjYgB1idiYqqEZR5qfueO0k6vPZv4eP8Yn3xTg)
- API configuration

**Frontend Environment Setup**:

The frontend already has the `.env.local` file configured with:
- API URL (http://localhost:8000)
- Site name and description

#### 3. Google Sheets Credentials

The service account credentials are already configured in the `backend/credentials/google_credentials.json` file.

#### 4. Install Dependencies

**Backend Dependencies**:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend Dependencies**:

```bash
cd frontend
npm install
```

#### 5. Start the Application

You can start both the backend and frontend with a single command:

```bash
# From the project root directory
chmod +x start.sh  # Make the script executable (only needed once)
./start.sh
```

Or start them individually:

**Start the Backend**:

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python run.py
```

**Start the Frontend**:

```bash
cd frontend
npm run dev
```

#### 6. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Contact Form Functionality

The contact form on the website submits data to the backend API at `/api/contact`. The submissions are automatically saved to a designated sheet in the Google Spreadsheet.

## LinkedIn Profile Data

The portfolio shows data from a LinkedIn profile. This data is fetched from the backend API, which scrapes the LinkedIn profile or retrieves cached data. The data is also saved to the Google Spreadsheet for backup and easy management.

## Blog Integration

Blog posts are managed through the Google Sheet. To add or edit blog posts:

1. Access the Google Sheet with ID: `1blqFnWjYgB1idiYqqEZR5qfueO0k6vPZv4eP8Yn3xTg`
2. Update the blog posts in the appropriate sheet
3. The changes will be reflected in the website automatically

## Troubleshooting

### Google Sheets API Issues

If you encounter an error related to Google Sheets API:

1. Verify that the Google Sheets API is enabled in your Google Cloud project
2. Check that the service account has "Editor" access to the spreadsheet
3. Confirm that the `credentials/google_credentials.json` file contains valid credentials

### LinkedIn Scraping Issues

LinkedIn scraping might fail due to:
- Rate limiting
- LinkedIn UI changes
- Authentication issues

If scraping fails, the system will use cached data from the last successful scrape.

## Technologies Used

### Backend
- Python 3.8+
- FastAPI
- Google Sheets API
- LinkedIn scraping libraries

### Frontend
- Next.js 14
- React
- Tailwind CSS
- shadcn/ui components

## License

This project is licensed under the MIT License - see the LICENSE file for details. 