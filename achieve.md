Improved Developer Portfolio Website Prompt
I need a comprehensive plan and code for a dynamic developer portfolio website with these specific requirements:
Core Features

LinkedIn Profile Integration

Scrape data from LinkedIn profile: https://www.linkedin.com/in/bishalbudhathoki/ and have an option load JSOn file via google sheet for linkedIn profile.
Include profile image, experience, education, and other relevant information
Set up automated daily scraping to keep information current


Projects Showcase

Display projects from LinkedIn with descriptions, technologies used, and links
Include visually appealing project cards with thumbnails


Skills Visualization

Technical skills displayed as icons with proficiency levels
Soft skills presented in a 6-point format with brief descriptions
Organize skills by category (frontend, backend, etc.)


Blog Integration

Connect with Google Sheet "linkedin sheet" (https://docs.google.com/spreadsheets/d/1blqFnWjYgB1idiYqqEZR5qfueO0k6vPZv4eP8Yn3xTg/edit?usp=sharing)
Auto-update the blog section whenever the sheet is modified
Display blog posts with thumbnails, titles, summaries, and publication dates


Certifications Section

List professional certifications with issuing organizations and dates
Include verification links when available



Technical Stack

Frontend: Next.js 14 with App Router, React, Tailwind CSS, and shadcn/ui components
Backend: Python with FastAPI
Data Processing: Pandas for data manipulation
Automation: GitHub Actions or similar for scheduled tasks
Deployment: Vercel for frontend, suitable hosting for Python backend

Implementation Details

Architecture

Separate frontend and backend services
API endpoints for fetching LinkedIn and Google Sheets data
Caching strategy to minimize API calls


LinkedIn Scraping

Implement secure scraping with proper rate limiting
Store scraped data in structured format
Include error handling for API changes


Google Sheets Integration

Use Google Sheets API for reliable access
Implement webhook or scheduled checking for updates
Transform sheet data into blog post format


User Experience

Responsive design for all device sizes
Accessibility considerations (WCAG compliance)
Modern animations and transitions
Dark/light mode toggle


SEO Optimization

Meta tags for improved search visibility
Structured data markup
Sitemap generation



Deliverables

Complete frontend code with components and pages
Backend API code with endpoints
Deployment instructions for both services
Documentation for maintainability
Schedule setup for automated data updates