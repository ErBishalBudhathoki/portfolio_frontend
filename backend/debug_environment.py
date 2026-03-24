#!/usr/bin/env python3
import os
import sys
import json
import importlib
import subprocess
from pathlib import Path
from dotenv import load_dotenv

# Define colors for terminal output
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
ENDC = "\033[0m"
BOLD = "\033[1m"

def print_status(message, status, details=None):
    """Print a status message with proper formatting."""
    if status == "OK":
        status_color = GREEN
    elif status == "WARNING":
        status_color = YELLOW
    else:  # ERROR
        status_color = RED
        
    print(f"{BLUE}[TEST]{ENDC} {message}: {status_color}{status}{ENDC}")
    if details:
        print(f"      {details}")

def check_python_version():
    """Check if Python version is compatible."""
    import platform
    version = platform.python_version()
    major, minor, _ = version.split('.')
    
    if int(major) < 3 or (int(major) == 3 and int(minor) < 8):
        print_status("Python version", "ERROR", f"Found {version}, but 3.8+ is required")
        return False
    else:
        print_status("Python version", "OK", f"Found {version}")
        return True

def check_installed_packages():
    """Check if required packages are installed."""
    required_packages = [
        "fastapi", "uvicorn", "python-dotenv", "pandas", "requests",
        "gspread", "google-auth", "google-api-python-client", "selenium",
        "beautifulsoup4", "lxml", "firebase-admin", "pydantic", "httpx"
    ]
    
    missing = []
    for package in required_packages:
        try:
            importlib.import_module(package.replace("-", "_"))
        except ImportError:
            missing.append(package)
    
    if missing:
        print_status("Python packages", "ERROR", f"Missing: {', '.join(missing)}")
        return False
    else:
        print_status("Python packages", "OK", "All required packages are installed")
        return True

def check_env_file():
    """Check if .env file exists and has required values."""
    env_path = Path(".env")
    if not env_path.exists():
        print_status(".env file", "ERROR", "File not found")
        return False
    
    load_dotenv()
    required_vars = [
        "LINKEDIN_PROFILE_URL", "LINKEDIN_EMAIL", "LINKEDIN_PASSWORD",
        "SHEET_ID", "SHEET_NAME", "HOST", "PORT",
        "FIREBASE_SERVICE_ACCOUNT", "FIREBASE_STORAGE_BUCKET"
    ]
    
    missing = [var for var in required_vars if not os.getenv(var)]
    
    if missing:
        print_status(".env file", "WARNING", f"Missing variables: {', '.join(missing)}")
        return False
    else:
        print_status(".env file", "OK", "All required variables found")
        return True

def check_credentials_folder():
    """Check if the credentials folder exists and has required files."""
    cred_path = Path("credentials")
    if not cred_path.exists() or not cred_path.is_dir():
        print_status("Credentials folder", "ERROR", "Folder not found")
        return False
    
    # Check for Google credentials
    google_creds = list(cred_path.glob("*google*credentials*.json"))
    if not google_creds:
        print_status("Google credentials", "ERROR", "File not found in credentials folder")
        return False
    else:
        print_status("Google credentials", "OK", f"Found {google_creds[0].name}")
        
        # Validate JSON format
        try:
            with open(google_creds[0]) as f:
                json.load(f)
            print_status("Google credentials format", "OK", "Valid JSON format")
        except json.JSONDecodeError:
            print_status("Google credentials format", "ERROR", "Invalid JSON format")
            return False
    
    # Check for Firebase credentials
    firebase_creds = list(cred_path.glob("*firebase*credentials*.json"))
    if not firebase_creds:
        print_status("Firebase credentials", "ERROR", "File not found in credentials folder")
        return False
    else:
        print_status("Firebase credentials", "OK", f"Found {firebase_creds[0].name}")
        
        # Validate JSON format
        try:
            with open(firebase_creds[0]) as f:
                firebase_json = json.load(f)
                
            # Check for required Firebase fields
            required_fields = ["type", "project_id", "private_key", "client_email"]
            missing_fields = [field for field in required_fields if field not in firebase_json]
            
            if missing_fields:
                print_status("Firebase credentials content", "WARNING", 
                            f"Missing fields: {', '.join(missing_fields)}")
            else:
                print_status("Firebase credentials content", "OK", 
                            f"Project ID: {firebase_json.get('project_id')}")
                
        except json.JSONDecodeError:
            print_status("Firebase credentials format", "ERROR", "Invalid JSON format")
            return False
    
    return True

