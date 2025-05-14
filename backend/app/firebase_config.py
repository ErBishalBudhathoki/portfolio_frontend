import os
import firebase_admin
from firebase_admin import credentials, firestore, storage
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK with service account credentials"""
    try:
        # Check if Firebase app is already initialized
        if not firebase_admin._apps:
            # Check for service account credentials
            cred_path = os.getenv('FIREBASE_SERVICE_ACCOUNT', '/app/credentials/firebase-credentials.json')
            
            # If credentials file exists, use it
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
            else:
                # Try to use environment variable with JSON content
                cred_json = os.getenv('FIREBASE_CREDENTIALS_JSON')
                if cred_json:
                    from tempfile import NamedTemporaryFile
                    
                    # Create temporary file with credentials
                    temp_cred_file = NamedTemporaryFile(delete=False)
                    with open(temp_cred_file.name, 'w') as f:
                        f.write(cred_json)
                    
                    cred = credentials.Certificate(temp_cred_file.name)
                    # Clean up after ourselves
                    os.unlink(temp_cred_file.name)
                else:
                    raise ValueError("Firebase credentials not found")
            
            # Initialize app with credentials and storage bucket
            firebase_admin.initialize_app(cred, {
                'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET')
            })
            
            print("Firebase Admin SDK initialized successfully")
        
        # Get Firestore client
        db = firestore.client()
        # Get Storage bucket
        bucket = storage.bucket()
        
        return {
            "db": db,
            "bucket": bucket
        }
    
    except Exception as e:
        print(f"Failed to initialize Firebase: {str(e)}")
        # Provide empty implementations for testing/development
        return {
            "db": None,
            "bucket": None
        }

# Export Firebase resources
firebase = initialize_firebase() 