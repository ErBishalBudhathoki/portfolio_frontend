from app.linkedin_scraper import LinkedInScraper
import json
from webdriver_manager.chrome import ChromeDriverManager
from selenium import webdriver
from selenium.webdriver.chrome.service import Service

def main():
    try:
        # Install ChromeDriver using webdriver-manager
        service = Service(ChromeDriverManager().install())
        
        # Initialize scraper in non-headless mode with debug enabled
        scraper = LinkedInScraper(headless=False, debug=True)
        scraper.driver = webdriver.Chrome(service=service)
        
        # Run the scraper
        profile_data = scraper.scrape()
        
        # Print the results
        print("\nScraping Results:")
        print(json.dumps(profile_data, indent=2))
        
    except Exception as e:
        print(f"Error running scraper: {e}")

if __name__ == "__main__":
    main() 