def check_firebase_connection():
    """Test Firebase connection."""
    try:
        from firebase_admin import credentials, firestore, initialize_app
        
        # Get Firebase credentials path from env or use default
        firebase_creds_path = os.getenv("FIREBASE_SERVICE_ACCOUNT", "credentials/firebase-credentials.json")
        
        # Initialize Firebase
        if not os.path.exists(firebase_creds_path):
            print_status("Firebase connection", "ERROR", f"Credentials file not found at {firebase_creds_path}")
            return False
        
        try:
            cred = credentials.Certificate(firebase_creds_path)
            app = initialize_app(cred)
            db = firestore.client()
            # Try to access a collection
            db.collection('test').limit(1).get()
            print_status("Firebase connection", "OK", "Successfully connected to Firestore")
            return True
        except Exception as e:
            print_status("Firebase connection", "ERROR", f"Failed to connect: {str(e)}")
            return False
    except ImportError:
        print_status("Firebase connection", "ERROR", "firebase-admin module not installed")
        return False

def check_selenium_setup():
    """Check if Selenium can be initialized."""
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        
        print_status("Selenium import", "OK", "Module imported successfully")
        
        # Try to set up Chrome options
        options = Options()
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        
        print_status("Chrome options", "OK", "Headless Chrome options configured")
        
        try:
            driver = webdriver.Chrome(options=options)
            driver.quit()
            print_status("Chrome WebDriver", "OK", "Successfully initialized and closed")
            return True
        except Exception as e:
            print_status("Chrome WebDriver", "ERROR", f"Failed to initialize: {str(e)}")
            return False
    except ImportError:
        print_status("Selenium import", "ERROR", "selenium module not installed")
        return False

def check_google_sheets_connection():
    """Test connection to Google Sheets."""
    try:
        import gspread
        from google.oauth2.service_account import Credentials
        
        # Get credentials path from env or use default
        google_creds_path = os.getenv("GOOGLE_CREDENTIALS_PATH", "credentials/google_credentials.json")
        sheet_id = os.getenv("SHEET_ID")
        
        if not sheet_id:
            print_status("Google Sheets connection", "ERROR", "SHEET_ID not defined in .env")
            return False
        
        if not os.path.exists(google_creds_path):
            print_status("Google Sheets connection", "ERROR", f"Credentials file not found at {google_creds_path}")
            return False
        
        try:
            scopes = [
                "https://www.googleapis.com/auth/spreadsheets",
                "https://www.googleapis.com/auth/drive"
            ]
            creds = Credentials.from_service_account_file(google_creds_path, scopes=scopes)
            client = gspread.authorize(creds)
            
            # Try to open the spreadsheet
            sheet = client.open_by_key(sheet_id)
            print_status("Google Sheets connection", "OK", f"Successfully opened sheet: {sheet.title}")
            return True
        except Exception as e:
            print_status("Google Sheets connection", "ERROR", f"Failed to connect: {str(e)}")
            return False
    except ImportError:
        print_status("Google Sheets connection", "ERROR", "gspread or google-auth module not installed")
        return False

def main():
    """Run all diagnostic checks."""
    print(f"\n{BOLD}{BLUE}====== Backend Environment Diagnostic ======{ENDC}\n")
    
    # Run all checks
    checks = [
        ("Python Version", check_python_version),
        ("Required Packages", check_installed_packages),
        ("Environment File", check_env_file),
        ("Credentials Folder", check_credentials_folder),
        ("Google Sheets Connection", check_google_sheets_connection),
        ("Firebase Connection", check_firebase_connection),
        ("Selenium Setup", check_selenium_setup)
    ]
    
    results = {}
    for name, check_func in checks:
        print(f"\n{BOLD}Checking {name}...{ENDC}")
        results[name] = check_func()
    
    # Print summary
    print(f"\n{BOLD}{BLUE}====== Diagnostic Summary ======{ENDC}\n")
    
    all_passed = True
    for name, passed in results.items():
        status = f"{GREEN}PASSED{ENDC}" if passed else f"{RED}FAILED{ENDC}"
        print(f"{name}: {status}")
        all_passed = all_passed and passed
    
    if all_passed:
        print(f"\n{GREEN}All checks passed! Environment is ready for development.{ENDC}")
        return 0
    else:
        print(f"\n{YELLOW}Some checks failed. Please fix the issues above before proceeding.{ENDC}")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 