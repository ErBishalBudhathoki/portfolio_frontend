import asyncio
import os
import threading
import json
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# The spreadsheet ID comes from the SHEET_ID environment variable (backend/.env).
from .config import SHEET_ID

SHEET_NAME = "blog_posts"

# Cache file path
BLOG_CACHE_PATH = os.path.join(os.path.dirname(__file__), "../data/blog_cache.json")
os.makedirs(os.path.dirname(BLOG_CACHE_PATH), exist_ok=True)


def slugify(title: str) -> str:
    """Canonical blog slug.

    Kept in sync with frontend/lib/slug.ts. Emitting the slug from the API means
    the list page and the detail page can no longer disagree about how a title
    maps to a URL (they previously differed on hyphens, which 404'd posts such
    as "The Homelab Saga: Taming Pi-hole ...").
    """
    import re
    import unicodedata

    if not title:
        return "post"

    text = unicodedata.normalize("NFKD", str(title))
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower()
    # keep letters, numbers, spaces and hyphens
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"\s+", "-", text.strip())
    text = re.sub(r"-{2,}", "-", text)
    return text.strip("-") or "post"

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
        # Row counts only. This used to print the whole payload, which dumped the
        # multi-KB Homelab summary four times for every single blog request.
        print(f"Raw sheet data: {len(sheet_data)} row(s)")
        
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
        print(f"Processed blog posts: {len(blog_posts)} post(s)")
        
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

# The Sheets API client is expensive to build: googleapiclient parses the full
# discovery document (its static cache is disabled on this version), which
# allocates tens of MB per call. Building it once per request leaked memory and
# got this container OOM-killed every minute or two, surfacing across the site as
# 503s and "Unable to load profile data". Build once, then reuse.
_sheets_service = None
_sheets_service_lock = asyncio.Lock()
# googleapiclient's Http transport is NOT thread-safe: sharing one cached
# client across concurrent reads makes calls interleave and time out. Every
# sheet read acquires this so worksheet reads serialize instead of colliding.
_sheets_io_lock = threading.Lock()


def _build_sheets_service():
    """Create the Sheets API client once. Returns None if no credentials are usable."""
    scopes = ['https://www.googleapis.com/auth/spreadsheets']
    credentials_secret = os.getenv('GOOGLE_SHEETS_CREDENTIALS')
    credentials_path = os.getenv('GOOGLE_CREDENTIALS_PATH')

    # Secret Manager on Cloud Run injects the secret value directly into the env var.
    # Support both raw JSON credentials and filesystem paths for local/dev setups.
    if credentials_secret:
        try:
            if credentials_secret.lstrip().startswith('{'):
                credentials_info = json.loads(credentials_secret)
                credentials = service_account.Credentials.from_service_account_info(
                    credentials_info,
                    scopes=scopes
                )
                return build('sheets', 'v4', credentials=credentials)
        except Exception as secret_error:
            print(f"Error loading Google Sheets credentials from env JSON: {secret_error}")

    candidate_paths = []
    if credentials_path:
        if os.path.isabs(credentials_path):
            candidate_paths.append(credentials_path)
        else:
            candidate_paths.append(os.path.normpath(os.path.join(os.path.dirname(__file__), "..", credentials_path)))

    if credentials_secret and not credentials_secret.lstrip().startswith('{'):
        if os.path.isabs(credentials_secret):
            candidate_paths.append(credentials_secret)
        else:
            candidate_paths.append(os.path.normpath(os.path.join(os.path.dirname(__file__), "..", credentials_secret)))

    candidate_paths.append(os.path.join(os.path.dirname(__file__), "../credentials/google_credentials.json"))

    for candidate_path in candidate_paths:
        if not candidate_path:
            continue
        if os.path.exists(candidate_path):
            try:
                credentials = service_account.Credentials.from_service_account_file(
                    candidate_path,
                    scopes=scopes
                )
                return build('sheets', 'v4', credentials=credentials)
            except Exception as cred_error:
                print(f"Error loading service account credentials file: {cred_error}")

    print("Service account credentials file not found in configured locations")

    # If no service account, try to use API key
    api_key = os.getenv('GOOGLE_API_KEY')
    if api_key:
        try:
            return build('sheets', 'v4', developerKey=api_key)
        except Exception as api_error:
            print(f"Error creating service with API key: {api_error}")
    else:
        print("No Google credentials or API key found")

    return None


