import os
import sys
import uvicorn
from dotenv import load_dotenv
import subprocess
import time

# Load environment variables
load_dotenv()

# Get configuration
host = os.getenv('HOST', '0.0.0.0')
port = int(os.getenv('PORT', '8000'))
debug = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')

print("=========================================")
print("Starting up Portfolio Backend API...")
print("=========================================")

# Test Firebase connection
print("Checking Firebase connection...")
try:
    # This is safer than importing Firebase modules directly
    # in case they're not installed
    result = subprocess.run(
        [sys.executable, "-c", """
import firebase_admin
from firebase_admin import credentials, firestore
try:
    # Attempt to initialize Firebase
    cred = credentials.Certificate('credentials/firebase-credentials.json')
    app = firebase_admin.initialize_app(cred)
    db = firestore.client()
    # Try to access a collection to verify Firestore is set up
    docs = list(db.collection('test').limit(1).get())
    print('Firebase connection successful!')
    exit(0)
except Exception as e:
    print(f'❌ Firebase connection failed: {str(e)}')
    exit(1)
"""
        ],
        capture_output=True,
        text=True,
    )
    
    # If connection failed, set up Firebase
    if result.returncode != 0:
        print(result.stdout.strip())
        print("Attempting to set up Firebase database...")
        
        # Run setup_firebase.py
        try:
            setup_result = subprocess.run(
                [sys.executable, "setup_firebase.py"],
                capture_output=True,
                text=True,
                check=True
            )
            print(setup_result.stdout.strip())
            print("✅ Firebase setup complete!")
        except subprocess.CalledProcessError as e:
            print(f"❌ Firebase setup failed: {e}")
            print(e.stdout)
            print(e.stderr)
            # Continue anyway - the app can still start without Firebase
except Exception as e:
    print(f"Error during Firebase check: {str(e)}")
    # Continue anyway - the app can still start without Firebase

print(f"\nStarting FastAPI server on {host}:{port}")
time.sleep(1)

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=debug
    ) 