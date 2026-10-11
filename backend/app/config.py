import os
from pathlib import Path
from dotenv import load_dotenv

# Load backend/.env before any environment variable is read below.
load_dotenv()

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
CREDENTIALS_DIR = BASE_DIR / "credentials"

# Google Sheets Configuration
GOOGLE_CREDENTIALS_PATH = str(CREDENTIALS_DIR / "google_credentials.json")
# The spreadsheet ID that backs the portfolio CMS. Sourced from the
# SHEET_ID environment variable (backend/.env) - never hardcoded.
SHEET_ID = os.getenv("SHEET_ID", "")
LINKEDIN_SHEET_ID = os.getenv("LINKEDIN_SHEET_ID", "")  # Will be created if not exists
LINKEDIN_SHEET_NAME = "LinkedIn Profile Data"

# LinkedIn Configuration
LINKEDIN_PROFILE_URL = os.getenv("LINKEDIN_PROFILE_URL", "https://www.linkedin.com/in/bishalbudhathoki/")
LINKEDIN_COOKIE_PATH = str(CREDENTIALS_DIR / "linkedin_cookie.json") 