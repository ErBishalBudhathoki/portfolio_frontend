import os
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from .google_sheet import setup_sheets_service

# Google Sheet ID (from the URL)
SHEET_ID = os.getenv("SHEET_ID", "1blqFnWjYgB1idiYqqEZR5qfueO0k6vPZv4eP8Yn3xTg")

# Define worksheet names for different data types
SHEET_BASIC_INFO = "BasicInfo"
SHEET_EXPERIENCE = "Experience"
SHEET_EDUCATION = "Education"
SHEET_SKILLS = "Skills"
SHEET_PROJECTS = "Projects"
SHEET_CERTIFICATIONS = "Certifications"

async def save_linkedin_data_to_sheet(profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Save LinkedIn profile data to Google Sheets with improved structure
    Creates separate worksheets for each data type
    """
    try:
        # Ensure the sheets exist
        sheet_exists = await ensure_linkedin_sheet_exists()
        if not sheet_exists["success"]:
            return {
                "success": False,
                "message": "Could not set up LinkedIn data sheets"
            }
        
        # Set up the Google Sheets service
        service = setup_sheets_service()
        if not service:
            return {
                "success": False,
                "message": "Could not connect to Google Sheets"
            }
        
        # Save basic info
        save_basic_info(service, profile_data.get("basic_info", {}), profile_data.get("about", ""))
        
        # Save experience data
        save_experience_data(service, profile_data.get("experience", []))
        
        # Save education data
        save_education_data(service, profile_data.get("education", []))
        
        # Save skills data
        save_skills_data(service, profile_data.get("skills", []))
        
        # Save projects data
        save_projects_data(service, profile_data.get("projects", []))
        
        # Save certifications data
        save_certifications_data(service, profile_data.get("certifications", []))
        
        return {
            "success": True,
            "message": "LinkedIn data saved to sheets"
        }
    
    except Exception as e:
        print(f"Error saving LinkedIn data to sheet: {e}")
        return {
            "success": False,
            "message": f"Error saving LinkedIn data: {str(e)}"
        }

def save_basic_info(service, basic_info: Dict[str, str], about: str):
    """Save basic profile information"""
    # Define headers
    headers = ["Field", "Value"]
    
    # Define data rows
    rows = [
        ["Name", basic_info.get("name", "")],
        ["Headline", basic_info.get("headline", "")],
        ["Location", basic_info.get("location", "")],
        ["Profile Image", basic_info.get("profile_image", "")],
        ["About", about]
    ]
    
    # Clear existing data
    service.spreadsheets().values().clear(
        spreadsheetId=SHEET_ID,
        range=f"{SHEET_BASIC_INFO}!A:B"
    ).execute()
    
    # Update headers
    service.spreadsheets().values().update(
        spreadsheetId=SHEET_ID,
        range=f"{SHEET_BASIC_INFO}!A1",
        valueInputOption="RAW",
        body={"values": [headers]}
    ).execute()
    
    # Update data
    service.spreadsheets().values().update(
        spreadsheetId=SHEET_ID,
        range=f"{SHEET_BASIC_INFO}!A2",
        valueInputOption="RAW",
        body={"values": rows}
    ).execute()

def save_experience_data(service, experiences: List[Dict[str, str]]):
    """Save experience data to its own worksheet"""
    # Define headers
    headers = ["Company", "Role", "Date Range", "Description"]
    
    # Define data rows
    rows = []
    for exp in experiences:
        rows.append([
            exp.get("company", ""),
            exp.get("role", ""),
            exp.get("date_range", ""),
            exp.get("description", "")
        ])
    
    # Clear existing data
    service.spreadsheets().values().clear(
        spreadsheetId=SHEET_ID,
        range=f"{SHEET_EXPERIENCE}!A:D"
    ).execute()
    
    # Update headers
    service.spreadsheets().values().update(
        spreadsheetId=SHEET_ID,
        range=f"{SHEET_EXPERIENCE}!A1",
        valueInputOption="RAW",
        body={"values": [headers]}
    ).execute()
    
    # Update data
    if rows:
        service.spreadsheets().values().update(
            spreadsheetId=SHEET_ID,
            range=f"{SHEET_EXPERIENCE}!A2",
            valueInputOption="RAW",
            body={"values": rows}
        ).execute()

def save_education_data(service, education: List[Dict[str, str]]):
    """Save education data to its own worksheet"""
    # Define headers
    headers = ["School", "Degree", "Date Range"]
    
    # Define data rows
    rows = []
    for edu in education:
        rows.append([
            edu.get("school", ""),
            edu.get("degree", ""),
            edu.get("date_range", "")
        ])
    
    # Clear existing data
    service.spreadsheets().values().clear(
        spreadsheetId=SHEET_ID,
        range=f"{SHEET_EDUCATION}!A:C"
    ).execute()
    
    # Update headers
    service.spreadsheets().values().update(
        spreadsheetId=SHEET_ID,
        range=f"{SHEET_EDUCATION}!A1",
        valueInputOption="RAW",
        body={"values": [headers]}
    ).execute()
    
    # Update data
    if rows:
        service.spreadsheets().values().update(
            spreadsheetId=SHEET_ID,
            range=f"{SHEET_EDUCATION}!A2",
            valueInputOption="RAW",
            body={"values": rows}
        ).execute()

def save_skills_data(service, skills: List[Dict[str, Any]]):
    """Save skills data to its own worksheet"""
    # Define headers
    headers = ["Skill", "Category", "Endorsements"]
    
    # Define data rows with categorization
    rows = []
    for skill_item in skills:
        # Skills might be a dictionary with 'name' field, or directly a string
        if isinstance(skill_item, dict):
            skill_name = skill_item.get("name", "")
            endorsements = skill_item.get("endorsements", 0)
        else:
            skill_name = str(skill_item)
            endorsements = 0
        
        # Make sure we have a string for skill_name
        if not isinstance(skill_name, str):
            skill_name = str(skill_name)
            
        # Determine category based on skill name
        category = categorize_skill(skill_name)
        rows.append([skill_name, category, endorsements])
    
    # Clear existing data
    service.spreadsheets().values().clear(
        spreadsheetId=SHEET_ID,
        range=f"{SHEET_SKILLS}!A:C"
    ).execute()
    
    # Update headers
    service.spreadsheets().values().update(
        spreadsheetId=SHEET_ID,
        range=f"{SHEET_SKILLS}!A1",
        valueInputOption="RAW",
        body={"values": [headers]}
    ).execute()
    
    # Update data
    if rows:
        service.spreadsheets().values().update(
            spreadsheetId=SHEET_ID,
            range=f"{SHEET_SKILLS}!A2",
            valueInputOption="RAW",
            body={"values": rows}
        ).execute()

def categorize_skill(skill: str) -> str:
    """Categorize skills based on keywords"""
    skill = skill.lower()
    
    if any(keyword in skill for keyword in ["react", "angular", "vue", "javascript", "typescript", "html", "css", "sass", "tailwind", "bootstrap"]):
        return "Frontend"
    elif any(keyword in skill for keyword in ["node", "express", "django", "flask", "python", "java", "spring", "php", "laravel", "ruby", "rails"]):
        return "Backend"
    elif any(keyword in skill for keyword in ["sql", "mysql", "postgresql", "mongodb", "firebase", "dynamodb", "redis"]):
        return "Database"
    elif any(keyword in skill for keyword in ["aws", "azure", "gcp", "cloud", "docker", "kubernetes", "devops", "ci/cd", "jenkins"]):
        return "DevOps/Cloud"
    elif any(keyword in skill for keyword in ["ai", "ml", "machine learning", "data science", "tensorflow", "pytorch", "pandas"]):
        return "AI/ML"
    else:
        return "Other"

def save_projects_data(service, projects: List[Dict[str, str]]):
    """Save projects data to its own worksheet"""
    # Define headers
    headers = ["Name", "Date Range", "Description", "URL"]
    
    # Define data rows
    rows = []
    for project in projects:
        rows.append([
            project.get("name", ""),
            project.get("date_range", ""),
            project.get("description", ""),
            project.get("url", "")
        ])
    
    # Clear existing data
    service.spreadsheets().values().clear(
        spreadsheetId=SHEET_ID,
        range=f"{SHEET_PROJECTS}!A:D"
    ).execute()
    
    # Update headers
    service.spreadsheets().values().update(
        spreadsheetId=SHEET_ID,
        range=f"{SHEET_PROJECTS}!A1",
        valueInputOption="RAW",
        body={"values": [headers]}
    ).execute()
    
    # Update data
    if rows:
        service.spreadsheets().values().update(
            spreadsheetId=SHEET_ID,
            range=f"{SHEET_PROJECTS}!A2",
            valueInputOption="RAW",
            body={"values": rows}
        ).execute()

def save_certifications_data(service, certifications: List[Dict[str, str]]):
    """Save certifications data to its own worksheet"""
    # Define headers
    headers = ["Name", "Organization", "Date", "URL"]
    
    # Define data rows
    rows = []
    for cert in certifications:
        rows.append([
            cert.get("name", ""),
            cert.get("organization", ""),
            cert.get("date", ""),
            cert.get("url", "")
        ])
    
    # Clear existing data
    service.spreadsheets().values().clear(
        spreadsheetId=SHEET_ID,
        range=f"{SHEET_CERTIFICATIONS}!A:D"
    ).execute()
    
    # Update headers
    service.spreadsheets().values().update(
        spreadsheetId=SHEET_ID,
        range=f"{SHEET_CERTIFICATIONS}!A1",
        valueInputOption="RAW",
        body={"values": [headers]}
    ).execute()
    
    # Update data
    if rows:
        service.spreadsheets().values().update(
            spreadsheetId=SHEET_ID,
            range=f"{SHEET_CERTIFICATIONS}!A2",
            valueInputOption="RAW",
            body={"values": rows}
        ).execute()

def get_sheet_data(service, sheet_name: str, range_str: str = "A1:Z1000") -> List[List[str]]:
    """Get data from a specific sheet"""
    try:
        result = service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID,
            range=f"{sheet_name}!{range_str}"
        ).execute()
        
        values = result.get('values', [])
        print(f"Fetched {len(values)} rows from {sheet_name}")
        return values
    except Exception as e:
        print(f"Error fetching data from {sheet_name}: {e}")
        return []

async def get_linkedin_data_from_sheet() -> Optional[Dict[str, Any]]:
    """
    Retrieve LinkedIn profile data from Google Sheets with improved structure
    """
    try:
        # Set up the Google Sheets service
        service = await setup_sheets_service()
        if not service:
            print("Failed to set up Google Sheets service for LinkedIn data")
            return None
        
        # First ensure the LinkedIn sheets exist
        sheet_exists = await ensure_linkedin_sheet_exists()
        if not sheet_exists["success"]:
            print("Could not find or create LinkedIn sheet")
            return None
        
        # Get CV URL from dedicated sheet
        cv_url = await get_cv_url_from_sheet()
        print(f"CV URL from get_cv_url_from_sheet: {cv_url}")
            
        # Get data from each sheet with detailed debugging for BasicInfo
        print("\n===== DETAILED DEBUG FOR BASIC INFO SHEET =====")
        basic_info_data = get_sheet_data(service, SHEET_BASIC_INFO, "A1:B10")
        print(f"Basic info raw data rows:")
        # Print each row with row number for debugging
        for i, row in enumerate(basic_info_data):
            print(f"Row {i}: {row}")
        
        # Continue with other data fetching
        experience_data = get_sheet_data(service, SHEET_EXPERIENCE, "A1:Z50")
        education_data = get_sheet_data(service, SHEET_EDUCATION, "A1:Z20")
        skills_data = get_sheet_data(service, SHEET_SKILLS, "A1:Z50")
        projects_data = get_sheet_data(service, SHEET_PROJECTS, "A1:Z20")
        certifications_data = get_sheet_data(service, SHEET_CERTIFICATIONS, "A1:Z20")
        
        # Process each section of data
        profile_data = {}
        
        # Set CV URL if found
        if cv_url:
            profile_data['cv_url'] = cv_url
            print(f"Set CV URL in profile data: {cv_url}")
        
        # Process basic info - in the format Field/Value (key-value pairs)
        if basic_info_data and len(basic_info_data) > 0:  # Ensure we have at least 1 row
            basic_info = {}
            
            print(f"===== DEBUG: Raw basic_info_data: {basic_info_data} =====")
            
            # Based on the screenshot, we have a sheet with Field names in column A and values in column B
            # The first row has headers like "Field", "Value", "Location", etc.
            # Data starts from row 2
            
            # Skip the header row if it exists (row 1)
            data_start_idx = 1 if len(basic_info_data) > 0 and basic_info_data[0][0] == "Field" else 0
            
            # Create a dictionary to map field names to their corresponding values
            for i in range(data_start_idx, len(basic_info_data)):
                row = basic_info_data[i]
                if len(row) >= 2:  # Ensure we have at least field name and value
                    field_name = row[0].strip().lower()  # Field name in column A
                    field_value = row[1].strip()         # Field value in column B
                    
                    print(f"===== DEBUG: Found field: {field_name} = {field_value} =====")
                    
                    # Map fields to our expected structure
                    if field_name == "name":
                        basic_info["name"] = field_value
                    elif field_name == "headline":
                        basic_info["headline"] = field_value
                    elif field_name == "location":
                        basic_info["location"] = field_value
                    elif field_name == "profile image":
                        basic_info["profile_image"] = field_value
                    elif field_name == "about":
                        basic_info["about"] = field_value
            
            print(f"===== DEBUG: Extracted basic_info: {basic_info} =====")
            
            # No need to override values with hardcoded defaults if they exist
            # Only add fallbacks for truly missing fields
            if "name" not in basic_info or not basic_info["name"]:
                basic_info["name"] = "Bishal Budhathoki"
                print(f"===== DEBUG: Using fallback name =====")
                
            if "headline" not in basic_info or not basic_info["headline"]:
                basic_info["headline"] = "Software Developer" 
                print(f"===== DEBUG: Using fallback headline =====")
                
            if "location" not in basic_info or not basic_info["location"]:
                basic_info["location"] = "Remote"
                print(f"===== DEBUG: Using fallback location =====")
            
            profile_data['basic_info'] = basic_info
            print(f"===== DEBUG: Final profile_data basic_info: {basic_info} =====")
        
        # Process experience data - has column headers
        if experience_data and len(experience_data) > 0:
            experience_list = []
            
            # Get headers from first row
            headers = []
            if len(experience_data) > 0:
                headers = [h.lower().replace(' ', '_') for h in experience_data[0]]
            
            # Process rows (skip header)
            for row in experience_data[1:]:
                if row and len(row) > 0:  # Skip empty rows
                    exp = {}
                    for i, header in enumerate(headers):
                        if i < len(row):
                            # Map the headers to what the frontend expects
                            if header.lower() == "company":
                                exp["company"] = row[i]
                            elif header.lower() == "role":
                                exp["role"] = row[i]
                            elif header.lower() == "date_range":
                                exp["date_range"] = row[i]
                            elif header.lower() == "description":
                                exp["description"] = row[i]
                            else:
                                exp[header] = row[i]
                    
                    if exp:  # Only add non-empty items
                        experience_list.append(exp)
            
            profile_data['experience'] = experience_list
            print(f"Processed {len(experience_list)} experiences")
        
        # Process education data - has column headers
        if education_data and len(education_data) > 0:
            education_list = []
            
            # Get headers from first row
            headers = []
            if len(education_data) > 0:
                headers = [h.lower().replace(' ', '_') for h in education_data[0]]
            
            # Process rows (skip header)
            for row in education_data[1:]:
                if row and len(row) > 0:  # Skip empty rows
                    edu = {}
                    for i, header in enumerate(headers):
                        if i < len(row):
                            # Map headers to what frontend expects
                            if header.lower() == "school":
                                edu["school"] = row[i]
                            elif header.lower() == "degree":
                                edu["degree"] = row[i]
                            elif header.lower() == "date_range":
                                edu["date_range"] = row[i]
                            else:
                                edu[header] = row[i]
                    
                    if edu:  # Only add non-empty items
                        education_list.append(edu)
            
            profile_data['education'] = education_list
            print(f"Processed {len(education_list)} education entries")
        
        # Process skills - has column headers Skill, Category, Endorsements
        if skills_data and len(skills_data) > 0:
            skills_list = []
            
            # Get headers from first row
            headers = []
            if len(skills_data) > 0:
                headers = [h.lower() for h in skills_data[0]]
            
            # Map header indices
            skill_idx = headers.index('skill') if 'skill' in headers else -1
            category_idx = headers.index('category') if 'category' in headers else -1
            endorsements_idx = headers.index('endorsements') if 'endorsements' in headers else -1
            
            # Process rows (skip header)
            for row in skills_data[1:]:
                if row and len(row) > 0:  # Skip empty rows
                    skill = {}
                    
                    # Get data based on header indices
                    if skill_idx >= 0 and skill_idx < len(row):
                        # Rename to 'name' for frontend compatibility
                        skill['name'] = row[skill_idx]
                        
                        # Add category if available
                        if category_idx >= 0 and category_idx < len(row):
                            skill['category'] = row[category_idx]
                            
                        # Add endorsements if available
                        if endorsements_idx >= 0 and endorsements_idx < len(row):
                            skill['endorsements'] = row[endorsements_idx]
                            
                        skills_list.append(skill)
            
            profile_data['skills'] = skills_list
            print(f"Processed {len(skills_list)} skills")
        
        # Process projects - has column headers Name, Date Range, Description, URL
        if projects_data and len(projects_data) > 0:
            projects_list = []
            
            # Get headers from first row
            headers = []
            if len(projects_data) > 0:
                headers = [h.lower() for h in projects_data[0]]
            
            # Map header indices
            name_idx = headers.index('name') if 'name' in headers else -1
            date_range_idx = headers.index('date range') if 'date range' in headers else -1
            description_idx = headers.index('description') if 'description' in headers else -1
            url_idx = headers.index('url') if 'url' in headers else -1
            
            # Process rows (skip header)
            for row in projects_data[1:]:
                if row and len(row) > 0:  # Skip empty rows
                    project = {}
                    
                    # Get data based on header indices
                    if name_idx >= 0 and name_idx < len(row):
                        project['name'] = row[name_idx]
                        
                    if date_range_idx >= 0 and date_range_idx < len(row):
                        project['date_range'] = row[date_range_idx]
                        
                    if description_idx >= 0 and description_idx < len(row):
                        project['description'] = row[description_idx]
                        
                    if url_idx >= 0 and url_idx < len(row):
                        project['url'] = row[url_idx]
                    
                    if project:  # Only add non-empty items
                        projects_list.append(project)
                    
            profile_data['projects'] = projects_list
            print(f"Processed {len(projects_list)} projects")
        
        # Process certifications
        if certifications_data and len(certifications_data) > 0:
            certifications_list = []
            
            # Get headers from first row
            headers = []
            if len(certifications_data) > 0:
                headers = [h.lower() for h in certifications_data[0]]
            
            # Map header indices
            name_idx = headers.index('name') if 'name' in headers else -1
            org_idx = headers.index('organization') if 'organization' in headers else -1
            date_idx = headers.index('date') if 'date' in headers else -1
            url_idx = headers.index('url') if 'url' in headers else -1
            
            # Process rows (skip header)
            for row in certifications_data[1:]:
                if row and len(row) > 0:  # Skip empty rows
                    cert = {}
                    
                    # Get data based on header indices
                    if name_idx >= 0 and name_idx < len(row):
                        cert['name'] = row[name_idx]
                        
                    if org_idx >= 0 and org_idx < len(row):
                        cert['organization'] = row[org_idx]
                        
                    if date_idx >= 0 and date_idx < len(row):
                        cert['date'] = row[date_idx]
                        
                    if url_idx >= 0 and url_idx < len(row):
                        cert['url'] = row[url_idx]
                    
                    if cert:  # Only add non-empty items
                        certifications_list.append(cert)
            
            profile_data['certifications'] = certifications_list
            print(f"Processed {len(certifications_list)} certifications")
        
        return profile_data
    
    except Exception as e:
        print(f"Error getting LinkedIn data from sheet: {e}")
        import traceback
        traceback.print_exc()
        return None

async def ensure_linkedin_sheet_exists():
    """Ensure that all LinkedIn-related sheets exist"""
    try:
        # Set up the Google Sheets service
        service = await setup_sheets_service()
        if not service:
            print("Failed to set up Google Sheets service")
            return {"success": False, "message": "Failed to set up Google Sheets service"}
        
        # Get spreadsheet info to check existing sheets
        try:
            spreadsheet = service.spreadsheets().get(spreadsheetId=SHEET_ID).execute()
            sheets = spreadsheet.get('sheets', [])
            existing_sheets = [sheet['properties']['title'] for sheet in sheets]
        
            # Check if each required sheet exists, create if not
            required_sheets = {
                "BasicInfo": [],  # No specific headers needed - using Field/Value format
                "Experience": ["Company", "Role", "Date Range", "Description"],
                "Education": ["School", "Degree", "Date Range"],
                "Skills": ["Skill", "Category", "Endorsements"],
                "Projects": ["Name", "Date Range", "Description", "URL"],
                "Certifications": ["Name", "Organization", "Date", "URL"],
                "cv_url": ["CV_URL"]  # Special sheet for CV URL
            }
            
            # Track if all required sheets exist
            all_sheets_exist = True
            created_sheets = []
            
            for sheet_name, headers in required_sheets.items():
                if sheet_name not in existing_sheets:
                    # Sheet doesn't exist, create it
                    all_sheets_exist = False
                    created_sheets.append(sheet_name)
                    
                    # Create the sheet
                    requests = [{
                        'addSheet': {
                            'properties': {
                                'title': sheet_name
                            }
                        }
                    }]
                    
                    service.spreadsheets().batchUpdate(
                        spreadsheetId=SHEET_ID,
                        body={'requests': requests}
                    ).execute()
                    
                    print(f"Created new sheet: {sheet_name}")
                    
                    # Add headers if specified
                    if headers:
                        service.spreadsheets().values().update(
                            spreadsheetId=SHEET_ID,
                            range=f"{sheet_name}!A1:{chr(65 + len(headers) - 1)}1",
                            valueInputOption="RAW",
                            body={
                                "values": [headers]
                            }
                        ).execute()
                        print(f"Added headers to {sheet_name}: {headers}")
                    
                    # Special case for cv_url sheet
                    if sheet_name == "cv_url":
                        service.spreadsheets().values().update(
                            spreadsheetId=SHEET_ID,
                            range=f"{sheet_name}!A1:B1",
                            valueInputOption="RAW",
                            body={
                                "values": [["CV_URL", "https://drive.google.com/file/d/1fq0AfXPbBz6Nw4UlCpuKL-0VM9YcW6Ol/view?usp=drive_link"]]
                            }
                        ).execute()
                        print(f"Added CV URL placeholder to {sheet_name}")
                    
                    # Special case for BasicInfo sheet - add some initial data
                    if sheet_name == "BasicInfo":
                        service.spreadsheets().values().update(
                            spreadsheetId=SHEET_ID,
                            range=f"{sheet_name}!A1:B5",
                            valueInputOption="RAW",
                            body={
                                "values": [
                                    ["Name", "Bishal Budhathoki"],
                                    ["Headline", "Full Stack Developer & AI Enthusiast"],
                                    ["Location", "Remote"],
                                    ["Profile Image", "https://ui-avatars.com/api/?name=Bishal+Budhathoki&size=400&background=6366f1&color=ffffff"]
                                ]
                            }
                        ).execute()
                        print(f"Added initial profile data to {sheet_name}")
        
                # Special case - if BasicInfo sheet exists but has no data, add data
                elif sheet_name == "BasicInfo":
                    result = service.spreadsheets().values().get(
                        spreadsheetId=SHEET_ID,
                        range=f"{sheet_name}!A1:B10"
                    ).execute()
                    
                    values = result.get('values', [])
                    print(f"BasicInfo sheet data: {values}")
                    
                    if not values or len(values) < 3:  # No data or not enough data (just header row)
                        service.spreadsheets().values().update(
                            spreadsheetId=SHEET_ID,
                            range=f"{sheet_name}!A1:B5",
                            valueInputOption="RAW",
                            body={
                                "values": [                                    
                                    ["Name", "Bishal Budhathoki"],
                                    ["Headline", "Full Stack Developer & AI Enthusiast"],
                                    ["Location", "Remote"],
                                    ["Profile Image", "https://ui-avatars.com/api/?name=Bishal+Budhathoki&size=400&background=6366f1&color=ffffff"]
                                ]
                            }
                        ).execute()
                        print(f"Added missing data to existing {sheet_name} sheet")
            
            message = "All LinkedIn sheets verified"
            if created_sheets:
                message = f"Created LinkedIn sheets: {', '.join(created_sheets)}"
            
            return {"success": True, "message": message}
                
        except Exception as e:
            print(f"Error checking sheets: {e}")
            return {"success": False, "message": f"Error checking sheets: {str(e)}"}
            
    except Exception as e:
        print(f"Failed to ensure LinkedIn sheets exist: {e}")
        return {"success": False, "message": f"Failed to ensure LinkedIn sheets exist: {str(e)}"}

async def get_cv_url_from_sheet():
    """Get the CV URL directly from the sheet"""
    try:
        service = await setup_sheets_service()
        if not service:
            return None
            
        try:
            # Based on the screenshot, CV URL is in column F of the BasicInfo sheet
            result = service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range="BasicInfo!F1:F10"
            ).execute()
        
            values = result.get('values', [])
            print(f"CV URL column values: {values}")
            
            # Find the CV URL value (row 2, column F - after the header)
            cv_url = None
            for i, row in enumerate(values):
                if i == 0 and len(row) > 0 and row[0] == "CV URL":
                    # This is the header row
                    continue
                    
                if i > 0 and len(row) > 0 and row[0]:
                    # This should be the CV URL value
                    cv_url = row[0]
                    print(f"Found CV URL in BasicInfo sheet, column F, row {i+1}: {cv_url}")
                    return cv_url
            
            # If we couldn't find it, check the cv_url sheet as a fallback
            result = service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range="cv_url!A1:B2"
            ).execute()
        
            values = result.get('values', [])
            if values and len(values) > 0 and len(values[0]) >= 2:
                cv_url = values[0][1]
                print(f"Found CV URL in cv_url sheet: {cv_url}")
                return cv_url
            
            # Hardcoded URL from the screenshot as a fallback
            fallback_url = "https://drive.google.com/file/d/1fq0AfXPbBz6Nw4UlCpuKL-0VM9YcW6Ol/view?usp=drive_link"
            print(f"Using fallback CV URL: {fallback_url}")
            return fallback_url
                
        except Exception as e:
            print(f"Error getting CV URL: {e}")
            
            # Hardcoded URL from the screenshot as a fallback
            fallback_url = "https://drive.google.com/file/d/1fq0AfXPbBz6Nw4UlCpuKL-0VM9YcW6Ol/view?usp=drive_link"
            print(f"Using fallback CV URL: {fallback_url}")
            return fallback_url
            
        return None
    except Exception as e:
        print(f"Error getting CV URL: {e}")
        return None 