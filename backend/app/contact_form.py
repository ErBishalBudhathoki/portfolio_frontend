import os
import json
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from typing import Dict, Any, Optional
from pydantic import BaseModel, EmailStr

# Import the Google Sheets setup function from the existing module
from .google_sheet import setup_sheets_service

# Google Sheet ID for contact form submissions
# You can create a new sheet or use the existing one with a new tab
SHEET_ID = "1blqFnWjYgB1idiYqqEZR5qfueO0k6vPZv4eP8Yn3xTg"  # Same as blog posts
SHEET_NAME = "contact_submissions"  # New tab name for contact form data

class ContactFormSubmission(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

async def save_contact_submission(submission: ContactFormSubmission) -> Dict[str, Any]:
    """
    Save a contact form submission to Google Sheets
    """
    try:
        # Set up the Google Sheets service
        service = await setup_sheets_service()
        if not service:
            return {
                "success": False,
                "message": "Could not connect to Google Sheets"
            }
        
        # Prepare the data
        now = datetime.now().isoformat()
        row_data = [
            now,  # Timestamp
            submission.name,
            submission.email,
            submission.subject,
            submission.message
        ]
        
        # Prepare the request body
        body = {
            'values': [row_data]
        }
        
        # Append to the sheet
        result = service.spreadsheets().values().append(
            spreadsheetId=SHEET_ID,
            range=f"{SHEET_NAME}!A:E",
            valueInputOption='RAW',
            insertDataOption='INSERT_ROWS',
            body=body
        ).execute()
        
        return {
            "success": True,
            "message": "Contact form submission saved"
        }
    
    except Exception as e:
        print(f"Error saving contact submission: {e}")
        return {
            "success": False,
            "message": f"Error saving submission: {str(e)}"
        }

# Function to create the contact submissions sheet if it doesn't exist
async def ensure_contact_sheet_exists():
    """
    Check if the contact submissions sheet exists, and create it if it doesn't
    """
    try:
        service = await setup_sheets_service()
        if not service:
            print("Could not set up Google Sheets service")
            return {"success": False, "message": "Could not set up Google Sheets service"}
        
        # First, check if the sheet already exists
        sheet_metadata = service.spreadsheets().get(spreadsheetId=SHEET_ID).execute()
        sheets = sheet_metadata.get('sheets', [])
        sheet_exists = any(sheet['properties']['title'] == SHEET_NAME for sheet in sheets)
        
        if not sheet_exists:
            # Create a new sheet
            body = {
                'requests': [{
                    'addSheet': {
                        'properties': {
                            'title': SHEET_NAME
                        }
                    }
                }]
            }
            service.spreadsheets().batchUpdate(
                spreadsheetId=SHEET_ID,
                body=body
            ).execute()
            
            # Add headers to the new sheet
            headers = ['Timestamp', 'Name', 'Email', 'Subject', 'Message']
            service.spreadsheets().values().update(
                spreadsheetId=SHEET_ID,
                range=f"{SHEET_NAME}!A1:E1",
                valueInputOption='RAW',
                body={'values': [headers]}
            ).execute()
            
            print(f"Created new sheet '{SHEET_NAME}' for contact submissions")
        
        return {"success": True, "message": "Contact form sheet exists"}
    
    except Exception as e:
        print(f"Error ensuring contact sheet exists: {e}")
        return {"success": False, "message": f"Error ensuring contact sheet exists: {str(e)}"} 