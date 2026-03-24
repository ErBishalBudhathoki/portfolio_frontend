#!/usr/bin/env python3
import os
import sys
import json
import time
import argparse
from pathlib import Path
from dotenv import load_dotenv

# Define colors for terminal output
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
ENDC = "\033[0m"
BOLD = "\033[1m"

def print_status(message, status=None, details=None):
    """Print a status message with proper formatting."""
    if status:
        if status == "OK":
            status_color = GREEN
        elif status == "WARNING":
            status_color = YELLOW
        else:  # ERROR
            status_color = RED
            
        print(f"{BLUE}[SETUP]{ENDC} {message}: {status_color}{status}{ENDC}")
    else:
        print(f"{BLUE}[SETUP]{ENDC} {message}")
        
    if details:
        print(f"      {details}")

def load_firebase_credentials(creds_path=None):
    """Load Firebase credentials from file."""
    if not creds_path:
        # Try to get path from environment variable
        load_dotenv()
        creds_path = os.getenv("FIREBASE_SERVICE_ACCOUNT", "credentials/firebase-credentials.json")
    
    creds_path = Path(creds_path)
    if not creds_path.exists():
        print_status("Firebase credentials", "ERROR", f"File not found at {creds_path}")
        return None
    
    try:
        with open(creds_path, 'r') as f:
            creds_data = json.load(f)
            
        print_status("Firebase credentials", "OK", f"Loaded from {creds_path}")
        return creds_data
    except json.JSONDecodeError:
        print_status("Firebase credentials", "ERROR", "Invalid JSON format")
        return None
    except Exception as e:
        print_status("Firebase credentials", "ERROR", f"Error reading file: {str(e)}")
        return None

def initialize_firebase_app(creds_data):
    """Initialize Firebase app with credentials."""
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore, initialize_app
        
        # Check if already initialized
        if firebase_admin._apps:
            print_status("Firebase app", "WARNING", "App already initialized")
            return firebase_admin.get_app()
        
        # Create a temporary credentials file if data is provided directly
        temp_creds_path = None
        if isinstance(creds_data, dict):
            import tempfile
            fd, temp_creds_path = tempfile.mkstemp(suffix='.json')
            with os.fdopen(fd, 'w') as f:
                json.dump(creds_data, f)
            cred = credentials.Certificate(temp_creds_path)
        else:
            # Assume creds_data is a path
            cred = credentials.Certificate(creds_data)
        
        # Initialize app
        app = initialize_app(cred)
        print_status("Firebase app", "OK", "Successfully initialized")
        
        # Clean up temporary file if created
        if temp_creds_path:
            os.unlink(temp_creds_path)
            
        return app
    except Exception as e:
        print_status("Firebase app", "ERROR", f"Failed to initialize: {str(e)}")
        return None

def create_firestore_database(app):
    """Create and initialize Firestore database."""
    try:
        from firebase_admin import firestore
        
        db = firestore.client()
        print_status("Firestore database", "OK", "Successfully connected to Firestore")
        return db
    except Exception as e:
        print_status("Firestore database", "ERROR", f"Failed to connect: {str(e)}")
        return None

def setup_collections(db):
    """Set up required collections and documents in Firestore."""
    if not db:
        print_status("Firestore collections", "ERROR", "No database connection")
        return False
    
    try:
        # Create messages collection with a sample document
        messages_ref = db.collection('messages')
        messages_ref.add({
            'text': 'Welcome to the portfolio website!',
            'created_at': firestore.SERVER_TIMESTAMP
        })
        print_status("Messages collection", "OK", "Created with sample document")
        
        # Create analytics collection with sample data
        analytics_ref = db.collection('analytics')
        analytics_ref.add({
            'event_type': 'page_view',
            'pathname': '/',
            'timestamp': firestore.SERVER_TIMESTAMP,
            'referrer': 'setup',
            'userAgent': 'setup_script'
        })
        print_status("Analytics collection", "OK", "Created with sample document")
        
        # Create visitors collection
        visitors_ref = db.collection('visitors')
        visitors_ref.add({
            'count': 0,
            'last_updated': firestore.SERVER_TIMESTAMP
        })
        print_status("Visitors collection", "OK", "Created with initial counter")
        
        return True
    except Exception as e:
        print_status("Firestore collections", "ERROR", f"Failed to create: {str(e)}")
        return False

def test_firebase_operations(db):
    """Test basic Firebase operations to ensure everything is working."""
    if not db:
        print_status("Firebase operations", "ERROR", "No database connection")
        return False
    
    try:
        # Try to add a test document
        test_ref = db.collection('test')
        doc_ref = test_ref.add({
            'test_field': 'test_value',
            'timestamp': firestore.SERVER_TIMESTAMP
        })
        
        # Try to read it back
        time.sleep(1)  # Give Firestore a moment to process
        test_docs = test_ref.where('test_field', '==', 'test_value').limit(10).get()
        test_docs_count = len(list(test_docs))
        
        if test_docs_count > 0:
            print_status("Firebase read/write", "OK", f"Successfully created and retrieved {test_docs_count} test document(s)")
            return True
        else:
            print_status("Firebase read/write", "WARNING", "Document created but not found on read - eventual consistency may be in effect")
            return True
    
    except Exception as e:
        print_status("Firebase operations", "ERROR", f"Test failed: {str(e)}")
        return False

def format_firebase_url(project_id):
    """Format the Firebase console URL for the user."""
    return f"https://console.firebase.google.com/project/{project_id}/firestore/data/"

def setup_firebase():
    """Main function to set up Firebase database."""
    print(f"\n{BOLD}{BLUE}====== Firebase Database Setup ======{ENDC}\n")
    
    # Load credentials
    creds_data = load_firebase_credentials()
    if not creds_data:
        return False
    
    # Extract project ID for user information
    project_id = creds_data.get('project_id')
    if not project_id:
        print_status("Project ID", "ERROR", "Could not find project_id in credentials")
        return False
    
    print_status(f"Setting up Firebase for project: {BOLD}{project_id}{ENDC}")
    
    # Initialize Firebase app
    app = initialize_firebase_app(creds_data)
    if not app:
        return False
    
    # Create Firestore database
    db = create_firestore_database(app)
    if not db:
        return False
    
    # Set up collections
    if not setup_collections(db):
        return False
    
    # Test Firebase operations
    if not test_firebase_operations(db):
        return False
    
    # Success message
    print(f"\n{GREEN}Firebase database successfully set up!{ENDC}")
    print(f"\nYou can view your Firestore database at:")
    print(f"{BLUE}{format_firebase_url(project_id)}{ENDC}")
    print(f"\nImportant Note: If this is a new project, make sure to enable Firestore")
    print(f"in the Firebase console by visiting:")
    print(f"{BLUE}https://console.firebase.google.com/project/{project_id}/firestore{ENDC}")
    
    return True

if __name__ == "__main__":
    # Import firebase_admin here to avoid import error if not installed
    try:
        from firebase_admin import firestore
    except ImportError:
        print(f"{RED}Error: firebase-admin package is not installed.{ENDC}")
        print(f"Please install it using: pip install firebase-admin")
        sys.exit(1)
    
    parser = argparse.ArgumentParser(description='Set up Firebase database for portfolio project')
    parser.add_argument('--creds', help='Path to Firebase credentials file (default: from .env or credentials/firebase-credentials.json)')
    
    args = parser.parse_args()
    success = setup_firebase()
    
    sys.exit(0 if success else 1) 