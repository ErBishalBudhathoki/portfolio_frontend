import os
import json
from datetime import datetime
import pandas as pd
from google.oauth2 import service_account
from googleapiclient.discovery import build
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Google Sheet ID (from the URL)
SHEET_ID = "1blqFnWjYgB1idiYqqEZR5qfueO0k6vPZv4eP8Yn3xTg"
SHEET_NAME = "blog_posts"

# Cache file path
BLOG_CACHE_PATH = os.path.join(os.path.dirname(__file__), "../data/blog_cache.json")
os.makedirs(os.path.dirname(BLOG_CACHE_PATH), exist_ok=True)

async def get_blog_posts_from_sheet() -> List[Dict[str, Any]]:
    """
    Fetch blog posts from Google Sheets
    """
    try:
        print("Fetching blog posts from sheet...")
        
        # Check if cached data exists and is recent (less than 1 hour old)
        if os.path.exists(BLOG_CACHE_PATH):
            with open(BLOG_CACHE_PATH, 'r') as f:
                cache_data = json.load(f)
                last_updated = datetime.fromisoformat(cache_data.get('last_updated', '2000-01-01'))
                if (datetime.now() - last_updated).total_seconds() < 3600:  # 1 hour in seconds
                    print(f"Using cached blog data, last updated: {last_updated}")
                    return cache_data.get('posts', [])
        
        # If no recent cache, fetch from Google Sheets
        service = await setup_sheets_service()
        if not service:
            print("Failed to set up Google Sheets service")
            # Fall back to cache if it exists, otherwise return empty list
            if os.path.exists(BLOG_CACHE_PATH):
                with open(BLOG_CACHE_PATH, 'r') as f:
                    cache_data = json.load(f)
                    return cache_data.get('posts', [])
            return []
        
        # Get sheet data
        sheet_data = fetch_sheet_data(service, SHEET_ID, SHEET_NAME)
        print(f"Raw sheet data: {sheet_data if sheet_data else 'No data'}")
        
        if not sheet_data:
            print("No sheet data found, checking cache")
            # Fall back to cache if it exists
            if os.path.exists(BLOG_CACHE_PATH):
                with open(BLOG_CACHE_PATH, 'r') as f:
                    cache_data = json.load(f)
                    return cache_data.get('posts', [])
            print("No cache found either, returning empty list")
            return []
        
        # Process sheet data into blog posts
        blog_posts = process_sheet_data(sheet_data)
        print(f"Processed blog posts: {blog_posts}")
        
        # Cache the data
        cache_data = {
            'last_updated': datetime.now().isoformat(),
            'posts': blog_posts
        }
        with open(BLOG_CACHE_PATH, 'w') as f:
            json.dump(cache_data, f)
        
        return blog_posts
    
    except Exception as e:
        print(f"Error getting blog posts: {e}")
        # Try to return cached data if available
        if os.path.exists(BLOG_CACHE_PATH):
            with open(BLOG_CACHE_PATH, 'r') as f:
                cache_data = json.load(f)
                return cache_data.get('posts', [])
        # If all else fails, return an empty list
        return []

async def setup_sheets_service():
    """Set up the Google Sheets API service asynchronously"""
    try:
        # First, try to use a service account if credentials exist
        credentials_path = os.path.join(os.path.dirname(__file__), "../credentials/google_credentials.json")
        
        print(f"Looking for credentials file at: {credentials_path}")
        
        if os.path.exists(credentials_path):
            print(f"Using service account credentials from: {credentials_path}")
            try:
                credentials = service_account.Credentials.from_service_account_file(
                    credentials_path, 
                    scopes=['https://www.googleapis.com/auth/spreadsheets']
                )
                service = build('sheets', 'v4', credentials=credentials)
                print("Successfully created Sheets service with service account")
                return service
            except Exception as cred_error:
                print(f"Error loading service account credentials: {cred_error}")
        else:
            print(f"Service account credentials file not found at: {credentials_path}")
            
            # If no service account, try to use API key
            api_key = os.getenv('GOOGLE_API_KEY')
            if api_key:
                print("Using API key from environment variables")
                try:
                    service = build('sheets', 'v4', developerKey=api_key)
                    print("Successfully created Sheets service with API key")
                    return service
                except Exception as api_error:
                    print(f"Error creating service with API key: {api_error}")
            else:
                print("No Google credentials or API key found")
                return None
    except Exception as e:
        print(f"Error setting up Google Sheets service: {e}")
        import traceback
        traceback.print_exc()
        return None

