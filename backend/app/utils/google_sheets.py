import os
import json
from typing import List, Dict, Any
from google.oauth2.credentials import Credentials
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

class GoogleSheetsManager:
    def __init__(self, credentials_path: str):
        """Initialize Google Sheets manager with credentials"""
        self.credentials_path = credentials_path
        self.credentials = None
        self.service = None
        self.initialize_service()
    
    def initialize_service(self):
        """Initialize the Google Sheets service"""
        try:
            # Load credentials from the JSON file
            self.credentials = service_account.Credentials.from_service_account_file(
                self.credentials_path,
                scopes=['https://www.googleapis.com/auth/spreadsheets']
            )
            
            # Build the service
            self.service = build('sheets', 'v4', credentials=self.credentials)
            print("Google Sheets service initialized successfully")
        except Exception as e:
            print(f"Error initializing Google Sheets service: {e}")
            raise

    def create_spreadsheet(self, title: str) -> str:
        """Create a new spreadsheet and return its ID"""
        try:
            spreadsheet = {
                'properties': {
                    'title': title
                }
            }
            spreadsheet = self.service.spreadsheets().create(body=spreadsheet).execute()
            print(f"Created spreadsheet ID: {spreadsheet.get('spreadsheetId')}")
            return spreadsheet.get('spreadsheetId')
        except HttpError as error:
            print(f"An error occurred while creating spreadsheet: {error}")
            raise

    def update_sheet_data(self, spreadsheet_id: str, range_name: str, values: List[List[Any]]):
        """Update data in the specified range of the spreadsheet"""
        try:
            body = {
                'values': values
            }
            result = self.service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range=range_name,
                valueInputOption='RAW',
                body=body
            ).execute()
            print(f"{result.get('updatedCells')} cells updated.")
            return result
        except HttpError as error:
            print(f"An error occurred while updating data: {error}")
            raise

    def get_sheet_data(self, spreadsheet_id: str, range_name: str) -> List[List[Any]]:
        """Get data from the specified range of the spreadsheet"""
        try:
            result = self.service.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id,
                range=range_name
            ).execute()
            return result.get('values', [])
        except HttpError as error:
            print(f"An error occurred while getting data: {error}")
            raise

    def clear_sheet_range(self, spreadsheet_id: str, range_name: str):
        """Clear data from the specified range of the spreadsheet"""
        try:
            self.service.spreadsheets().values().clear(
                spreadsheetId=spreadsheet_id,
                range=range_name
            ).execute()
        except HttpError as error:
            print(f"An error occurred while clearing data: {error}")
            raise

    def format_linkedin_data(self, profile_data: Dict[str, Any]) -> List[List[Any]]:
        """Format LinkedIn profile data for Google Sheets"""
        # Headers for different sections
        basic_info = [
            ["Basic Information"],
            ["Name", profile_data.get("basic_info", {}).get("name", "")],
            ["Headline", profile_data.get("basic_info", {}).get("headline", "")],
            ["Location", profile_data.get("basic_info", {}).get("location", "")],
            ["Profile Image", profile_data.get("basic_info", {}).get("profile_image", "")],
            ["About", profile_data.get("about", "")],
            [""]  # Empty row for spacing
        ]

        # Experience section
        experience_headers = ["Experience"]
        experience_data = [["Role", "Company", "Date Range", "Location", "Description"]]
        for exp in profile_data.get("experience", []):
            experience_data.append([
                exp.get("role", ""),
                exp.get("company", ""),
                exp.get("date_range", ""),
                exp.get("location", ""),
                exp.get("description", "")
            ])
        experience = [experience_headers] + experience_data + [[""]]  # Add empty row for spacing

        # Education section
        education_headers = ["Education"]
        education_data = [["School", "Degree", "Field of Study", "Date Range"]]
        for edu in profile_data.get("education", []):
            education_data.append([
                edu.get("school", ""),
                edu.get("degree", ""),
                edu.get("field_of_study", ""),
                edu.get("date_range", "")
            ])
        education = [education_headers] + education_data + [[""]]

        # Skills section
        skills_headers = ["Skills"]
        skills_data = [["Skill", "Endorsements"]]
        for skill in profile_data.get("skills", []):
            skills_data.append([
                skill.get("name", ""),
                str(skill.get("endorsements", 0))
            ])
        skills = [skills_headers] + skills_data + [[""]]

        # Projects section
        projects_headers = ["Projects"]
        projects_data = [["Name", "Date Range", "Description", "URL"]]
        for project in profile_data.get("projects", []):
            projects_data.append([
                project.get("name", ""),
                project.get("date_range", ""),
                project.get("description", ""),
                project.get("url", "")
            ])
        projects = [projects_headers] + projects_data + [[""]]

        # Certifications section
        certifications_headers = ["Certifications"]
        certifications_data = [["Name", "Organization", "Issue Date", "URL"]]
        for cert in profile_data.get("certifications", []):
            certifications_data.append([
                cert.get("name", ""),
                cert.get("organization", ""),
                cert.get("issue_date", ""),
                cert.get("credential_url", "")
            ])
        certifications = [certifications_headers] + certifications_data

        # Combine all sections
        return basic_info + experience + education + skills + projects + certifications

    def update_linkedin_data(self, spreadsheet_id: str, profile_data: Dict[str, Any]):
        """Update LinkedIn profile data in the spreadsheet"""
        try:
            # Format the data for Google Sheets
            formatted_data = self.format_linkedin_data(profile_data)
            
            # Clear existing data
            self.clear_sheet_range(spreadsheet_id, 'A1:Z1000')
            
            # Update with new data
            self.update_sheet_data(spreadsheet_id, 'A1', formatted_data)
            print("LinkedIn data updated successfully in Google Sheets")
        except Exception as e:
            print(f"Error updating LinkedIn data: {e}")
            raise 