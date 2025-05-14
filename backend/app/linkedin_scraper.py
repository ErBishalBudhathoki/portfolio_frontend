import logging
import os
import json
import time
import random
from typing import Dict, List, Any
from datetime import datetime
import traceback

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.action_chains import ActionChains
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv
from .notification_helper import NotificationHelper

# Load environment variables
load_dotenv()

# LinkedIn credentials from environment variables
LINKEDIN_EMAIL = os.getenv("LINKEDIN_EMAIL")
LINKEDIN_PASSWORD = os.getenv("LINKEDIN_PASSWORD")
LINKEDIN_PROFILE_URL = os.getenv(
    "LINKEDIN_PROFILE_URL",
    "https://www.linkedin.com/in/bishalbudhathoki/")

# Output file for storing scraped data
DATA_DIR = os.getenv("DATA_DIR", "data")
OUTPUT_FILE = os.path.join(DATA_DIR, "linkedin_profile.json")

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(DATA_DIR, "linkedin_scraper.log")),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("linkedin_scraper")

# Fallback data in case scraping fails
FALLBACK_DATA = {
    "about": "Data not available - LinkedIn scraping failed",
    "experience": [
        {
            "title": "Experience data not available",
            "company": "LinkedIn scraping failed",
            "duration": "",
            "location": "",
            "description": ""
        }
    ],
    "education": [
        {
            "school": "Education data not available",
            "degree": "LinkedIn scraping failed",
            "field": "",
            "duration": ""
        }
    ],
    "skills": {
        "top_skills": ["LinkedIn", "scraping", "unavailable"],
        "industry_knowledge": [],
        "tools_technologies": [],
        "interpersonal_skills": [],
        "languages": [],
        "other_skills": []
    },
    "projects": [],
    "certifications": []
}

