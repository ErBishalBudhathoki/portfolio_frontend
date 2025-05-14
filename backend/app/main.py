from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import json
from datetime import datetime
from .linkedin_scraper import scrape_linkedin_profile
from .google_sheet import get_blog_posts_from_sheet, ensure_blog_sheet_exists, get_detailed_blog_posts_from_sheet, ensure_manual_blog_sheet_exists, setup_sheets_service, SHEET_ID, SHEET_NAME
from .contact_form import ContactFormSubmission, save_contact_submission, ensure_contact_sheet_exists
from .linkedin_sheet import save_linkedin_data_to_sheet, get_linkedin_data_from_sheet, ensure_linkedin_sheet_exists, get_cv_url_from_sheet
from .notification_helper import NotificationHelper
from .database import engine, Base
from .routes import analytics_routes
from .routes import firebase_routes
from .firebase_config import firebase
import asyncio
import subprocess

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Portfolio API"
)

# Configure CORS with specific origins
allowed_origins = [
    "https://www.bishalbudhathoki.com",
    "https://bishalbudhathoki.com",
    "http://localhost:3000"  # For local development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to store scraped LinkedIn data
LINKEDIN_DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/linkedin_data.json")
os.makedirs(os.path.dirname(LINKEDIN_DATA_PATH), exist_ok=True)

# Initialize NotificationHelper as a global variable
notifier = NotificationHelper()

# Include analytics routes
app.include_router(analytics_routes.router, prefix="/api/analytics", tags=["Analytics"])

# Include Firebase routes
app.include_router(firebase_routes.router, prefix="/api/firebase", tags=["Firebase"])

# Create an async function to handle the scrape command
async def handle_scrape_command():
    """Handle the /scrape command from Telegram"""
    try:
        print("\n=== Starting LinkedIn Profile Scrape from Telegram Command ===")
        notifier.send_notification("Starting LinkedIn profile scrape...", "INFO")
        
        # Reuse the trigger_linkedin_scrape endpoint instead of running a separate scrape
        result = await trigger_linkedin_scrape(skip_fallback=False, save_to_sheet=True)
        
        # Send completion notification
        success_msg = (
            f"✅ Scraping completed successfully!\n"
            f"Profile: {result['data'].get('basic_info', {}).get('name', 'Unknown')}\n"
            f"Projects: {result['data_status']['project_count']}\n"
            f"Experience: {result['data_status']['experience_count']}\n"
            f"Skills: {result['data_status']['skills_count']}"
        )
        notifier.send_notification(success_msg, "SUCCESS")
        return "Scraping completed successfully"
    except Exception as e:
        error_msg = f"Error during scraping: {str(e)}"
        notifier.send_notification(error_msg, "ERROR")
        return error_msg

# Register the command handler
notifier.register_command("scrape", handle_scrape_command)

@app.get("/")
async def root():
    return {"message": "Portfolio API is running"}

@app.get("/api/profile")
async def get_profile():
    """Get LinkedIn profile data from Google Sheets or trigger a new scrape"""
    try:
        # Define a flag to track data source for logging
        data_source = "unknown"
        
        # First, try to get data from Google Sheets (preferred source)
        sheet_data = await get_linkedin_data_from_sheet()
        
        # Get CV URL directly
        cv_url = await get_cv_url_from_sheet()
        if cv_url:
            if not sheet_data:
                sheet_data = {}
            sheet_data["cv_url"] = cv_url
            print(f"Added CV URL to profile data: {cv_url}")
        
        if sheet_data:
            # Check if there's actual content in the sheet data
            has_content = (
                len(sheet_data.get("experience", [])) > 0 or
                len(sheet_data.get("projects", [])) > 0 or
                len(sheet_data.get("skills", [])) > 0
            )
            
            if has_content:
                data_source = "google_sheets"
                print(f"Profile data loaded from Google Sheets with {len(sheet_data.get('projects', []))} projects")
                print(f"Experience data: {sheet_data.get('experience', [])[:1]}")
                print(f"Skills data: {len(sheet_data.get('skills', []))} skills")
                print(f"CV URL: {sheet_data.get('cv_url')}")
                return sheet_data
            else:
                print("Google Sheets data exists but has no content")
        
        # If no data in sheets, try to get from cache
        if os.path.exists(LINKEDIN_DATA_PATH):
            with open(LINKEDIN_DATA_PATH, 'r') as f:
                cache_data = json.load(f)
                # Check if data was scraped recently (within a week)
                last_updated = datetime.fromisoformat(cache_data.get('last_updated', '2000-01-01'))
                if (datetime.now() - last_updated).days < 7:
                    # Check if cache has actual content
                    has_content = (
                        len(cache_data.get("experience", [])) > 0 or
                        len(cache_data.get("projects", [])) > 0 or
                        len(cache_data.get("skills", [])) > 0
                    )
                    
                    if has_content:
                        data_source = "local_cache"
                        print(f"Profile data loaded from local cache with {len(cache_data.get('projects', []))} projects")
                        return cache_data
                    else:
                        print("Local cache exists but has no content")
        
        # If no recent data with content, trigger a new scrape
        profile_data = await scrape_linkedin_profile()
        
        # Check if scraped data has content
        has_content = (
            len(profile_data.get("experience", [])) > 0 or
            len(profile_data.get("projects", [])) > 0 or
            len(profile_data.get("skills", [])) > 0
        )
        
        if not has_content:
            print("Warning: LinkedIn scraping returned data with no content")
        
        # Add timestamp and save to file
        profile_data['last_updated'] = datetime.now().isoformat()
        with open(LINKEDIN_DATA_PATH, 'w') as f:
            json.dump(profile_data, f)
        
        # Save to Google Sheets
        sheet_result = await save_linkedin_data_to_sheet(profile_data)
        if sheet_result.get("success", False):
            print(f"Successfully saved scraped data to Google Sheets")
        else:
            print(f"Failed to save to Google Sheets: {sheet_result.get('message', 'Unknown error')}")
        
        data_source = "linkedin_scrape"
        print(f"Profile data scraped from LinkedIn with {len(profile_data.get('projects', []))} projects")
        return profile_data
    except Exception as e:
        print(f"Failed to get profile data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get profile data: {str(e)}")

@app.get("/api/blog")
async def get_blog_posts():
    """Get blog posts from the Google Sheet"""
    try:
        blog_posts = await get_blog_posts_from_sheet()
        return {"posts": blog_posts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get blog posts: {str(e)}")

@app.get("/api/blog/reload")
async def reload_blog_posts():
    """Force reload blog posts from Google Sheet by clearing the cache"""
    try:
        # Clear the cache file if it exists
        from .google_sheet import BLOG_CACHE_PATH
        import os
        
        if os.path.exists(BLOG_CACHE_PATH):
            os.remove(BLOG_CACHE_PATH)
            print(f"Removed blog cache file: {BLOG_CACHE_PATH}")
        
        # Now fetch fresh data
        blog_posts = await get_blog_posts_from_sheet()
        
        return {
            "success": True,
            "message": "Blog cache cleared and posts reloaded",
            "post_count": len(blog_posts),
            "posts": blog_posts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reload blog posts: {str(e)}")

@app.get("/api/blog/detailed")
async def get_detailed_blog_posts():
    """Get detailed blog posts with multiple content sections from the manual_blog_posts sheet"""
    try:
        detailed_posts = await get_detailed_blog_posts_from_sheet()
        return {"posts": detailed_posts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get detailed blog posts: {str(e)}")

@app.get("/api/blog/post/{post_index}")
async def get_single_blog_post(post_index: int):
    """Get a single detailed blog post by its index (0-based)"""
    try:
        all_posts = await get_detailed_blog_posts_from_sheet()
        
        if not all_posts or post_index < 0 or post_index >= len(all_posts):
            raise HTTPException(status_code=404, detail=f"Blog post with index {post_index} not found")
            
        return {"post": all_posts[post_index]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get blog post: {str(e)}")

@app.get("/api/setup-blog-sheet")
async def setup_blog_sheet():
    """Setup the blog sheet for testing"""
    try:
        result = await ensure_blog_sheet_exists()
        
        # Get the current posts
        blog_posts = await get_blog_posts_from_sheet()
        
        # If we have posts already, return them
        if blog_posts and len(blog_posts) > 0:
            return {
                "success": True,
                "message": "Blog sheet already has posts",
                "posts": blog_posts
            }
        
        # If no posts, let's add the sample fallback posts from the process_sheet_data function
        # This is a temporary solution to ensure we have some blog posts
        if result:
            # Add sample data
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
                ],
                [
                    "Automation with Python: Scraping LinkedIn Profiles",
                    "Learn how to automate web scraping to collect data from LinkedIn profiles using Python, Selenium, and BeautifulSoup.",
                    "2023-08-30",
                    "https://i.imgur.com/0CbM4aC.jpg",
                    "https://medium.com/@bishalbudhathoki/linkedin-scraping-with-python",
                    "Bishal Budhathoki",
                    "10 min read"
                ]
            ]
            
            try:
                service = setup_sheets_service()
                if service:
                    service.spreadsheets().values().update(
                        spreadsheetId=SHEET_ID,
                        range=f"{SHEET_NAME}!A2:G4",
                        valueInputOption="RAW",
                        body={
                            "values": sample_data
                        }
                    ).execute()
                    
                    print("Added sample blog posts to sheet")
                    
                    # Get the updated posts
                    blog_posts = await get_blog_posts_from_sheet()
                    
                    return {
                        "success": True,
                        "message": "Sample blog posts have been added to the sheet",
                        "posts": blog_posts
                    }
            except Exception as e:
                return {
                    "success": False,
                    "message": f"Failed to add sample posts: {str(e)}"
                }
        
        return {
            "success": result,
            "message": "Blog sheet has been set up but could not add sample posts",
            "posts": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to set up blog sheet: {str(e)}")

@app.post("/api/trigger-linkedin-scrape")
async def trigger_linkedin_scrape(skip_fallback: bool = False, save_to_sheet: bool = True):
    """
    Manually trigger a LinkedIn profile scrape and save to Google Sheets
    
    Parameters:
    - skip_fallback: If True, won't use fallback data if scraping fails
    - save_to_sheet: If False, won't save data to Google Sheets
    """
    try:
        print("\n=== Starting LinkedIn Profile Scrape API ===")
        
        # Scrape profile
        print("Starting profile scrape...")
        profile_data = await scrape_linkedin_profile()
        
        # Check if data has actual content
        has_content = (
            len(profile_data.get("experience", [])) > 0 or
            len(profile_data.get("projects", [])) > 0 or
            len(profile_data.get("skills", [])) > 0
        )
        
        # Check if we're using fallback data
        is_fallback = not has_content or "using fallback" in profile_data.get("_scrape_info", "").lower()
        
        if is_fallback and skip_fallback:
            error_msg = "LinkedIn scraping failed and fallback data was skipped as requested"
            print(f"Error: {error_msg}")
            print("Sending error notification...")
            notifier.notify_scrape_error(error_msg)
            raise HTTPException(status_code=404, detail=error_msg)
        
        if not has_content:
            print("Warning: LinkedIn scraping returned data with no content")
            if save_to_sheet:
                print("Skipping save to Google Sheets due to missing content")
                save_to_sheet = False
        
        # Add timestamp and info about data source
        profile_data['last_updated'] = datetime.now().isoformat()
        profile_data['_scrape_info'] = "Using fallback data" if is_fallback else "Scraped from LinkedIn"
        
        # Log detailed information about the scraped data
        print("\n======= SCRAPED LINKEDIN DATA =======")
        print(f"Data source: {'FALLBACK DATA' if is_fallback else 'ACTUAL SCRAPED DATA'}")
        print(f"Name: {profile_data.get('basic_info', {}).get('name', 'Not found')}")
        print(f"Headline: {profile_data.get('basic_info', {}).get('headline', 'Not found')}")
        print(f"Location: {profile_data.get('basic_info', {}).get('location', 'Not found')}")
        print(f"Profile Image: {'Found' if profile_data.get('basic_info', {}).get('profile_image') else 'Not found'}")
        print(f"About: {profile_data.get('about', 'Not found')[:100]}..." if len(profile_data.get('about', '')) > 100 else profile_data.get('about', 'Not found'))
        
        # Print experience summary
        experiences = profile_data.get("experience", [])
        print(f"\nExperience ({len(experiences)} entries):")
        for i, exp in enumerate(experiences[:3], 1):
            print(f"  {i}. {exp.get('role', 'No role')} at {exp.get('company', 'No company')} ({exp.get('date_range', 'No date')})")
        if len(experiences) > 3:
            print(f"  ... and {len(experiences) - 3} more")
            
        # Print education summary
        education = profile_data.get("education", [])
        print(f"\nEducation ({len(education)} entries):")
        for i, edu in enumerate(education[:2], 1):
            print(f"  {i}. {edu.get('degree', 'No degree')} at {edu.get('school', 'No school')} ({edu.get('date_range', 'No date')})")
        if len(education) > 2:
            print(f"  ... and {len(education) - 2} more")
            
        # Print skills summary
        skills = profile_data.get("skills", [])
        print(f"\nSkills ({len(skills)} entries):")
        skill_names = [skill.get('name', 'No name') if isinstance(skill, dict) else skill for skill in skills[:10]]
        print(f"  {', '.join(skill_names)}")
        if len(skills) > 10:
            print(f"  ... and {len(skills) - 10} more")
            
        # Print projects summary
        projects = profile_data.get("projects", [])
        print(f"\nProjects ({len(projects)} entries):")
        for i, proj in enumerate(projects[:3], 1):
            print(f"  {i}. {proj.get('name', 'No name')} ({proj.get('date_range', 'No date')})")
        if len(projects) > 3:
            print(f"  ... and {len(projects) - 3} more")
            
        # Print certifications summary
        certifications = profile_data.get("certifications", [])
        print(f"\nCertifications ({len(certifications)} entries):")
        for i, cert in enumerate(certifications[:2], 1):
            print(f"  {i}. {cert.get('name', 'No name')} by {cert.get('organization', 'No organization')}")
        if len(certifications) > 2:
            print(f"  ... and {len(certifications) - 2} more")
        
        print("======= END OF SCRAPED DATA =======\n")
        
        # Save to local file cache only if we have real data
        if not is_fallback:
            with open(LINKEDIN_DATA_PATH, 'w') as f:
                json.dump(profile_data, f)
            print("Profile data saved to local cache")
        else:
            print("Skipping local cache save - using fallback data")
        
        # Save to Google Sheets if requested and we have real data
        sheet_result = {"success": False, "message": "Skipped saving to sheets as requested"}
        if save_to_sheet and not is_fallback:
            try:
                print("Saving data to Google Sheets...")
                sheet_result = await save_linkedin_data_to_sheet(profile_data)
                print(f"Google Sheets save result: {sheet_result}")
            except Exception as e:
                sheet_result = {"success": False, "message": f"Error saving LinkedIn data to sheet: {str(e)}"}
                print(sheet_result["message"])
        else:
            print("Skipping save to Google Sheets - using fallback data or save not requested")
        
        # Get current data from Google Sheets to verify save
        sheet_data = await get_linkedin_data_from_sheet()
        sheet_data_status = "Sheet data available" if sheet_data else "No sheet data found"
        
        # Send success notification
        print("\nSending success notification...")
        notifier.notify_scrape_success(
            profile_data.get("basic_info", {}).get("name", "Unknown"),
            is_fallback
        )
        print("✅ Success notification sent")
        
        return {
            "message": "LinkedIn profile scraped successfully", 
            "data": profile_data,
            "sheet_result": sheet_result,
            "is_fallback_data": is_fallback,
            "data_saved_to_sheet": save_to_sheet and sheet_result.get("success", False),
            "data_status": {
                "has_content": has_content,
                "project_count": len(profile_data.get("projects", [])),
                "experience_count": len(profile_data.get("experience", [])),
                "skills_count": len(profile_data.get("skills", [])),
                "sheet_data": sheet_data_status
            }
        }
    except Exception as e:
        error_msg = f"Error in trigger_linkedin_scrape: {e}"
        print(f"\nError: {error_msg}")
        print("Sending error notification...")
        notifier.notify_scrape_error(error_msg)
        print("✅ Error notification sent")
        raise HTTPException(status_code=500, detail=f"Failed to scrape LinkedIn profile: {str(e)}")

@app.get("/api/trigger-linkedin-scrape")
async def handle_get_linkedin_scrape():
    """Handle GET requests to the LinkedIn scrape endpoint by returning a helpful error message"""
    return {
        "error": "Method Not Allowed",
        "message": "This endpoint requires a POST request. GET is not supported.",
        "correct_usage": "Make a POST request to /api/trigger-linkedin-scrape to trigger LinkedIn profile scraping."
    }

@app.post("/api/contact")
async def submit_contact_form(submission: ContactFormSubmission):
    """Handle contact form submissions"""
    try:
        # Ensure the contact sheet exists
        sheet_exists = await ensure_contact_sheet_exists()
        if not sheet_exists:
            raise HTTPException(
                status_code=500, 
                detail="Could not set up contact form storage"
            )
        
        # Save the submission
        result = await save_contact_submission(submission)
        
        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=result["message"]
            )
        
        return {"message": "Contact form submitted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to submit contact form: {str(e)}"
        )

# Add startup event to ensure sheets exist on app startup
@app.on_event("startup")
async def startup_event():
    """Run initialization tasks when the app starts"""
    try:
        print("=========================================")
        print("Starting up Portfolio Backend API...")
        print("=========================================")
        
        # --- FIREBASE CONNECTION CHECK ---
        def check_firebase_connection():
            try:
                from firebase_admin import credentials, firestore, initialize_app, _apps
                import os
                creds_path = os.getenv("FIREBASE_SERVICE_ACCOUNT", "credentials/firebase-credentials.json")
                if not os.path.exists(creds_path):
                    print(f"❌ Firebase credentials not found at {creds_path}")
                    return False
                if not _apps:
                    cred = credentials.Certificate(creds_path)
                    initialize_app(cred)
                db = firestore.client()
                # Try to access a collection
                db.collection('test').limit(1).get()
                print("✅ Firebase connection successful!")
                return True
            except Exception as e:
                print(f"❌ Firebase connection failed: {e}")
                return False

        print("Checking Firebase connection...")
        if not check_firebase_connection():
            print("Attempting to set up Firebase database...")
            result = subprocess.run(["python", "backend/setup_firebase.py"], capture_output=True, text=True)
            print(result.stdout)
            if result.returncode != 0:
                print(f"❌ Firebase setup failed: {result.stderr}")
            else:
                print("Re-checking Firebase connection after setup...")
                if not check_firebase_connection():
                    print("❌ Firebase connection still failed after setup. Please check your credentials and Firestore setup.")
                else:
                    print("✅ Firebase connection established after setup.")
        else:
            print("Firebase connection is healthy.")

        # Make data directory if it doesn't exist
        os.makedirs(os.path.dirname(LINKEDIN_DATA_PATH), exist_ok=True)
        print(f"Data directory ensured at: {os.path.dirname(LINKEDIN_DATA_PATH)}")
        
        # Setup Google Sheets access
        print("Initializing Google Sheets access...")
        try:
            service = await setup_sheets_service()
            if service:
                print("✅ Google Sheets service initialized successfully")
            else:
                print("⚠️ Google Sheets service initialization returned None")
        except Exception as sheets_error:
            print(f"⚠️ Error initializing Google Sheets: {str(sheets_error)}")
        
        # Ensure required sheets exist
        print("Checking required Google Sheets...")
        try:
            # Create blog sheets if they don't exist
            blog_sheet_exists = await ensure_blog_sheet_exists()
            blog_sheet_result = {
                "success": blog_sheet_exists,
                "message": "Blog sheet exists" if blog_sheet_exists else "Failed to create blog sheet"
            }
            if blog_sheet_result["success"]:
                print(f"✅ Blog sheet ready: {blog_sheet_result['message']}")
            else:
                print(f"⚠️ Blog sheet issue: {blog_sheet_result['message']}")
                
            manual_blog_exists = await ensure_manual_blog_sheet_exists()
            manual_blog_result = {
                "success": manual_blog_exists,
                "message": "Manual blog sheet exists" if manual_blog_exists else "Failed to create manual blog sheet"
            }
            if manual_blog_result["success"]:
                print(f"✅ Manual blog sheet ready: {manual_blog_result['message']}")
            else:
                print(f"⚠️ Manual blog sheet issue: {manual_blog_result['message']}")
            
            # Create LinkedIn sheet if it doesn't exist
            try:
                linkedin_sheet_result = await ensure_linkedin_sheet_exists()
                if linkedin_sheet_result.get("success", False):
                    print(f"✅ LinkedIn sheet ready: {linkedin_sheet_result.get('message')}")
                else:
                    print(f"⚠️ LinkedIn sheet issue: {linkedin_sheet_result.get('message')}")
            except Exception as linkedin_error:
                print(f"⚠️ LinkedIn sheet error: {str(linkedin_error)}")
            
            # Create contact form sheet if it doesn't exist
            contact_sheet_result = await ensure_contact_sheet_exists()
            if contact_sheet_result.get("success", False):
                print(f"✅ Contact form sheet ready: {contact_sheet_result.get('message')}")
            else:
                print(f"⚠️ Contact form sheet issue: {contact_sheet_result.get('message')}")
                
        except Exception as sheet_error:
            print(f"⚠️ Error setting up required sheets: {str(sheet_error)}")
        
        # Start listening for Telegram messages
        print("Starting Telegram bot listener...")
        try:
            loop = asyncio.get_event_loop()
            loop.create_task(notifier.listen_for_messages())
            print("✅ Telegram bot listener started successfully")
        except Exception as telegram_error:
            print(f"⚠️ Error starting Telegram bot: {str(telegram_error)}")
            
        print("=========================================")
        print("Portfolio Backend API startup complete")
        print("=========================================")
    except Exception as e:
        print(f"❌ CRITICAL ERROR during startup: {str(e)}")

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    firebase_status = "available" if firebase["db"] else "unavailable"
    return {"status": "ok", "timestamp": datetime.now().isoformat(), "firebase": firebase_status}

@app.get("/diagnose-selenium", tags=["Diagnostics"])
async def diagnose_selenium():
    """Diagnostic endpoint to check Selenium and Chrome setup"""
    import sys
    import platform
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    import os
    
    results = {
        "system": {
            "platform": platform.platform(),
            "python_version": sys.version,
            "selenium_version": webdriver.__version__
        },
        "environment": {
            "path": os.environ.get("PATH", "Not available"),
            "current_directory": os.getcwd()
        },
        "tests": {}
    }
    
    # Test if Chrome is available
    try:
        chrome_output = os.popen("google-chrome --version").read().strip()
        results["tests"]["chrome_installed"] = True
        results["tests"]["chrome_version"] = chrome_output
    except Exception as e:
        results["tests"]["chrome_installed"] = False
        results["tests"]["chrome_error"] = str(e)
    
    # Test if ChromeDriver is available
    try:
        chromedriver_output = os.popen("chromedriver --version").read().strip()
        results["tests"]["chromedriver_installed"] = True
        results["tests"]["chromedriver_version"] = chromedriver_output
    except Exception as e:
        results["tests"]["chromedriver_installed"] = False
        results["tests"]["chromedriver_error"] = str(e)
    
    # Test if Selenium can create a Chrome driver
    try:
        options = Options()
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        
        driver = webdriver.Chrome(options=options)
        results["tests"]["selenium_driver_creation"] = "success"
        
        # Try to fetch a test page
        driver.get("https://www.google.com")
        results["tests"]["selenium_navigation"] = "success"
        results["tests"]["page_title"] = driver.title
        
        driver.quit()
    except Exception as e:
        results["tests"]["selenium_driver_creation"] = "failed"
        results["tests"]["selenium_error"] = str(e)
    
    # Try alternative method with webdriver_manager
    if results["tests"].get("selenium_driver_creation") == "failed":
        try:
            from webdriver_manager.chrome import ChromeDriverManager
            from selenium.webdriver.chrome.service import Service
            
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)
            results["tests"]["webdriver_manager_creation"] = "success"
            
            driver.get("https://www.google.com")
            results["tests"]["webdriver_manager_navigation"] = "success"
            
            driver.quit()
        except Exception as e:
            results["tests"]["webdriver_manager_creation"] = "failed"
            results["tests"]["webdriver_manager_error"] = str(e)
    
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 