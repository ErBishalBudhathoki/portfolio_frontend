import os
import asyncio
import json
import sys
from app.linkedin_scraper import get_fallback_profile_data
from app.linkedin_sheet import get_linkedin_data_from_sheet, save_linkedin_data_to_sheet
from app.google_sheet import setup_sheets_service

# Define colors for prettier terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

async def compare_data(save_to_sheet=False):
    """Compare fallback data with Google Sheet data"""
    # Get fallback data
    print(f"{Colors.HEADER}{Colors.BOLD}COMPARING FALLBACK DATA WITH GOOGLE SHEET DATA{Colors.ENDC}")
    print(f"{Colors.YELLOW}Save to sheet option: {save_to_sheet}{Colors.ENDC}")
    print("\n" + "="*80)
    
    # Get fallback data
    print(f"\n{Colors.BLUE}{Colors.BOLD}FALLBACK DATA:{Colors.ENDC}")
    fallback_data = get_fallback_profile_data("Testing comparison")
    print(f"{Colors.YELLOW}_scrape_info: {fallback_data.get('_scrape_info', 'Not set')}{Colors.ENDC}")
    
    # Print fallback data summary
    print(f"\n{Colors.GREEN}Basic Info:{Colors.ENDC}")
    print(f"  Name: {fallback_data['basic_info'].get('name', 'N/A')}")
    print(f"  Headline: {fallback_data['basic_info'].get('headline', 'N/A')}")
    
    print(f"\n{Colors.GREEN}Experience ({len(fallback_data.get('experience', []))} entries):{Colors.ENDC}")
    for i, exp in enumerate(fallback_data.get('experience', [])[:2], 1):
        print(f"  {i}. {exp.get('role', 'N/A')} at {exp.get('company', 'N/A')}")
    
    print(f"\n{Colors.GREEN}Skills ({len(fallback_data.get('skills', []))} entries):{Colors.ENDC}")
    skills = [s.get('name', s) if isinstance(s, dict) else s for s in fallback_data.get('skills', [])[:5]]
    print(f"  {', '.join(skills)}{' ...' if len(fallback_data.get('skills', [])) > 5 else ''}")
    
    print(f"\n{Colors.GREEN}Projects ({len(fallback_data.get('projects', []))} entries):{Colors.ENDC}")
    for i, proj in enumerate(fallback_data.get('projects', [])[:2], 1):
        print(f"  {i}. {proj.get('name', 'N/A')}")

    # Only save to sheet if requested
    if save_to_sheet:
        print(f"\n{Colors.YELLOW}Saving fallback data to Google Sheet...{Colors.ENDC}")
        save_result = await save_linkedin_data_to_sheet(fallback_data)
        print(f"Save result: {save_result}")
    else:
        print(f"\n{Colors.YELLOW}Skipping save to Google Sheet as requested{Colors.ENDC}")

    # Get sheet data
    print("\n" + "="*80)
    print(f"\n{Colors.BLUE}{Colors.BOLD}GOOGLE SHEET DATA:{Colors.ENDC}")
    sheet_data = await get_linkedin_data_from_sheet()
    
    if not sheet_data:
        print(f"{Colors.RED}Failed to retrieve data from Google Sheet{Colors.ENDC}")
        return
    
    # Print sheet data summary
    print(f"\n{Colors.GREEN}Basic Info:{Colors.ENDC}")
    print(f"  Name: {sheet_data['basic_info'].get('name', 'N/A')}")
    print(f"  Headline: {sheet_data['basic_info'].get('headline', 'N/A')}")
    
    print(f"\n{Colors.GREEN}Experience ({len(sheet_data.get('experience', []))} entries):{Colors.ENDC}")
    for i, exp in enumerate(sheet_data.get('experience', [])[:2], 1):
        print(f"  {i}. {exp.get('role', 'N/A')} at {exp.get('company', 'N/A')}")
    
    print(f"\n{Colors.GREEN}Skills ({len(sheet_data.get('skills', []))} entries):{Colors.ENDC}")
    skills = sheet_data.get('skills', [])[:5]
    print(f"  {', '.join(skills)}{' ...' if len(sheet_data.get('skills', [])) > 5 else ''}")
    
    print(f"\n{Colors.GREEN}Projects ({len(sheet_data.get('projects', []))} entries):{Colors.ENDC}")
    for i, proj in enumerate(sheet_data.get('projects', [])[:2], 1):
        print(f"  {i}. {proj.get('name', 'N/A')}")
    
    # Print Skills by Category
    print(f"\n{Colors.GREEN}Skills by Category:{Colors.ENDC}")
    if sheet_data.get('skills_by_category'):
        for category, skills in sheet_data.get('skills_by_category', {}).items():
            print(f"  {category} ({len(skills)}): {', '.join(skills[:3])}{' ...' if len(skills) > 3 else ''}")
    else:
        print(f"  {Colors.RED}No categorized skills found{Colors.ENDC}")
    
    # Compare data
    print("\n" + "="*80)
    print(f"\n{Colors.BLUE}{Colors.BOLD}DATA COMPARISON (FALLBACK VS SHEET):{Colors.ENDC}")
    
    # Compare basic info
    fallback_name = fallback_data.get('basic_info', {}).get('name', '')
    sheet_name = sheet_data.get('basic_info', {}).get('name', '')
    print(f"Name: {Colors.GREEN if fallback_name == sheet_name else Colors.RED}{'MATCH' if fallback_name == sheet_name else 'DIFFERENT'}{Colors.ENDC}")
    
    # Compare experience
    fallback_exp_count = len(fallback_data.get('experience', []))
    sheet_exp_count = len(sheet_data.get('experience', []))
    print(f"Experience count: {Colors.GREEN if fallback_exp_count == sheet_exp_count else Colors.RED}{'MATCH' if fallback_exp_count == sheet_exp_count else 'DIFFERENT'}{Colors.ENDC} (Fallback: {fallback_exp_count}, Sheet: {sheet_exp_count})")
    
    # Compare skills
    fallback_skills_count = len(fallback_data.get('skills', []))
    sheet_skills_count = len(sheet_data.get('skills', []))
    print(f"Skills count: {Colors.GREEN if fallback_skills_count == sheet_skills_count else Colors.RED}{'MATCH' if fallback_skills_count == sheet_skills_count else 'DIFFERENT'}{Colors.ENDC} (Fallback: {fallback_skills_count}, Sheet: {sheet_skills_count})")
    
    # Compare projects
    fallback_projects_count = len(fallback_data.get('projects', []))
    sheet_projects_count = len(sheet_data.get('projects', []))
    print(f"Projects count: {Colors.GREEN if fallback_projects_count == sheet_projects_count else Colors.RED}{'MATCH' if fallback_projects_count == sheet_projects_count else 'DIFFERENT'}{Colors.ENDC} (Fallback: {fallback_projects_count}, Sheet: {sheet_projects_count})")
    
    # Check sheets service status
    print("\n" + "="*80)
    print(f"\n{Colors.BLUE}{Colors.BOLD}SHEETS SERVICE STATUS:{Colors.ENDC}")
    service = setup_sheets_service()
    if service:
        print(f"{Colors.GREEN}Successfully connected to Google Sheets API{Colors.ENDC}")
        
        # Try a simple API call to check access
        try:
            result = service.spreadsheets().get(spreadsheetId=os.getenv("SHEET_ID")).execute()
            print(f"{Colors.GREEN}Successfully retrieved spreadsheet info{Colors.ENDC}")
            print(f"  Title: {result.get('properties', {}).get('title', 'N/A')}")
            print(f"  Sheets: {', '.join([sheet['properties']['title'] for sheet in result.get('sheets', [])])}")
        except Exception as e:
            print(f"{Colors.RED}Error accessing spreadsheet: {e}{Colors.ENDC}")
    else:
        print(f"{Colors.RED}Failed to connect to Google Sheets API{Colors.ENDC}")

if __name__ == "__main__":
    # Check for save_to_sheet argument
    save_to_sheet = '--save' in sys.argv
    asyncio.run(compare_data(save_to_sheet)) 