def fetch_sheet_data(service, sheet_id, sheet_name):
    """Fetch data from the Google Sheet"""
    try:
        print(f"Attempting to fetch data from sheet: {sheet_name} in spreadsheet: {sheet_id}")
        # Get the sheet range
        sheet_range = f"{sheet_name}!A:Z"  # Adjust range as needed
        
        # Make the API call
        result = service.spreadsheets().values().get(
            spreadsheetId=sheet_id,
            range=sheet_range
        ).execute()
        
        values = result.get('values', [])
        print(f"Fetched {len(values)} rows from {sheet_name} (including header row)")
        
        if len(values) <= 1:
            print(f"Warning: Sheet {sheet_name} has only header row or is empty")
        
        return values
    except Exception as e:
        print(f"Error fetching sheet data from {sheet_name}: {e}")
        import traceback
        traceback.print_exc()
        return None

def process_sheet_data(sheet_data):
    """Process the sheet data into structured blog posts"""
    try:
        # Check if sheet data is empty or has less than 2 rows (header + at least one post)
        if not sheet_data or len(sheet_data) < 2:
            print(f"Sheet is empty or contains only headers (rows: {len(sheet_data) if sheet_data else 0}), returning fallback data")
            # Return fallback data
            return [
                {
                    "title": "Building a Modern Portfolio Website with Next.js",
                    "summary": "Learn how to create a dynamic portfolio website using Next.js, React, and Tailwind CSS. This tutorial covers responsive design, dark mode, and data fetching.",
                    "publication_date": "2023-10-15",
                    "thumbnail_url": "https://i.imgur.com/9QHjOtc.jpg",
                    "url": "https://medium.com/@bishalbudhathoki/building-a-modern-portfolio",
                    "author": "Bishal Budhathoki",
                    "reading_time": "8 min read"
                },
                {
                    "title": "How to Use Google Sheets as a Simple CMS",
                    "summary": "Explore how to integrate Google Sheets as a content management system for your website. A budget-friendly solution for small to medium websites.",
                    "publication_date": "2023-09-22",
                    "thumbnail_url": "https://i.imgur.com/N7RswTK.jpg",
                    "url": "https://medium.com/@bishalbudhathoki/google-sheets-as-cms",
                    "author": "Bishal Budhathoki",
                    "reading_time": "6 min read"
                },
                {
                    "title": "Automation with Python: Scraping LinkedIn Profiles",
                    "summary": "Learn how to automate web scraping to collect data from LinkedIn profiles using Python, Selenium, and BeautifulSoup.",
                    "publication_date": "2023-08-30",
                    "thumbnail_url": "https://i.imgur.com/0CbM4aC.jpg",
                    "url": "https://medium.com/@bishalbudhathoki/linkedin-scraping-with-python",
                    "author": "Bishal Budhathoki",
                    "reading_time": "10 min read"
                }
            ]
        
        # The first row should be headers
        headers = sheet_data[0]
        print(f"Found headers: {headers}")
        
        # Define a mapping from expected header names to standard field names
        # This helps handle variations in header capitalization and formatting
        header_mapping = {
            'title': 'title',
            'Title': 'title',
            'summary': 'summary',
            'Summary': 'summary',
            'publication_date': 'publication_date',
            'Publication_Date': 'publication_date',
            'thumbnail_url': 'thumbnail_url',
            'Thumbnail_URL': 'thumbnail_url',
            'url': 'url',
            'URL': 'url',
            'author': 'author',
            'Author': 'author',
            'reading_time': 'reading_time',
            'Reading_Time': 'reading_time'
        }
        
        # Create a list of blog posts
        blog_posts = []
        
        for i, row in enumerate(sheet_data[1:]):  # Skip the header row
            print(f"Processing row {i+1}: {row}")
            # Ensure the row has enough entries to match headers
            padded_row = row + [''] * (len(headers) - len(row))
            
            # Create a dictionary for this blog post
            post = {}
            for i, header in enumerate(headers):
                # Use the mapping to get the standardized field name
                field_name = header_mapping.get(header, header.lower().replace(' ', '_'))
                post[field_name] = padded_row[i]
            
            print(f"Processed post data: {post}")
            
            # Ensure required fields have values
            if 'title' in post and post['title']:
                # Add defaults for missing fields
                if 'publication_date' not in post or not post['publication_date']:
                    post['publication_date'] = datetime.now().strftime('%Y-%m-%d')
                
                if 'summary' not in post or not post['summary']:
                    post['summary'] = "No summary available."
                
                if 'thumbnail_url' not in post or not post['thumbnail_url']:
                    post['thumbnail_url'] = ""
                
                if 'url' not in post or not post['url']:
                    post['url'] = ""
                
                blog_posts.append(post)
                print(f"Added post: {post['title']}")
            else:
                print(f"Skipping row due to missing title")
        
        # Sort by publication date (newest first)
        try:
            blog_posts.sort(
                key=lambda x: datetime.strptime(x.get('publication_date', '2000-01-01'), '%Y-%m-%d'),
                reverse=True
            )
        except Exception as sort_error:
            print(f"Error sorting blog posts: {sort_error}")
            # If date parsing fails, don't sort
            pass
        
        print(f"Returning {len(blog_posts)} processed blog posts")
        return blog_posts
    except Exception as e:
        print(f"Error processing sheet data: {e}")
        import traceback
        traceback.print_exc()
        return []