class LinkedInScraper:
    def __init__(
            self,
            headless: bool = False,
            debug: bool = False,
            stealth_mode: bool = True):
        """
        Initialize the LinkedIn scraper with enhanced stealth options

        Args:
            headless: Run browser in headless mode
            debug: Enable debug logging
            stealth_mode: Apply additional anti-detection measures
        """
        self.debug = debug
        self.driver = None
        self.stealth_mode = stealth_mode
        self.wait_time_short = random.uniform(2, 4)
        self.wait_time_medium = random.uniform(4, 7)
        self.wait_time_long = random.uniform(7, 12)
        self.notifier = NotificationHelper()

        try:
            # Set up the Chrome WebDriver with specified options
            self.setup_driver(headless=headless)

            if not self.driver:
                raise Exception("Failed to initialize WebDriver")

            # Log successful initialization
            self.log("LinkedIn scraper initialized successfully")

        except Exception as e:
            error_msg = f"Error initializing scraper: {e}"
            self.log(error_msg, level="ERROR")
            self.log(traceback.format_exc(), level="DEBUG")
            self.notifier.notify_scrape_error(error_msg)
            raise

    def log(self, message: str, level: str = "INFO"):
        """Enhanced logging with levels"""
        if level == "DEBUG" and not self.debug:
            return

        if level == "DEBUG":
            logger.debug(message)
        elif level == "ERROR":
            logger.error(message)
        elif level == "WARNING":
            logger.warning(message)
        else:
            logger.info(message)

    def save_screenshot(self, filename: str):
        """Save a screenshot for debugging purposes"""
        try:
            if not os.path.exists(DATA_DIR):
                os.makedirs(DATA_DIR)
            screenshot_path = os.path.join(DATA_DIR, filename)
            self.driver.save_screenshot(screenshot_path)
            self.log(f"Screenshot saved to {screenshot_path}", level="DEBUG")
        except Exception as e:
            self.log(f"Failed to save screenshot: {e}", level="WARNING")

    def setup_driver(self, headless: bool = False) -> None:
        """Set up Chrome WebDriver with appropriate options"""
        try:
            logger.info("Setting up Chrome WebDriver...")
            chrome_options = Options()
            
            # Always use headless mode in production/server environments
            chrome_options.add_argument('--headless=new')  # Use the new headless mode
            chrome_options.add_argument('--disable-gpu')
            
            # Add additional options to avoid detection
            chrome_options.add_argument(
                '--disable-blink-features=AutomationControlled')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--window-size=1920,1080')
            chrome_options.add_argument('--start-maximized')
            
            # Add options for running in Docker/cloud environments
            chrome_options.add_argument('--remote-debugging-port=9222')
            chrome_options.add_argument('--disable-setuid-sandbox')
            chrome_options.add_argument('--disable-extensions')
            
            # Add user agent
            chrome_options.add_argument(
                '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36')

            # Exclude automation info from navigator
            chrome_options.add_experimental_option(
                "excludeSwitches", ["enable-automation"])
            chrome_options.add_experimental_option(
                'useAutomationExtension', False)
                
            # Try multiple approaches to initialize the Chrome driver
            
            try:
                # Method 1: Direct initialization (like in the diagnostic endpoint)
                logger.info("Trying direct Chrome initialization...")
                self.driver = webdriver.Chrome(options=chrome_options)
                logger.info("Direct Chrome initialization successful")
            except Exception as e:
                logger.error(f"Direct Chrome initialization failed: {e}")
                
                try:
                    # Method 2: Use Service with default ChromeDriver
                    logger.info("Trying with Service (no custom path)...")
                    service = Service()
                    self.driver = webdriver.Chrome(service=service, options=chrome_options)
                    logger.info("Chrome initialization with Service successful")
                except Exception as e:
                    logger.error(f"Service initialization failed: {e}")
                    
                    try:
                        # Method 3: Use ChromeDriverManager with cache
                        logger.info("Trying with ChromeDriverManager...")
                        os.makedirs('/tmp/chrome_driver_cache', exist_ok=True)
                        service = Service(ChromeDriverManager(cache_folder='/tmp/chrome_driver_cache').install())
                        self.driver = webdriver.Chrome(service=service, options=chrome_options)
                        logger.info("ChromeDriverManager initialization successful")
                    except Exception as e:
                        logger.error(f"ChromeDriverManager initialization failed: {e}")
                        
                        # Final fallback
                        logger.info("Trying system ChromeDriver path...")
                        service = Service('/usr/bin/chromedriver')  # Default path in some Linux environments
                        self.driver = webdriver.Chrome(service=service, options=chrome_options)
                        logger.info("System path ChromeDriver initialization successful")

            # Set page load timeout to 30 seconds
            self.driver.set_page_load_timeout(30)

            # Set implicit wait to 10 seconds
            self.driver.implicitly_wait(10)

            # Execute CDP commands to modify navigator properties
            self.driver.execute_cdp_cmd(
                'Network.setUserAgentOverride', {
                    "userAgent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'})

            # Remove webdriver property
            self.driver.execute_script(
                "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

            logger.info("WebDriver setup complete")

        except Exception as e:
            self.log(f"Error setting up WebDriver: {e}")
            raise

    def random_sleep(self, min_seconds: float = 1.0, max_seconds: float = 3.0):
        """Sleep for a random amount of time to mimic human behavior"""
        time.sleep(random.uniform(min_seconds, max_seconds))

    def scroll_to_element(self, element):
        """Scroll element into view with a natural scrolling behavior"""
        try:
            self.driver.execute_script(
                "arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element)
            self.random_sleep(0.5, 1.5)
        except Exception as e:
            self.log(f"Error scrolling to element: {e}")

    def scroll_page(self, scroll_count: int = 5):
        """Scroll down the page gradually with random pauses"""
        self.log(f"Scrolling page {scroll_count} times...")

        # Get initial page height
        last_height = self.driver.execute_script(
            "return document.body.scrollHeight")

        for i in range(scroll_count):
            # Calculate a random scroll amount (between 300-800 pixels)
            scroll_amount = random.randint(300, 800)
            self.driver.execute_script(f"window.scrollBy(0, {scroll_amount});")

            # Random pause between scrolls
            self.random_sleep(0.7, 2.0)

            # Every other scroll, check if we need to click "Show more" buttons
            if i % 2 == 0:
                self.expand_sections()

        # Final scroll to bottom to ensure everything is loaded
        self.driver.execute_script(
            "window.scrollTo(0, document.body.scrollHeight);")
        self.random_sleep()

    def expand_sections(self):
        """Expand all collapsible sections in the profile"""
        try:
            # List of common "Show more" button selectors
            show_more_selectors = [
                "button.inline-show-more-text__button",
                "button.pv-profile-section__see-more-inline",
                "button.pv-profile-section__card-action-bar",
                ".pv-experience-section__see-more",
                ".pv-education-section__see-more",
                ".pv-skills-section__additional-skills",
                "button.show-more-less-button",
                "button[aria-label*='more']",
                "button[aria-label*='Show']"
            ]

            for selector in show_more_selectors:
                try:
                    # Find all "Show more" buttons
                    buttons = self.driver.find_elements(
                        By.CSS_SELECTOR, selector)

                    for button in buttons:
                        try:
                            if button.is_displayed() and button.is_enabled():
                                # Scroll button into view with offset
                                self.driver.execute_script(
                                    "arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", button)
                                self.random_sleep(0.5, 1.0)

                                # Click with human-like behavior
                                self.click_element_with_random_delay(button)
                                self.random_sleep(1, 2)
                        except Exception as e:
                            self.log(
                                f"Error clicking individual show more button: {str(e)}", level="DEBUG")
                            continue

                except Exception as e:
                    self.log(
                        f"Error finding show more buttons for selector {selector}: {str(e)}", level="DEBUG")
                    continue

        except Exception as e:
            self.log(f"Error expanding sections: {str(e)}", level="WARNING")

    def login_to_linkedin(self) -> bool:
        """Log in to LinkedIn with enhanced anti-detection measures"""
        try:
            self.log("Attempting to log in to LinkedIn...")

            # Navigate to login page with random timing
            self.driver.get("https://www.linkedin.com/login")
            self.random_sleep(2, 4)

            # Check if we're already logged in
            if "feed" in self.driver.current_url:
                self.log("Already logged in to LinkedIn")
                return True

            # Get credentials from environment
            email = os.getenv("LINKEDIN_EMAIL")
            password = os.getenv("LINKEDIN_PASSWORD")

            if not email or not password:
                self.log(
                    "LinkedIn credentials not found in environment variables",
                    level="ERROR")
                return False

            # Find login form elements
            try:
                email_field = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.ID, "username"))
                )
                password_field = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.ID, "password"))
                )
            except TimeoutException:
                self.log(
                    "Timeout waiting for login form elements",
                    level="ERROR")
                self.save_screenshot("login_form_timeout.png")
                return False

            # Clear fields and type credentials with human-like behavior
            email_field.clear()
            self.random_sleep(0.5, 1.0)
            self.type_like_human(email_field, email)
            self.random_sleep(0.8, 1.5)

            password_field.clear()
            self.random_sleep(0.5, 1.0)
            self.type_like_human(password_field, password)
            self.random_sleep(0.8, 1.5)

            # Find and click sign in button with human-like behavior
            try:
                sign_in_button = WebDriverWait(
                    self.driver, 10).until(
                    EC.element_to_be_clickable(
                        (By.CSS_SELECTOR, "button[type='submit']")))
                self.click_element_with_random_delay(sign_in_button)
            except TimeoutException:
                self.log("Timeout waiting for sign in button", level="ERROR")
                self.save_screenshot("signin_button_timeout.png")
                return False

            # Wait for login to complete with extended timeout
            self.random_sleep(3, 5)

            # Check for login challenges
            if not self.handle_login_challenges():
                self.log(
                    "Login challenge detected, may require manual intervention",
                    level="WARNING")
                return False

            # First try with 60 second timeout
            try:
                self.log("Attempting login verification with 60 second timeout...")
                WebDriverWait(self.driver, 60).until(
                    EC.any_of(
                        EC.url_contains("/feed"),
                        EC.presence_of_element_located((By.CSS_SELECTOR, "nav.global-nav")),
                        EC.presence_of_element_located((By.CSS_SELECTOR, ".global-nav__me")),
                        EC.presence_of_element_located((By.CSS_SELECTOR, ".search-global-typeahead"))
                    )
                )
                self.log("Successfully logged in to LinkedIn")
                return True
            except TimeoutException:
                self.log(
                    "Initial login verification taking longer than 60 seconds, falling back to 30 second timeout...")

                # If 60 second timeout fails, try again with 30 second timeout
                try:
                    WebDriverWait(self.driver, 30).until(
                        EC.any_of(
                            EC.url_contains("/feed"),
                            EC.presence_of_element_located((By.CSS_SELECTOR, "nav.global-nav")),
                            EC.presence_of_element_located((By.CSS_SELECTOR, ".global-nav__me")),
                            EC.presence_of_element_located((By.CSS_SELECTOR, ".search-global-typeahead"))
                        )
                    )
                    self.log(
                        "Successfully logged in to LinkedIn after fallback timeout")
                    return True
                except TimeoutException:
                    self.log(
                        "Login verification timeout after 30 seconds - login may have failed",
                        level="ERROR")
                    self.save_screenshot("login_verification_timeout.png")
                    return False
        except TimeoutException:
            self.log(
                "Login verification timeout after 30 seconds - login may have failed",
                level="ERROR")
            self.save_screenshot("login_verification_timeout.png")
            return False
        except Exception as e:
            self.log(f"Error during login process: {str(e)}", level="ERROR")
            self.log(f"Stack trace: {traceback.format_exc()}", level="DEBUG")
            self.save_screenshot("login_error.png")
            return False

    def is_logged_in(self) -> bool:
        """Check if we're logged in to LinkedIn"""
        # Check for common elements that indicate we're logged in
        try:
            # Method 1: Check for the avatar/profile indicator
            try:
                return self.driver.find_element(
                    By.CSS_SELECTOR, ".global-nav__me").is_displayed()
            except BaseException:
                pass

            # Method 2: Check for feed-related elements
            try:
                return self.driver.find_element(
                    By.ID, "global-nav").is_displayed()
            except BaseException:
                pass

            # Method 3: Check URL patterns
            current_url = self.driver.current_url
            return ("feed" in current_url or
                    "/in/" in current_url or
                    "mynetwork" in current_url)
        except BaseException:
            return False

    def navigate_to_profile(self, profile_url: str) -> bool:
        """Navigate to a LinkedIn profile with enhanced anti-detection measures"""
        try:
            self.log(f"Navigating to profile: {profile_url}")

            # Add random timing before navigation
            self.random_sleep(2, 4)

            # Navigate to the profile
            self.driver.get(profile_url)

            # Initial wait for page load
            self.random_sleep(3, 5)

            # Check for profile view challenges
            if not self.handle_profile_view_challenges():
                return False

            # Wait for key profile elements with extended timeout
            try:
                # Wait for any of these elements to confirm profile load
                WebDriverWait(self.driver, 30).until(
                    EC.any_of(
                        EC.presence_of_element_located((By.CSS_SELECTOR, ".pv-top-card")),
                        EC.presence_of_element_located((By.CSS_SELECTOR, ".profile-photo-edit__preview")),
                        EC.presence_of_element_located((By.CSS_SELECTOR, ".pv-text-details__left-panel")),
                        EC.presence_of_element_located((By.CSS_SELECTOR, ".pv-profile-section"))
                    )
                )
            except TimeoutException:
                self.log(
                    "Timeout waiting for profile page to load",
                    level="ERROR")
                self.save_screenshot("profile_load_timeout.png")
                return False

            # Perform human-like scrolling to load dynamic content
            self.human_like_scroll()

            # Expand all sections
            self.expand_sections()

            # Final verification
            if "linkedin.com/in/" not in self.driver.current_url:
                self.log("Not on a valid LinkedIn profile page", level="ERROR")
                return False

            self.log("Successfully navigated to profile")
            return True

        except Exception as e:
            self.log(f"Error navigating to profile: {str(e)}", level="ERROR")
            self.log(f"Stack trace: {traceback.format_exc()}", level="DEBUG")
            self.save_screenshot("profile_navigation_error.png")
            return False

    def extract_profile_data(self) -> Dict[str, Any]:
        """Extract profile data with enhanced error handling and logging"""
        try:
            self.log("Starting profile data extraction...")

            # Initialize profile data structure
            profile_data = {
                "basic_info": {},
                "about": "",
                "experience": [],
                "education": [],
                "skills": [],
                "projects": [],
                "certifications": [],
                "last_updated": datetime.now().isoformat()
            }

            # Extract each section with detailed error handling
            try:
                profile_data["basic_info"] = self.extract_basic_info()
            except Exception as e:
                self.log(
                    f"Error extracting basic info: {str(e)}", level="WARNING")
                self.save_screenshot("basic_info_error.png")

            try:
                profile_data["about"] = self.extract_about_section()
            except Exception as e:
                self.log(
                    f"Error extracting about section: {str(e)}", level="WARNING")

            try:
                profile_data["experience"] = self.extract_experience()
            except Exception as e:
                self.log(
                    f"Error extracting experience: {str(e)}", level="WARNING")
                self.save_screenshot("experience_error.png")

            try:
                profile_data["education"] = self.extract_education()
            except Exception as e:
                self.log(
                    f"Error extracting education: {str(e)}", level="WARNING")

            try:
                profile_data["skills"] = self.extract_skills()
            except Exception as e:
                self.log(f"Error extracting skills: {str(e)}", level="WARNING")

            try:
                profile_data["projects"] = self.extract_projects()
            except Exception as e:
                self.log(
                    f"Error extracting projects: {str(e)}", level="WARNING")

            try:
                profile_data["certifications"] = self.extract_certifications()
            except Exception as e:
                self.log(
                    f"Error extracting certifications: {str(e)}", level="WARNING")

            # Validate extracted data
            if not self.validate_profile_data(profile_data):
                self.log(
                    "Warning: Extracted profile data may be incomplete",
                    level="WARNING")

            self.log("Profile data extraction completed")
            return profile_data

        except Exception as e:
            self.log(
                f"Critical error during profile data extraction: {str(e)}", level="ERROR")
            self.log(f"Stack trace: {traceback.format_exc()}", level="DEBUG")
            self.save_screenshot("profile_extraction_error.png")
            return self.get_fallback_profile_data(str(e))

    def validate_profile_data(self, profile_data: Dict[str, Any]) -> bool:
        """Validate the extracted profile data for completeness"""
        try:
            # Check basic info
            if not profile_data.get("basic_info", {}).get("name"):
                self.log("Warning: Basic info missing name", level="WARNING")
                return False

            # Check for minimum required sections
            required_sections = ["experience", "education", "skills"]
            for section in required_sections:
                if not profile_data.get(section):
                    self.log(
                        f"Warning: Missing or empty section: {section}",
                        level="WARNING")
                    return False

            # Validate experience entries
            for exp in profile_data.get("experience", []):
                if not exp.get("title") or not exp.get("company"):
                    self.log(
                        "Warning: Experience entry missing title or company",
                        level="WARNING")
                    return False

            # Validate education entries
            for edu in profile_data.get("education", []):
                if not edu.get("school"):
                    self.log(
                        "Warning: Education entry missing school name",
                        level="WARNING")
                    return False

            return True

        except Exception as e:
            self.log(
                f"Error validating profile data: {str(e)}", level="WARNING")
            return False

    def extract_basic_info(self) -> Dict[str, str]:
        """Extract basic profile information with enhanced error handling"""
        self.log("Extracting basic info...")
        basic_info = {
            "name": "",
            "headline": "",
            "location": "",
            "profile_image": "",
            "profile_url": self.driver.current_url
        }

        try:
            # Wait for the top card section
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "pv-top-card"))
            )

            # Extract name with fallback selectors
            name_selectors = [
                "h1.text-heading-xlarge",
                ".pv-text-details__left-panel h1",
                ".pv-top-card--list li.inline"
            ]
            for selector in name_selectors:
                try:
                    name_element = self.driver.find_element(
                        By.CSS_SELECTOR, selector)
                    if name_element.text.strip():
                        basic_info["name"] = name_element.text.strip()
                        break
                except BaseException:
                    continue

            # Extract headline with fallback selectors
            headline_selectors = [
                ".pv-text-details__left-panel .text-body-medium",
                ".ph5 .text-body-medium",
                ".pv-top-card .text-body-medium"
            ]
            for selector in headline_selectors:
                try:
                    headline_element = self.driver.find_element(
                        By.CSS_SELECTOR, selector)
                    if headline_element.text.strip():
                        basic_info["headline"] = headline_element.text.strip()
                        break
                except BaseException:
                    continue

            # Extract location with fallback selectors
            location_selectors = [
                ".pv-text-details__left-panel .text-body-small:not(.inline)",
                ".ph5 .text-body-small.mt2",
                ".pv-top-card .text-body-small"
            ]
            for selector in location_selectors:
                try:
                    location_element = self.driver.find_element(
                        By.CSS_SELECTOR, selector)
                    if location_element.text.strip():
                        basic_info["location"] = location_element.text.strip()
                        break
                except BaseException:
                    continue

            # Extract profile image with fallback selectors
            image_selectors = [
                "img.pv-top-card-profile-picture__image",
                "img.profile-photo-edit__preview",
                ".pv-top-card .presence-entity__image"
            ]
            for selector in image_selectors:
                try:
                    image_element = self.driver.find_element(
                        By.CSS_SELECTOR, selector)
                    image_url = image_element.get_attribute("src")
                    if image_url:
                        basic_info["profile_image"] = image_url
                        break
                except BaseException:
                    continue

            # Validate extracted data
            if not basic_info["name"]:
                self.log("Warning: Could not extract name", level="WARNING")
            if not basic_info["headline"]:
                self.log(
                    "Warning: Could not extract headline",
                    level="WARNING")
            if not basic_info["location"]:
                self.log(
                    "Warning: Could not extract location",
                    level="WARNING")
            if not basic_info["profile_image"]:
                self.log(
                    "Warning: Could not extract profile image",
                    level="WARNING")

            return basic_info

        except Exception as e:
            self.log(f"Error extracting basic info: {str(e)}", level="ERROR")
            self.save_screenshot("basic_info_error.png")
            return basic_info

    def extract_about_section(self) -> str:
        """Extract about section with enhanced error handling"""
        self.log("Extracting about section...")
        try:
            # Wait for about section with timeout
            about_selectors = [
                "#about",
                ".pv-about-section",
                ".pv-about__summary-text",
                "[data-section='summary']"
            ]

            about_text = ""
            for selector in about_selectors:
                try:
                    about_element = WebDriverWait(
                        self.driver, 5).until(
                        EC.presence_of_element_located(
                            (By.CSS_SELECTOR, selector)))

                    # Try to expand the section if possible
                    try:
                        show_more = about_element.find_element(
                            By.CSS_SELECTOR, "button.inline-show-more-text__button")
                        if show_more.is_displayed():
                            self.click_element_with_random_delay(show_more)
                            self.random_sleep(1, 2)
                    except BaseException:
                        pass

                    # Get the text content
                    about_text = about_element.text.strip()
                    if about_text and "..." not in about_text:
                        break
                except BaseException:
                    continue

            return about_text

        except Exception as e:
            self.log(
                f"Error extracting about section: {str(e)}", level="WARNING")
            return ""

    def extract_experience(self) -> List[Dict[str, str]]:
        """Extract experience section with enhanced error handling"""
        self.log("Extracting experience section...")
        experience_list = []

        try:
            # Wait for experience section
            experience_section = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "experience"))
            )

            # Scroll to experience section
            self.driver.execute_script(
                "arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});",
                experience_section)
            self.random_sleep(1, 2)

            # Try to expand all experience entries
            try:
                show_more_buttons = self.driver.find_elements(
                    By.CSS_SELECTOR, ".experiences-section button.pv-profile-section__see-more-inline")
                for button in show_more_buttons:
                    if button.is_displayed():
                        self.click_element_with_random_delay(button)
                        self.random_sleep(1, 2)
            except BaseException:
                pass

            # Find all experience entries
            experience_entries = self.driver.find_elements(
                By.CSS_SELECTOR,
                ".experience-section .pv-entity__position-group, .experience-section .pv-profile-section__card-item")

            for entry in experience_entries:
                try:
                    experience_data = {
                        "title": "",
                        "company": "",
                        "duration": "",
                        "location": "",
                        "description": ""
                    }

                    # Extract title
                    try:
                        title_element = entry.find_element(
                            By.CSS_SELECTOR, ".pv-entity__summary-info h3")
                        experience_data["title"] = title_element.text.strip()
                    except BaseException:
                        pass

                    # Extract company
                    try:
                        company_element = entry.find_element(
                            By.CSS_SELECTOR, ".pv-entity__secondary-title")
                        experience_data["company"] = company_element.text.strip()
                    except BaseException:
                        pass

                    # Extract duration
                    try:
                        duration_element = entry.find_element(
                            By.CSS_SELECTOR, ".pv-entity__date-range span:not(.visually-hidden)")
                        experience_data["duration"] = duration_element.text.strip(
                        )
                    except BaseException:
                        pass

                    # Extract location
                    try:
                        location_element = entry.find_element(
                            By.CSS_SELECTOR, ".pv-entity__location span:not(.visually-hidden)")
                        experience_data["location"] = location_element.text.strip(
                        )
                    except BaseException:
                        pass

                    # Extract description
                    try:
                        description_element = entry.find_element(
                            By.CSS_SELECTOR, ".pv-entity__description")
                        experience_data["description"] = description_element.text.strip(
                        )
                    except BaseException:
                        pass

                    # Only add entries that have at least title and company
                    if experience_data["title"] and experience_data["company"]:
                        experience_list.append(experience_data)

                except Exception as e:
                    self.log(
                        f"Error extracting individual experience entry: {str(e)}", level="DEBUG")
                    continue

            return experience_list

        except Exception as e:
            self.log(
                f"Error extracting experience section: {str(e)}", level="WARNING")
            self.save_screenshot("experience_error.png")
            return []

    def extract_education(self) -> List[Dict[str, str]]:
        """Extract education section with enhanced error handling"""
        self.log("Extracting education section...")
        education_list = []

        try:
            # Wait for education section
            education_section = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "education"))
            )

            # Scroll to education section
            self.driver.execute_script(
                "arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});",
                education_section)
            self.random_sleep(1, 2)

            # Try to expand all education entries
            try:
                show_more_buttons = self.driver.find_elements(
                    By.CSS_SELECTOR, ".education-section button.pv-profile-section__see-more-inline")
                for button in show_more_buttons:
                    if button.is_displayed():
                        self.click_element_with_random_delay(button)
                        self.random_sleep(1, 2)
            except BaseException:
                pass

            # Find all education entries
            education_entries = self.driver.find_elements(
                By.CSS_SELECTOR, ".education-section .pv-profile-section__list-item")

            for entry in education_entries:
                try:
                    education_data = {
                        "school": "",
                        "degree": "",
                        "field_of_study": "",
                        "date_range": "",
                        "description": ""
                    }

                    # Extract school name
                    try:
                        school_element = entry.find_element(
                            By.CSS_SELECTOR, ".pv-entity__school-name")
                        education_data["school"] = school_element.text.strip()
                    except BaseException:
                        pass

                    # Extract degree
                    try:
                        degree_element = entry.find_element(
                            By.CSS_SELECTOR, ".pv-entity__degree-name .pv-entity__comma-item")
                        education_data["degree"] = degree_element.text.strip()
                    except BaseException:
                        pass

                    # Extract field of study
                    try:
                        field_element = entry.find_element(
                            By.CSS_SELECTOR, ".pv-entity__fos .pv-entity__comma-item")
                        education_data["field_of_study"] = field_element.text.strip(
                        )
                    except BaseException:
                        pass

                    # Extract date range
                    try:
                        date_element = entry.find_element(
                            By.CSS_SELECTOR, ".pv-entity__dates time")
                        education_data["date_range"] = date_element.text.strip()
                    except BaseException:
                        pass

                    # Extract description
                    try:
                        desc_element = entry.find_element(
                            By.CSS_SELECTOR, ".pv-entity__description")
                        education_data["description"] = desc_element.text.strip()
                    except BaseException:
                        pass

                    # Only add entries that have at least a school name
                    if education_data["school"]:
                        education_list.append(education_data)

                except Exception as e:
                    self.log(
                        f"Error extracting individual education entry: {str(e)}", level="DEBUG")
                    continue

            return education_list

        except Exception as e:
            self.log(
                f"Error extracting education section: {str(e)}", level="WARNING")
            self.save_screenshot("education_error.png")
            return []

    def extract_skills(self) -> List[Dict[str, Any]]:
        """Extract skills section with enhanced error handling"""
        self.log("Extracting skills section...")
        skills_list = []

        try:
            # Wait for skills section
            skills_section = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "skills"))
            )

            # Scroll to skills section
            self.driver.execute_script(
                "arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});",
                skills_section)
            self.random_sleep(1, 2)

            # Try to expand skills section
            try:
                show_more_buttons = self.driver.find_elements(
                    By.CSS_SELECTOR,
                    ".skills-section button.pv-skills-section__additional-skills, " +
                    "button.pv-profile-section__card-action-bar")
                for button in show_more_buttons:
                    if button.is_displayed():
                        self.click_element_with_random_delay(button)
                        self.random_sleep(1, 2)
            except BaseException:
                pass

            # Find all skill entries
            skill_entries = self.driver.find_elements(
                By.CSS_SELECTOR,
                ".pv-skill-category-entity__skill-wrapper, " +
                ".pv-skill-category-entity")

            for entry in skill_entries:
                try:
                    skill_data = {
                        "name": "",
                        "endorsements": 0,
                        "category": ""
                    }

                    # Extract skill name
                    try:
                        name_element = entry.find_element(
                            By.CSS_SELECTOR,
                            ".pv-skill-category-entity__name-text, " +
                            ".pv-skill-category-entity__skill-wrapper span")
                        skill_data["name"] = name_element.text.strip()
                    except BaseException:
                        continue

                    # Extract endorsements
                    try:
                        endorsement_element = entry.find_element(
                            By.CSS_SELECTOR, ".pv-skill-category-entity__endorsement-count, " + ".t-bold")
                        endorsements_text = endorsement_element.text.strip()
                        skill_data["endorsements"] = int(
                            endorsements_text) if endorsements_text.isdigit() else 0
                    except BaseException:
                        pass

                    # Extract category if available
                    try:
                        category_element = entry.find_element(
                            By.CSS_SELECTOR, ".pv-skill-category-entity__category-info")
                        skill_data["category"] = category_element.text.strip()
                    except BaseException:
                        pass

                    # Only add skills that have a name
                    if skill_data["name"]:
                        skills_list.append(skill_data)

                except Exception as e:
                    self.log(
                        f"Error extracting individual skill: {str(e)}", level="DEBUG")
                    continue

            return skills_list

        except Exception as e:
            self.log(
                f"Error extracting skills section: {str(e)}", level="WARNING")
            self.save_screenshot("skills_error.png")
            return []

    def extract_projects(self) -> List[Dict[str, str]]:
        """Extract projects section data"""
        projects_list = []
        try:
            # Find the projects section
            projects_section = self.driver.find_element(By.ID, "projects")
            self.scroll_to_element(projects_section)

            # Find all project entries
            project_entries = projects_section.find_elements(
                By.CLASS_NAME, "project-entry")

            for entry in project_entries:
                try:
                    project_data = {
                        "name": entry.find_element(
                            By.CLASS_NAME,
                            "project-title").text,
                        "description": entry.find_element(
                            By.CLASS_NAME,
                            "project-description").text,
                        "date": entry.find_element(
                            By.CLASS_NAME,
                            "project-date").text,
                        "url": entry.find_element(
                            By.CLASS_NAME,
                            "project-url").get_attribute("href")}

                    if project_data["name"]:
                        projects_list.append(project_data)
                except Exception as e:
                    self.log(
                        f"Error extracting individual project: {str(e)}", level="DEBUG")
                    continue

            return projects_list
        except Exception as e:
            self.log(
                f"Error extracting projects section: {str(e)}", level="ERROR")
            return projects_list

    def extract_certifications(self) -> List[Dict[str, str]]:
        """Extract certifications section with enhanced error handling"""
        self.log("Extracting certifications section...")
        certifications_list = []

        try:
            # Wait for certifications section
            try:
                certifications_section = WebDriverWait(
                    self.driver, 10).until(
                    EC.presence_of_element_located(
                        (By.CSS_SELECTOR, "#certifications, section.certifications-section")))

                # Scroll to certifications section
                self.driver.execute_script(
                    "arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});",
                    certifications_section)
                self.random_sleep(1, 2)
            except TimeoutException:
                self.log("Certifications section not found", level="INFO")
                return certifications_list

            # Try to expand all certification entries
            try:
                show_more_buttons = self.driver.find_elements(
                    By.CSS_SELECTOR,
                    ".certifications-section button.pv-profile-section__see-more-inline")
                for button in show_more_buttons:
                    if button.is_displayed():
                        self.click_element_with_random_delay(button)
                        self.random_sleep(1, 2)
            except BaseException:
                pass

            # Find all certification entries
            certification_entries = self.driver.find_elements(
                By.CSS_SELECTOR, ".certifications-section .pv-certification-entity")

            for entry in certification_entries:
                try:
                    certification_data = {
                        "name": "",
                        "organization": "",
                        "issue_date": "",
                        "expiration_date": "",
                        "credential_id": "",
                        "credential_url": ""
                    }

                    # Extract certification name
                    try:
                        name_element = entry.find_element(
                            By.CSS_SELECTOR, ".pv-entity__title")
                        certification_data["name"] = name_element.text.strip()
                    except BaseException:
                        continue

                    # Extract organization
                    try:
                        org_element = entry.find_element(
                            By.CSS_SELECTOR, ".pv-entity__subtitle")
                        certification_data["organization"] = org_element.text.strip(
                        )
                    except BaseException:
                        pass

                    # Extract issue date
                    try:
                        issue_date_element = entry.find_element(
                            By.CSS_SELECTOR, ".pv-entity__date-range time")
                        certification_data["issue_date"] = issue_date_element.text.strip(
                        )
                    except BaseException:
                        pass

                    # Extract credential ID
                    try:
                        cred_id_element = entry.find_element(
                            By.CSS_SELECTOR, ".pv-entity__credential-id")
                        certification_data["credential_id"] = cred_id_element.text.replace(
                            "Credential ID", "").strip()
                    except BaseException:
                        pass

                    # Extract credential URL
                    try:
                        url_element = entry.find_element(
                            By.CSS_SELECTOR, ".pv-entity__credential-url a")
                        certification_data["credential_url"] = url_element.get_attribute(
                            "href")
                    except BaseException:
                        pass

                    # Only add certifications that have a name
                    if certification_data["name"]:
                        certifications_list.append(certification_data)

                except Exception as e:
                    self.log(
                        f"Error extracting individual certification: {str(e)}", level="DEBUG")
                    continue

            return certifications_list

        except Exception as e:
            self.log(
                f"Error extracting certifications section: {str(e)}", level="WARNING")
            self.save_screenshot("certifications_error.png")
            return []

    def save_data_to_file(
            self, data: Dict[str, Any], output_file: str = OUTPUT_FILE):
        """Save the extracted data to a JSON file"""
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(output_file), exist_ok=True)

            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            self.log(f"Data successfully saved to {output_file}")
            return True
        except Exception as e:
            self.log(f"Error saving data to file: {e}")
            return False

    def scrape(
            self, profile_url: str = LINKEDIN_PROFILE_URL) -> Dict[str, Any]:
        """Main scraping function that coordinates the entire process"""
        try:
            # Initialize notification helper and add debug log
            print("\n=== Starting LinkedIn Profile Scrape ===")
            print("Sending start notification...")

            # Notify scraping start
            self.notifier.notify_scrape_start(profile_url)
            print("✅ Start notification sent")

            # Login to LinkedIn
            if not self.login_to_linkedin():
                error_msg = "Failed to login to LinkedIn"
                self.log(error_msg, level="ERROR")
                print("Sending error notification...")
                self.notifier.notify_scrape_error(error_msg)
                print("✅ Error notification sent")
                return self.get_fallback_profile_data(error_msg)

            # Navigate to the profile
            if not self.navigate_to_profile(profile_url):
                error_msg = "Failed to navigate to profile"
                self.log(error_msg, level="ERROR")
                print("Sending error notification...")
                self.notifier.notify_scrape_error(error_msg)
                print("✅ Error notification sent")
                return self.get_fallback_profile_data(error_msg)

            # Extract profile data
            try:
                profile_data = self.extract_profile_data()

                # Check if this is fallback data
                is_fallback = "_scrape_info" in profile_data and "FALLBACK DATA" in profile_data[
                    "_scrape_info"]

                if not is_fallback:
                    # Only save to file if it's not fallback data
                    self.save_data_to_file(profile_data)
                    self.log("Profile data saved to file")
                else:
                    self.log(
                        "Using fallback data - skipping file save to preserve manual edits",
                        level="WARNING")

                # Notify success
                print("Sending success notification...")
                self.notifier.notify_scrape_success(
                    profile_data.get("basic_info", {}).get("name", "Unknown"),
                    is_fallback
                )
                print("✅ Success notification sent")

                return profile_data

            except Exception as e:
                error_msg = f"Error during data extraction: {e}"
                self.log(error_msg, level="ERROR")
                self.log(traceback.format_exc(), level="DEBUG")
                print("Sending error notification...")
                self.notifier.notify_scrape_error(error_msg)
                print("✅ Error notification sent")
                return self.get_fallback_profile_data(
                    f"Error during scraping: {str(e)}")

        except Exception as e:
            error_msg = f"Critical error in scrape function: {e}"
            self.log(error_msg, level="ERROR")
            self.log(traceback.format_exc(), level="DEBUG")
            print("Sending error notification...")
            self.notifier.notify_scrape_error(error_msg)
            print("✅ Error notification sent")
            return self.get_fallback_profile_data(f"Critical error: {str(e)}")
        finally:
            # Always close the browser
            if self.driver:
                try:
                    self.driver.quit()
                    self.log("Browser closed successfully")
                except Exception as e:
                    self.log(f"Error closing browser: {e}", level="WARNING")

    def handle_profile_view_challenges(self) -> bool:
        """Handle challenges that might appear when viewing a profile"""
        try:
            # Check for "This profile is not available" message
            try:
                not_available = self.driver.find_element(
                    By.XPATH, "//h2[contains(text(), 'This profile is not available')]")
                if not_available.is_displayed():
                    self.log(
                        "Profile is not available - likely requires login or is restricted",
                        level="ERROR")
                    return False
            except BaseException:
                pass

            # Check for "You're out of weekly commercial use limit" message
            try:
                limit_reached = self.driver.find_element(
                    By.XPATH,
                    "//h2[contains(text(), 'commercial use limit')] | //p[contains(text(), 'commercial use limit')]")
                if limit_reached.is_displayed():
                    self.log("Commercial use limit reached", level="ERROR")
                    return False
            except BaseException:
                pass

            # Check for "Security Verification" or similar challenges
            security_selectors = [
                "//div[contains(text(), 'Security Verification')]",
                "//div[contains(text(), 'security check')]",
                "//div[contains(text(), 'verify')]",
                "//div[contains(text(), 'challenge')]",
                "//div[contains(text(), 'unusual activity')]"
            ]

            for selector in security_selectors:
                try:
                    element = self.driver.find_element(By.XPATH, selector)
                    if element.is_displayed():
                        self.log(
                            f"Security challenge detected: {selector}",
                            level="WARNING")
                        self.save_screenshot("security_challenge.png")
                        return False
                except BaseException:
                    continue

            return True

        except Exception as e:
            self.log(
                f"Error checking for profile view challenges: {e}",
                level="WARNING")
            return False

    def handle_login_challenges(self) -> bool:
        """Handle potential login challenges such as captcha or verification"""
        try:
            # Check for common challenge/verification screens
            challenge_indicators = [
                (By.ID, "captcha-challenge"),
                (By.ID, "captcha-internal"),
                (By.ID, "challenge-heading"),
                (By.ID, "error-for-password"),
                (By.ID, "error-for-username"),
                (By.CSS_SELECTOR, ".challenge-dialog"),
                (By.CSS_SELECTOR, ".secondary-action"),
                (By.CSS_SELECTOR, ".captcha-challenge"),
                (By.XPATH, "//p[contains(text(), 'verification')]"),
                (By.XPATH, "//p[contains(text(), 'confirm')]"),
                (By.XPATH, "//p[contains(text(), 'unusual')]"),
                (By.XPATH, "//p[contains(text(), 'suspicious')]"),
                (By.XPATH, "//h2[contains(text(), 'security')]"),
                (By.XPATH, "//h2[contains(text(), 'verify')]")
            ]

            for indicator in challenge_indicators:
                try:
                    if self.driver.find_element(*indicator).is_displayed():
                        self.log(
                            f"Login challenge detected: {indicator}",
                            level="WARNING")
                        self.save_screenshot("login_challenge.png")

                        # If we detect a challenge, we need human intervention or a sophisticated approach
                        # For now, we'll just wait longer and hope the
                        # challenge resolves automatically
                        self.random_sleep(10, 15)
                        return False
                except BaseException:
                    continue

            # If we don't detect any challenges, assume everything is fine
            return True

        except Exception as e:
            self.log(
                f"Error checking for login challenges: {e}",
                level="WARNING")
            return False

    def type_like_human(self, element, text: str):
        """Type text into an element with human-like variations in timing"""
        try:
            for char in text:
                # Base delay for each character
                base_delay = random.uniform(0.05, 0.25)

                # Add occasional longer pauses
                if random.random() < 0.1:  # 10% chance for a longer pause
                    base_delay += random.uniform(0.1, 0.5)

                # Add occasional "typing error" and correction
                if random.random() < 0.02 and char != ' ':  # 2% chance for typo
                    # Type a random character
                    # Random lowercase letter
                    wrong_char = chr(random.randint(97, 122))
                    element.send_keys(wrong_char)
                    self.random_sleep(0.1, 0.3)

                    # Delete the wrong character
                    element.send_keys("\b")
                    self.random_sleep(0.1, 0.3)

                # Send the correct character
                element.send_keys(char)
                time.sleep(base_delay)

                # Add occasional pause as if "thinking"
                if random.random() < 0.05:  # 5% chance for a thinking pause
                    self.random_sleep(0.3, 1.0)
        except Exception as e:
            self.log(f"Error during human-like typing: {e}", level="WARNING")
            # Fall back to regular send_keys
            element.clear()
            element.send_keys(text)

    def click_element_with_random_delay(self, element):
        """Click an element with a random delay to simulate human behavior"""
        try:
            # Move mouse to the element with random offset
            actions = ActionChains(self.driver)

            # Calculate a random offset within the element
            x_offset = random.randint(5, 10)
            y_offset = random.randint(5, 10)

            # Move to element with offset
            actions.move_to_element_with_offset(element, x_offset, y_offset)

            # Optional: add a small random pause before clicking
            if random.random() < 0.3:  # 30% chance for a pause
                actions.pause(random.uniform(0.1, 0.5))

            # Perform click
            actions.click()
            actions.perform()

        except Exception as e:
            self.log(f"Error during human-like click: {e}", level="WARNING")
            # Fall back to regular click
            element.click()

    def human_like_scroll(self, scroll_count: int = 5):
        """Perform human-like scrolling with random acceleration and deceleration"""
        self.log(
            f"Performing human-like scrolling ({scroll_count} iterations)...")

        # Get initial page height
        last_height = self.driver.execute_script(
            "return document.body.scrollHeight")

        for i in range(scroll_count):
            # Get the current scroll position
            current_position = self.driver.execute_script(
                "return window.pageYOffset;")

            # Calculate a random scroll target (between 300-800 pixels)
            scroll_target = current_position + random.randint(300, 800)

            # Scroll in smaller increments to simulate human behavior
            # Number of small scrolls to make
            increments = random.randint(5, 15)

            # Calculate increment size with some randomness
            increment_size = (scroll_target - current_position) / increments

            for j in range(increments):
                # Add some random variation to each increment
                variation = random.uniform(-10, 10)
                next_position = current_position + increment_size + variation

                # Ensure we don't scroll beyond the target
                if j == increments - 1:  # Last increment
                    next_position = scroll_target

                self.driver.execute_script(
                    f"window.scrollTo(0, {next_position});")
                current_position = next_position

                # Random pause between small scrolls
                self.random_sleep(0.05, 0.2)

            # Random pause between major scrolls
            self.random_sleep(0.7, 2.0)

            # Every other scroll, check if we need to click "Show more" buttons
            if i % 2 == 0:
                self.expand_sections()

        # Final random scroll to ensure everything is loaded
        final_position = random.uniform(
            0.7, 1.0) * self.driver.execute_script("return document.body.scrollHeight")
        self.driver.execute_script(f"window.scrollTo(0, {final_position});")
        self.random_sleep(1.0, 2.0)

    def navigate_to_section(self, section_name: str) -> bool:
        """Navigate directly to a specific section of the profile"""
        try:
            # Get the base profile URL without any sections
            base_url = self.driver.current_url.split('/details/')[0]

            # Remove any trailing slash
            base_url = base_url.rstrip('/')

            # Construct the section URL
            section_url = f"{base_url}/details/{section_name}/"

            self.log(f"Navigating to section: {section_url}")

            # Navigate to the section
            self.driver.get(section_url)
            self.random_sleep(2, 4)

            # Wait for the section to load
            try:
                WebDriverWait(
                    self.driver, 10).until(
                    EC.presence_of_element_located(
                        (By.CSS_SELECTOR, ".artdeco-card")))
                return True
            except TimeoutException:
                self.log(
                    f"Timeout waiting for {section_name} section to load",
                    level="WARNING")
                return False

        except Exception as e:
            self.log(
                f"Error navigating to {section_name} section: {str(e)}", level="ERROR")
            return False

    def get_fallback_profile_data(self, error_message: str = "Unknown error") -> Dict[str, Any]:
        """Return fallback data with some sample data when scraping fails"""
        self.log(f"Using fallback profile data due to: {error_message}", level="ERROR")

        fallback_data = {
            "_scrape_info": f"FALLBACK DATA (Reason: {error_message})",
            "basic_info": {
                "name": "Bishal Budhathoki",
                "headline": "Full Stack Developer | React | Node.js | Python | AWS",
                "location": "Remote",
                "profile_image": "https://media.licdn.com/dms/image/D5603AQEQy9V9Kp-qTQ/profile-displayphoto-shrink_800_800/0/1678835481599?e=1719446400&v=beta&t=2Wb2gM5f7QZO1lfQQcxMyG3OFqh3bQE99ClGnmGvWr0"
            },
            "about": "Experienced Full Stack Developer with a passion for building web applications using modern technologies.",
            "experience": [
                {
                    "role": "Senior Full Stack Developer",
                    "company": "Tech Innovations Ltd",
                    "date_range": "Jan 2021 - Present",
                    "location": "Remote",
                    "description": "Developing and maintaining web applications using React, Node.js, and AWS."
                }
            ],
            "education": [
                {
                    "school": "University of Computer Science",
                    "degree": "Master of Science in Computer Science",
                    "field_of_study": "Web Development",
                    "date_range": "2014 - 2016"
                }
            ],
            "skills": [
                {"name": "JavaScript", "endorsements": 32},
                {"name": "React.js", "endorsements": 28}
            ],
            "projects": [
                {
                    "name": "E-commerce Platform",
                    "date_range": "Jan 2022 - Jun 2022",
                    "description": "Built a full-featured e-commerce platform using React, Node.js, and MongoDB.",
                    "url": "https://github.com/bishalbudhathoki/ecommerce-platform"
                }
            ],
            "certifications": [
                {
                    "name": "AWS Certified Developer - Associate",
                    "organization": "Amazon Web Services",
                    "issue_date": "Mar 2022",
                    "credential_url": "https://www.credly.com/badges/aws-certified-developer-associate"
                }
            ],
            "last_updated": datetime.now().isoformat()
        }

        # Add categorized skills
        skills_list = [skill["name"] for skill in fallback_data["skills"]]
        fallback_data["skills_by_category"] = self.categorize_skills(skills_list)

        return fallback_data

    def categorize_skills(self, skills: List[str]) -> Dict[str, List[str]]:
        """Categorize skills into different technical areas"""
        categories = {
            "Frontend": [
                "JavaScript", "TypeScript", "React", "Next.js", "HTML", "CSS",
                "Tailwind", "Vue", "Angular", "Redux", "SASS", "LESS", "Bootstrap"
            ],
            "Backend": [
                "Node.js", "Express", "Python", "FastAPI", "Django", "Flask", "Java",
                "Spring", "C#", ".NET", "PHP", "Laravel", "Ruby", "Rails"
            ],
            "Database": [
                "MongoDB", "PostgreSQL", "MySQL", "SQLite", "Oracle", "SQL Server",
                "Redis", "Firebase", "DynamoDB", "GraphQL"
            ],
            "DevOps/Cloud": [
                "Git", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Jenkins",
                "GitHub Actions", "CircleCI", "Terraform", "Ansible"
            ],
            "Other": []  # For skills that don't fit above categories
        }

        categorized = {
            "Frontend": [],
            "Backend": [],
            "Database": [],
            "DevOps/Cloud": [],
            "Other": []
        }

        for skill in skills:
            if any(keyword.lower() in skill.lower()
                   for keyword in categories["Frontend"]):
                categorized["Frontend"].append(skill)
            elif any(keyword.lower() in skill.lower() for keyword in categories["Backend"]):
                categorized["Backend"].append(skill)
            elif any(keyword.lower() in skill.lower() for keyword in categories["Database"]):
                categorized["Database"].append(skill)
            elif any(keyword.lower() in skill.lower() for keyword in categories["DevOps/Cloud"]):
                categorized["DevOps/Cloud"].append(skill)
            else:
                categorized["Other"].append(skill)

        return categorized


