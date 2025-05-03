from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import json
from datetime import datetime
import pandas as pd
from typing import List, Dict, Any, Optional
from .linkedin_scraper import scrape_linkedin_profile
from .google_sheet import get_blog_posts_from_sheet, ensure_blog_sheet_exists, get_detailed_blog_posts_from_sheet, ensure_manual_blog_sheet_exists, setup_sheets_service, SHEET_ID, SHEET_NAME
from .contact_form import ContactFormSubmission, save_contact_submission, ensure_contact_sheet_exists
from .linkedin_sheet import save_linkedin_data_to_sheet, get_linkedin_data_from_sheet, ensure_linkedin_sheet_exists, get_cv_url_from_sheet
from .notification_helper import NotificationHelper
import asyncio

# Load environment variables
load_dotenv()

app = FastAPI(title="Portfolio API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to store scraped LinkedIn data
LINKEDIN_DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/linkedin_data.json")
os.makedirs(os.path.dirname(LINKEDIN_DATA_PATH), exist_ok=True)

# Initialize NotificationHelper as a global variable
notifier = NotificationHelper()

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
    """Run on app startup to ensure required resources exist"""
    try:
        contact_sheet = await ensure_contact_sheet_exists()
        linkedin_sheet = await ensure_linkedin_sheet_exists()
        blog_sheet = await ensure_blog_sheet_exists()
        manual_blog_sheet = await ensure_manual_blog_sheet_exists()
        print(f"Startup check - Contact sheet exists: {contact_sheet}, LinkedIn sheets exist: {linkedin_sheet}, Blog sheet exists: {blog_sheet}, Manual blog sheet exists: {manual_blog_sheet}")
    except Exception as e:
        print(f"Warning: Failed to initialize sheets: {e}") 