async def ensure_blog_sheet_exists():
    """Ensure that the blog_posts sheet exists in the spreadsheet with correct headers"""
    try:
        # Set up the Google Sheets service
        service = await setup_sheets_service()
        if not service:
            print("Failed to set up Google Sheets service")
            return False
            
        # Check if the sheet exists
        try:
            # Get spreadsheet info
            spreadsheet = service.spreadsheets().get(spreadsheetId=SHEET_ID).execute()
            sheets = spreadsheet.get('sheets', [])
            sheet_exists = any(sheet['properties']['title'] == SHEET_NAME for sheet in sheets)
            
            if not sheet_exists:
                # Create the blog_posts sheet
                requests = [{
                    'addSheet': {
                        'properties': {
                            'title': SHEET_NAME
                        }
                    }
                }]
                
                service.spreadsheets().batchUpdate(
                    spreadsheetId=SHEET_ID,
                    body={'requests': requests}
                ).execute()
                
                # Add headers
                headers = ["Title", "Summary", "Publication_Date", "Thumbnail_URL", "URL", "Author", "Reading_Time"]
                service.spreadsheets().values().update(
                    spreadsheetId=SHEET_ID,
                    range=f"{SHEET_NAME}!A1:G1",
                    valueInputOption="RAW",
                    body={
                        "values": [headers]
                    }
                ).execute()
                
                # Add sample data if sheet is empty
                sample_data = [
                    [
                        "Building a Modern Portfolio Website with Next.js",
                        "Learn how to create a dynamic portfolio website using Next.js, React, and Tailwind CSS. This tutorial covers responsive design, dark mode, and data fetching.",
                        "2023-10-15",
                        "https://i.imgur.com/9QHjOtc.jpg",
                        "https://medium.com/@bishalbudhathoki/building-a-modern-portfolio",
                        "Bishal Budhathoki",
                        "8 min read"
                    ],
                    [
                        "How to Use Google Sheets as a Simple CMS",
                        "Explore how to integrate Google Sheets as a content management system for your website. A budget-friendly solution for small to medium websites.",
                        "2023-09-22",
                        "https://i.imgur.com/N7RswTK.jpg",
                        "https://medium.com/@bishalbudhathoki/google-sheets-as-cms",
                        "Bishal Budhathoki",
                        "6 min read"
                    ]
                ]
                
                service.spreadsheets().values().update(
                    spreadsheetId=SHEET_ID,
                    range=f"{SHEET_NAME}!A2:G3",
                    valueInputOption="RAW",
                    body={
                        "values": sample_data
                    }
                ).execute()
                
                print(f"Created new sheet '{SHEET_NAME}' for blog posts with sample data")
                return True
            
            # Check if the headers exist
            result = service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range=f"{SHEET_NAME}!A1:G1"
            ).execute()
            
            values = result.get('values', [])
            if not values:
                # Add headers
                headers = ["Title", "Summary", "Publication_Date", "Thumbnail_URL", "URL", "Author", "Reading_Time"]
                service.spreadsheets().values().update(
                    spreadsheetId=SHEET_ID,
                    range=f"{SHEET_NAME}!A1:G1",
                    valueInputOption="RAW",
                    body={
                        "values": [headers]
                    }
                ).execute()
                print(f"Added headers to existing sheet '{SHEET_NAME}'")
            
            return True
            
        except Exception as e:
            print(f"Error checking/creating blog sheet: {e}")
            return False
            
    except Exception as e:
        print(f"Failed to ensure blog sheet exists: {e}")
        return False