async def scrape_linkedin_profile() -> Dict[str, Any]:
    """
    Async wrapper for the LinkedIn scraper to be used with FastAPI
    """
    notifier = NotificationHelper()

    try:
        # Check if credentials are available
        if not LINKEDIN_EMAIL or not LINKEDIN_PASSWORD:
            error_msg = "LinkedIn credentials not found in environment variables. Using fallback data."
            print(error_msg)
            notifier.notify_scrape_error(error_msg)
            # Create a temporary instance just for fallback data
            temp_scraper = LinkedInScraper(headless=True, debug=True)
            return temp_scraper.get_fallback_profile_data(error_msg)

        print("Initializing LinkedIn scraper in headless mode...")
        # Initialize and run the scraper with headless mode and debug enabled
        scraper = LinkedInScraper(headless=True, debug=True)
        print("Starting profile scrape...")
        profile_data = scraper.scrape(LINKEDIN_PROFILE_URL)

        # Check if this is fallback data
        is_fallback = "_scrape_info" in profile_data and "FALLBACK DATA" in profile_data[
            "_scrape_info"]

        # Only add skills categorization and update Google Sheets if not
        # fallback data
        if not is_fallback:
            print("Successfully scraped real profile data")
            # Additional categorization of skills
            if profile_data.get("skills") and len(profile_data["skills"]) > 0:
                print(f"Categorizing {len(profile_data['skills'])} skills...")
                profile_data["skills_by_category"] = scraper.categorize_skills(
                    [skill["name"] for skill in profile_data["skills"]])
                print("Profile data processing complete")
            else:
                print("Using fallback data - skipping additional processing")

        return profile_data

    except Exception as e:
        error_msg = f"Error in scrape_linkedin_profile: {e}"
        print(error_msg)
        notifier.notify_scrape_error(error_msg)
        # Create a temporary instance just for fallback data
        temp_scraper = LinkedInScraper(headless=True, debug=True)
        return temp_scraper.get_fallback_profile_data(
            f"Error in profile scraping: {str(e)}")


# For running the scraper directly (for testing)
if __name__ == "__main__":
    # Make sure we're in the correct directory for relative paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    # Create and run the scraper
    scraper = LinkedInScraper(headless=False, debug=True)
    profile_data = scraper.scrape()

    print(json.dumps(profile_data, indent=2))
