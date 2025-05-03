#!/usr/bin/env python
"""
Scheduled LinkedIn Profile Scraping Script

This script is designed to be run as a cron job or scheduled task
to periodically scrape the LinkedIn profile and update the cached data.
"""

import os
import sys
import json
import asyncio
from datetime import datetime

# Add the parent directory to the path to import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.linkedin_scraper import scrape_linkedin_profile
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Path to store scraped LinkedIn data
LINKEDIN_DATA_PATH = os.path.abspath(os.path.join(
    os.path.dirname(__file__), 
    '../data/linkedin_data.json'
))
DATA_DIR = os.path.dirname(LINKEDIN_DATA_PATH)

async def main():
    """Main function to scrape and save LinkedIn profile data"""
    print(f"Starting LinkedIn profile scrape at {datetime.now().isoformat()}")
    
    try:
        # Create data directory if it doesn't exist
        os.makedirs(DATA_DIR, exist_ok=True)
        
        # Scrape LinkedIn profile
        profile_data = await scrape_linkedin_profile()
        
        # Add timestamp
        profile_data['last_updated'] = datetime.now().isoformat()
        
        # Save to file
        with open(LINKEDIN_DATA_PATH, 'w') as f:
            json.dump(profile_data, f)
        
        print(f"LinkedIn profile scraped successfully and saved to {LINKEDIN_DATA_PATH}")
    except Exception as e:
        print(f"Error during LinkedIn profile scraping: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 