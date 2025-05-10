FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including Chrome dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    wget \
    unzip \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Install Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Create necessary directories
RUN mkdir -p data credentials

# Create startup script
RUN echo '#!/bin/bash\n\
echo "Starting backend application..."\n\
echo "Verifying Chrome installation..."\n\
CHROME_VERSION=$(google-chrome --version)\n\
echo "Chrome version: $CHROME_VERSION"\n\
\n\
echo "Testing Chrome WebDriver..."\n\
python -c "from selenium import webdriver; from selenium.webdriver.chrome.service import Service; from webdriver_manager.chrome import ChromeDriverManager; from selenium.webdriver.chrome.options import Options; options = Options(); options.add_argument(\"--headless=new\"); options.add_argument(\"--no-sandbox\"); options.add_argument(\"--disable-dev-shm-usage\"); print(\"WebDriver modules imported successfully\"); service = Service(); print(\"Service created successfully\"); driver = webdriver.Chrome(service=service, options=options); print(\"Chrome WebDriver initialized\"); driver.quit(); print(\"Chrome WebDriver test completed successfully\")" || echo "Warning: Chrome WebDriver test failed, but continuing startup"\n\
\n\
echo "Starting FastAPI application..."\n\
# PORT is set automatically by Cloud Run\n\
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}\n\
' > /app/startup.sh && chmod +x /app/startup.sh

# Set environment variables and expose port
# PORT is set automatically by Cloud Run
ENV PYTHONUNBUFFERED=1
EXPOSE 8080

# Start command using startup script
CMD ["/app/startup.sh"] 