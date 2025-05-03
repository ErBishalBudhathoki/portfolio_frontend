import os
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get configuration
host = os.getenv('HOST', '0.0.0.0')
port = int(os.getenv('PORT', '8000'))
debug = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=debug
    ) 