import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
CREDENTIALS_DIR = BASE_DIR / "credentials"

# Google Sheets Configuration
GOOGLE_CREDENTIALS_PATH = str(CREDENTIALS_DIR / "google_credentials.json")
LINKEDIN_SHEET_ID = os.getenv("LINKEDIN_SHEET_ID", "")  # Will be created if not exists
LINKEDIN_SHEET_NAME = "LinkedIn Profile Data"

# LinkedIn Configuration
LINKEDIN_PROFILE_URL = os.getenv("LINKEDIN_PROFILE_URL", "https://www.linkedin.com/in/bishalbudhathoki/")
LINKEDIN_COOKIE_PATH = str(CREDENTIALS_DIR / "linkedin_cookie.json") 