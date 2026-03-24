from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from app.linkedin_scraper import LinkedInScraper
from app.utils.google_sheets import GoogleSheetsManager
from app.config import (
    GOOGLE_CREDENTIALS_PATH,
    LINKEDIN_SHEET_ID,
    LINKEDIN_SHEET_NAME,
    LINKEDIN_PROFILE_URL
)

router = APIRouter()
sheets_manager = GoogleSheetsManager(GOOGLE_CREDENTIALS_PATH)

@router.post("/scrape-and-update")
async def scrape_and_update_linkedin_data() -> Dict[str, Any]:
    """
    Scrape LinkedIn profile data and update it in Google Sheets
    """
    try:
        # Initialize the LinkedIn scraper
        scraper = LinkedInScraper(headless=True, debug=True)
        
        # Scrape the profile data
        profile_data = scraper.scrape(LINKEDIN_PROFILE_URL)
        
        # Get or create spreadsheet
        sheet_id = LINKEDIN_SHEET_ID
        if not sheet_id:
            sheet_id = sheets_manager.create_spreadsheet(LINKEDIN_SHEET_NAME)
            print(f"Created new spreadsheet with ID: {sheet_id}")
        
        # Update the spreadsheet with LinkedIn data
        sheets_manager.update_linkedin_data(sheet_id, profile_data)
        
        return {
            "status": "success",
            "message": "LinkedIn data updated in Google Sheets",
            "sheet_id": sheet_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile-data")
async def get_linkedin_profile_data() -> Dict[str, Any]:
    """
    Get LinkedIn profile data from Google Sheets
    """
    try:
        if not LINKEDIN_SHEET_ID:
            raise HTTPException(status_code=404, detail="Spreadsheet ID not configured")
        
        # Get all data from the sheet
        data = sheets_manager.get_sheet_data(LINKEDIN_SHEET_ID, 'A1:Z1000')
        
        # Process the data into a structured format
        processed_data = process_sheet_data(data)
        
        return processed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def process_sheet_data(data: list) -> Dict[str, Any]:
    """Process raw sheet data into structured format"""
    processed_data = {}
    current_section = None
    section_data = []
    
    for row in data:
        if not row:  # Skip empty rows
            continue
        
        # Check if this is a section header
        if len(row) == 1:
            if current_section:
                processed_data[current_section.lower().replace(" ", "_")] = section_data
            current_section = row[0]
            section_data = []
            continue
        
        # Process section data
        if current_section == "Basic Information":
            if len(row) == 2:
                key = row[0].lower().replace(" ", "_")
                processed_data[key] = row[1]
        else:
            # For other sections, use the first row as headers
            if len(section_data) == 0:
                headers = [h.lower().replace(" ", "_") for h in row]
                section_data = {"headers": headers, "items": []}
            else:
                item = dict(zip(section_data["headers"], row))
                section_data["items"].append(item)
    
    # Add the last section
    if current_section:
        processed_data[current_section.lower().replace(" ", "_")] = section_data
    
    return processed_data 