async def get_detailed_blog_posts_from_sheet() -> List[Dict[str, Any]]:
    """
    Fetch detailed blog posts from the manual_blog_posts Google Sheet
    
    This function handles the richer blog post format with multiple content sections and images
    """
    try:
        # Set up the Google Sheets service
        service = await setup_sheets_service()
        if not service:
            print("Failed to set up Google Sheets service for detailed blog posts")
            return []
            
        # First ensure the manual_blog_posts sheet exists
        sheet_exists = await ensure_manual_blog_sheet_exists()
        if not sheet_exists:
            print("Could not find or create manual_blog_posts sheet")
            return []
            
        # Fetch data from the sheet
        detailed_sheet_data = fetch_sheet_data(service, SHEET_ID, "manual_blog_posts")
        if not detailed_sheet_data or len(detailed_sheet_data) < 2:  # Need at least headers + one post
            print("Manual blog posts sheet is empty or contains only headers")
            return []
            
        # Process the detailed blog data
        return process_detailed_blog_data(detailed_sheet_data)
        
    except Exception as e:
        print(f"Error getting detailed blog posts: {e}")
        return []

def process_detailed_blog_data(sheet_data):
    """Process the detailed blog post data with content sections and images"""
    try:
        # First row contains headers
        headers = sheet_data[0]
        
        # Create a list to store the blog posts
        blog_posts = []
        
        for row in sheet_data[1:]:  # Skip the header row
            # Ensure the row has enough entries to match headers
            padded_row = row + [''] * (len(headers) - len(row))
            
            # Create the basic blog post structure
            post = {}
            
            # Process each column based on its header
            for i, header in enumerate(headers):
                header_key = header.lower().replace(' ', '_')
                post[header_key] = padded_row[i]
            
            # Skip entries without a title
            if not post.get('title'):
                continue
                
            # Process content sections and images into structured data
            content_sections = []
            for i in range(1, 6):  # We support up to 5 content/image pairs
                content_key = f'content_{i}'
                image_key = f'image_{i}'
                
                # If both content and image are empty, we've reached the end of content
                if not post.get(content_key) and not post.get(image_key):
                    break
                    
                # Add the section if either content or image exists
                section = {
                    'type': 'section',
                    'content': post.get(content_key, ''),
                    'image': post.get(image_key, '')
                }
                content_sections.append(section)
                
                # Remove these keys from the main post object to avoid duplication
                post.pop(content_key, None)
                post.pop(image_key, None)
            
            # Add the processed content sections to the post
            post['content_sections'] = content_sections
            
            # Ensure other required fields have values (defaults)
            if not post.get('publication_date'):
                post['publication_date'] = datetime.now().strftime('%Y-%m-%d')
            
            if not post.get('summary'):
                # Use the first content section as a summary if available
                if content_sections and content_sections[0]['content']:
                    summary = content_sections[0]['content']
                    # Limit summary to around 100 characters
                    if len(summary) > 100:
                        summary = summary[:100] + '...'
                    post['summary'] = summary
                else:
                    post['summary'] = "No summary available."
            
            blog_posts.append(post)
        
        # Sort by publication date (newest first)
        try:
            blog_posts.sort(
                key=lambda x: datetime.strptime(x.get('publication_date', '2000-01-01'), '%Y-%m-%d'),
                reverse=True
            )
        except Exception as e:
            print(f"Error sorting blog posts by date: {e}")
            
        return blog_posts
        
    except Exception as e:
        print(f"Error processing detailed blog data: {e}")
        return [] 