async def setup_sheets_service():
    """Set up the Google Sheets API service asynchronously (cached, built at most once)."""
    global _sheets_service
    if _sheets_service is not None:
        return _sheets_service

    async with _sheets_service_lock:
        # A concurrent request may have built it while we waited on the lock.
        if _sheets_service is not None:
            return _sheets_service

        try:
            service = await asyncio.to_thread(_build_sheets_service)
        except Exception as e:
            print(f"Error setting up Google Sheets service: {e}")
            import traceback
            traceback.print_exc()
            return None

        if service is not None:
            # Only cache a working client. A failed build (credentials briefly
            # unavailable) must stay retryable instead of poisoning all later calls.
            _sheets_service = service
            print("Sheets API client cached for reuse across requests")
        return service


def fetch_sheet_data(service, sheet_id, sheet_name):
    """Fetch data from the Google Sheet"""
    try:
        print(f"Attempting to fetch data from sheet: {sheet_name} in spreadsheet: {sheet_id}")
        # Get the sheet range
        sheet_range = f"{sheet_name}!A:Z"  # Adjust range as needed
        
        # Make the API call (serialized for thread-safe transport access)
        with _sheets_io_lock:
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
            # Previously this returned three placeholder posts whose Medium URLs
            # did not exist, so the live blog index advertised dead articles.
            # An empty sheet now means "no posts published yet".
            print(f"Sheet is empty or contains only headers (rows: {len(sheet_data) if sheet_data else 0}), returning no posts")
            return []
        
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
            
            print(f"Processed post data: {post.get('title', '(untitled)')}")
            
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

                # Emit the canonical slug so the frontend never has to guess.
                post['slug'] = slugify(post['title'])

                blog_posts.append(post)
                print(f"Added post: {post['title']} (slug: {post['slug']})")
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

        # The sheet is edited by hand, so a renamed/typo'd header cell used to
        # silently skip every row and serve an empty blog. Make it loud.
        if not blog_posts and len(sheet_data) > 1:
            found = [h for h in sheet_data[0] if h]
            print(
                "[BLOG WARNING] blog_posts returned 0 posts even though the sheet has "
                f"{len(sheet_data) - 1} data row(s). Headers found: {found}. "
                "The first header must be 'Title'."
            )

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
                
                # NOTE: sample rows are intentionally NOT seeded here.
                # They used to insert placeholder posts pointing at
                # medium.com/@bishalbudhathoki/... URLs that do not exist, and
                # those fake posts were then published on the live blog index.
                # An empty sheet now stays empty until real posts are added.
                print(f"Created new sheet '{SHEET_NAME}' for blog posts (headers only)")
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

                content_value = post.get(content_key, '')
                image_value = post.get(image_key, '')

                # Skip an empty pair but keep scanning: a gap in the middle of a
                # post (e.g. no Content_5) must not discard the sections after it.
                if not content_value and not image_value:
                    post.pop(content_key, None)
                    post.pop(image_key, None)
                    continue

                content_sections.append({
                    'type': 'section',
                    'content': content_value,
                    'image': image_value,
                })

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

            # Emit the canonical slug so the frontend never has to guess.
            post['slug'] = slugify(post.get('title', ''))

            blog_posts.append(post)
        
        # Sort by publication date (newest first)
        try:
            blog_posts.sort(
                key=lambda x: datetime.strptime(x.get('publication_date', '2000-01-01'), '%Y-%m-%d'),
                reverse=True
            )
        except Exception as e:
            print(f"Error sorting blog posts by date: {e}")

        # The sheet is edited by hand, so a renamed/typo'd header cell (e.g. A1
        # becoming "man") used to silently skip every row and serve an empty blog.
        # Make that failure loud so it is visible in Cloud Run logs immediately.
        if not blog_posts and len(sheet_data) > 1:
            found = [h for h in sheet_data[0] if h]
            print(
                "[BLOG WARNING] manual_blog_posts returned 0 posts even though the "
                f"sheet has {len(sheet_data) - 1} data row(s). Headers found: {found}. "
                "The first header must be 'Title'."
            )

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
                
                # Headers only. A sample post used to be written here, which put
                # a placeholder article (with fake imgur image URLs) into the live
                # blog on every fresh sheet. Rows are now authored in the sheet.
                print("Created new sheet 'manual_blog_posts' with headers")
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
