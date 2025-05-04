#!/usr/bin/env python3
"""
Selenium test script to verify ChromeDriver setup.
This script tests if Selenium can initialize a Chrome browser 
and perform basic web interactions, which is needed for LinkedIn scraping.
"""

import os
import sys
import time
import traceback
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_chrome_driver():
    """Test Chrome WebDriver setup with different configurations"""
    print("\n===== Testing Chrome WebDriver Setup =====")
    
    # Method 1: Basic Chrome setup with automatic path resolution
    print("\n🔍 METHOD 1: Basic Chrome setup")
    try:
        options = Options()
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        
        print("Creating Chrome driver...")
        driver = webdriver.Chrome(options=options)
        print("✅ Chrome WebDriver created successfully")
        
        print("Fetching Google.com...")
        driver.get("https://www.google.com")
        print(f"Page title: {driver.title}")
        
        driver.quit()
        print("✅ METHOD 1 PASSED: Basic Chrome setup works")
        return True
    except Exception as e:
        print(f"❌ METHOD 1 FAILED: {e}")
        traceback.print_exc()
    
    # Method 2: Using webdriver_manager for ChromeDriver installation
    print("\n🔍 METHOD 2: Using webdriver_manager")
    try:
        from webdriver_manager.chrome import ChromeDriverManager
        
        options = Options()
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        
        print("Installing ChromeDriver with webdriver_manager...")
        driver_path = ChromeDriverManager().install()
        print(f"ChromeDriver installed at: {driver_path}")
        
        service = Service(driver_path)
        driver = webdriver.Chrome(service=service, options=options)
        print("✅ Chrome WebDriver created successfully with webdriver_manager")
        
        print("Fetching Google.com...")
        driver.get("https://www.google.com")
        print(f"Page title: {driver.title}")
        
        driver.quit()
        print("✅ METHOD 2 PASSED: webdriver_manager setup works")
        return True
    except Exception as e:
        print(f"❌ METHOD 2 FAILED: {e}")
        traceback.print_exc()
    
    # Method 3: Manual path specification (for environments where path is known)
    print("\n🔍 METHOD 3: Manual ChromeDriver path specification")
    try:
        # Try common locations for ChromeDriver
        possible_paths = [
            "/usr/local/bin/chromedriver",
            "/usr/bin/chromedriver",
            "./chromedriver",
            os.path.expanduser("~/.wdm/drivers/chromedriver")
        ]
        
        driver_path = None
        for path in possible_paths:
            if os.path.exists(path):
                driver_path = path
                print(f"Found ChromeDriver at: {driver_path}")
                break
        
        if not driver_path:
            print("❌ ChromeDriver not found in common locations")
            return False
        
        options = Options()
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        
        service = Service(driver_path)
        driver = webdriver.Chrome(service=service, options=options)
        print("✅ Chrome WebDriver created successfully with manual path")
        
        print("Fetching Google.com...")
        driver.get("https://www.google.com")
        print(f"Page title: {driver.title}")
        
        driver.quit()
        print("✅ METHOD 3 PASSED: Manual path specification works")
        return True
    except Exception as e:
        print(f"❌ METHOD 3 FAILED: {e}")
        traceback.print_exc()
    
    print("\n❌ ALL METHODS FAILED: Could not set up Chrome WebDriver")
    return False

def test_linkedin_access():
    """Test if we can access LinkedIn (without logging in)"""
    print("\n===== Testing LinkedIn Access =====")
    try:
        options = Options()
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--window-size=1920,1080")
        
        # Add user agent to avoid detection
        options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36")
        
        # Try to create driver using the first successful method
        try:
            driver = webdriver.Chrome(options=options)
        except Exception:
            from webdriver_manager.chrome import ChromeDriverManager
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)
        
        print("Accessing LinkedIn homepage...")
        driver.get("https://www.linkedin.com")
        print(f"LinkedIn page title: {driver.title}")
        
        if "LinkedIn" in driver.title:
            print("✅ Successfully accessed LinkedIn")
            
            # Take screenshot for verification if running in graphical environment
            try:
                screenshot_path = "linkedin_test.png"
                driver.save_screenshot(screenshot_path)
                print(f"✅ Screenshot saved to {screenshot_path}")
            except Exception as e:
                print(f"⚠️ Could not save screenshot: {e}")
            
            driver.quit()
            return True
        else:
            print("❌ LinkedIn title not found in page title")
            driver.quit()
            return False
    except Exception as e:
        print(f"❌ LinkedIn access test failed: {e}")
        traceback.print_exc()
        return False

def run_all_tests():
    """Run all tests and report results"""
    print("\n===== SELENIUM ENVIRONMENT TEST =====")
    print(f"Python version: {sys.version}")
    print(f"Selenium version: {webdriver.__version__}")
    
    # Try to get Chrome version
    try:
        options = Options()
        options.add_argument("--headless=new")
        driver = webdriver.Chrome(options=options)
        chrome_version = driver.capabilities['browserVersion']
        chrome_name = driver.capabilities['browserName']
        driver.quit()
        print(f"Browser: {chrome_name} {chrome_version}")
    except Exception:
        print("Could not determine Chrome version")
    
    # Run tests
    chromedriver_result = test_chrome_driver()
    linkedin_result = test_linkedin_access()
    
    # Report final results
    print("\n===== TEST RESULTS =====")
    print(f"ChromeDriver setup: {'✅ PASSED' if chromedriver_result else '❌ FAILED'}")
    print(f"LinkedIn access: {'✅ PASSED' if linkedin_result else '❌ FAILED'}")
    
    if chromedriver_result and linkedin_result:
        print("\n✅ All tests passed! Your environment is ready for LinkedIn scraping.")
        return 0
    else:
        print("\n❌ Some tests failed. Please check the issues before running the LinkedIn scraper.")
        return 1

if __name__ == "__main__":
    sys.exit(run_all_tests()) 