async def ensure_manual_blog_sheet_exists():
    """Ensure that the manual_blog_posts sheet exists with the correct structure"""
    try:
        # Set up the Google Sheets service
        service = await setup_sheets_service()
        if not service:
            print("Failed to set up Google Sheets service")
            return False
            
        # Check if the sheet exists
        try:
            # Get spreadsheet info
            spreadsheet = service.spreadsheets().get(spreadsheetId=SHEET_ID).execute()
            sheets = spreadsheet.get('sheets', [])
            sheet_exists = any(sheet['properties']['title'] == "manual_blog_posts" for sheet in sheets)
            
            if not sheet_exists:
                # Create the manual_blog_posts sheet
                requests = [{
                    'addSheet': {
                        'properties': {
                            'title': "manual_blog_posts"
                        }
                    }
                }]
                
                service.spreadsheets().batchUpdate(
                    spreadsheetId=SHEET_ID,
                    body={'requests': requests}
                ).execute()
                
                # Add headers for the detailed blog post format
                headers = [
                    "Title", "Summary", "Publication_Date", "Thumbnail_URL", 
                    "Content_1", "Image_1", 
                    "Content_2", "Image_2", 
                    "Content_3", "Image_3", 
                    "Content_4", "Image_4", 
                    "Content_5", "Image_5", 
                    "Author", "Reading_Time", "URL"
                ]
                
                service.spreadsheets().values().update(
                    spreadsheetId=SHEET_ID,
                    range="manual_blog_posts!A1:Q1",
                    valueInputOption="RAW",
                    body={
                        "values": [headers]
                    }
                ).execute()
                
                # Add a sample blog post with multiple content sections
                sample_post = [
                    "Building a Dynamic Blog with Google Sheets",
                    "Learn how to create a modern blog system using Google Sheets as a CMS with rich content including text and images.",
                    "2023-11-10",
                    "https://i.imgur.com/abcdef.jpg",
                    "In this tutorial, we'll walk through creating a dynamic blog that pulls content from Google Sheets. This approach offers several advantages for portfolio websites and small blogs.",
                    "https://i.imgur.com/section1.jpg",
                    "## Setting Up Your Google Sheet\n\nFirst, we need to create a Google Sheet with the right structure to hold our blog posts. Each row will represent a single blog post with multiple content sections.",
                    "https://i.imgur.com/section2.jpg",
                    "## Connecting to the API\n\nNext, we'll use the Google Sheets API to fetch our blog data. This requires setting up authentication with a service account.",
                    "https://i.imgur.com/section3.jpg",
                    "## Displaying Rich Content\n\nWith our data structure in place, we can now render beautiful blog posts with alternating text and images.",
                    "https://i.imgur.com/section4.jpg",
                    "## Conclusion\n\nThis approach gives you a flexible, easy-to-update blog system without the complexity of a traditional CMS.",
                    "",
                    "Bishal Budhathoki",
                    "10 min read",
                    "https://medium.com/@bishalbudhathoki/google-sheets-blog"
                ]
                
                service.spreadsheets().values().update(
                    spreadsheetId=SHEET_ID,
                    range="manual_blog_posts!A2:Q2",
                    valueInputOption="RAW",
                    body={
                        "values": [sample_post]
                    }
                ).execute()
                
                print("Created new sheet 'manual_blog_posts' with sample data")
                return True
            
            # Check if the headers exist
            result = service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range="manual_blog_posts!A1:Q1"
            ).execute()
            
            values = result.get('values', [])
            if not values:
                # Add headers
                headers = [
                    "Title", "Summary", "Publication_Date", "Thumbnail_URL", 
                    "Content_1", "Image_1", 
                    "Content_2", "Image_2", 
                    "Content_3", "Image_3", 
                    "Content_4", "Image_4", 
                    "Content_5", "Image_5", 
                    "Author", "Reading_Time", "URL"
                ]
                
                service.spreadsheets().values().update(
                    spreadsheetId=SHEET_ID,
                    range="manual_blog_posts!A1:Q1",
                    valueInputOption="RAW",
                    body={
                        "values": [headers]
                    }
                ).execute()
                print("Added headers to existing 'manual_blog_posts' sheet")
            
            return True
            
        except Exception as e:
            print(f"Error checking/creating manual blog sheet: {e}")
            return False
            
    except Exception as e:
        print(f"Failed to ensure manual blog sheet exists: {e}")
        return False 