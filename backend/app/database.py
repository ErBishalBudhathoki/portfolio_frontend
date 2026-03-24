from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from .firebase_config import firebase

# Load environment variables
load_dotenv()

# Use Firebase Firestore as the primary database
db = firebase["db"]

# For backward compatibility with SQLAlchemy models, 
# we'll keep the Base and session parts, but without MySQL connection

# Base class for models
Base = declarative_base()

# Create a lightweight in-memory SQLite database for analytics 
# that previously used MariaDB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

# Create SQLAlchemy engine with specific settings
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

# Create a SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()