import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import database first
from app.database import engine, Base
# Then import models AFTER database - this sequence is very important!
from app.models import AnalyticsEvent

import pymysql
import os
from dotenv import load_dotenv
from sqlalchemy import inspect

def init_database():
    # Load environment variables
    load_dotenv()
    
    # Get connection parameters
    host = os.getenv("DATABASE_HOST", "192.168.20.12")
    port = int(os.getenv("DATABASE_PORT", "3306"))
    user = os.getenv("DATABASE_USER", "portfolio")
    password = os.getenv("DATABASE_PASSWORD")
    database = os.getenv("DATABASE_NAME", "portfolio")
    
    print(f"Connecting to {host}:{port} as {user}")
    
    try:
        # Connect to MariaDB server (without database)
        conn = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            charset='utf8mb4',
            connect_timeout=10
        )
        
        cursor = conn.cursor()
        
        # Create database if it doesn't exist
        print(f"Creating database '{database}' if it doesn't exist...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {database}")
        
        # Verify database exists
        cursor.execute("SHOW DATABASES")
        databases = [db[0] for db in cursor.fetchall()]
        if database in databases:
            print(f"✅ Verified: Database '{database}' exists")
        else:
            print(f"❌ Error: Database '{database}' was not created successfully")
            cursor.close()
            conn.close()
            return False
        
        # Switch to the database
        cursor.execute(f"USE {database}")
        
        # Close initial connection
        cursor.close()
        conn.close()
        print("Initial connection closed successfully")
        
        # Debug: Print available models BEFORE creating tables
        print("\nDebug: Available SQLAlchemy Models:")
        for class_name in Base.metadata.tables.keys():
            print(f"- {class_name}")
        
        print("\nCreating tables via SQLAlchemy...")
        # Create all tables using SQLAlchemy models
        Base.metadata.create_all(bind=engine)
        
        # Verify tables were created
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        if tables:
            print(f"✅ Verified: Created tables: {', '.join(tables)}")
            # Print table columns for verification
            for table in tables:
                columns = [col['name'] for col in inspector.get_columns(table)]
                print(f"  Table '{table}' columns: {', '.join(columns)}")
        else:
            print("❌ Warning: No tables were created")
            print("Debug: Checking Base.metadata.tables:")
            print(f"Number of tables in metadata: {len(Base.metadata.tables)}")
            for table_name, table in Base.metadata.tables.items():
                print(f"- Table '{table_name}' columns: {[c.name for c in table.columns]}")
        
        return True
    except pymysql.err.OperationalError as e:
        error_code = e.args[0]
        if error_code == 1045:  # Access denied
            print(f"Access denied: Username or password incorrect for user '{user}'")
        elif error_code == 2003:  # Can't connect
            print(f"Cannot connect to host '{host}' on port {port}")
        else:
            print(f"Database operational error: {str(e)}")
        return False
    except Exception as e:
        print(f"Error initializing database: {type(e).__name__}: {str(e)}")
        return False

if __name__ == "__main__":
    # Debug: Print the SQLAlchemy model registry
    print("Registered models in SQLAlchemy:")
    for name, table in Base.metadata.tables.items():
        print(f"- {name}")
    
    success = init_database()
    if success:
        print("Database initialization completed successfully")
    else:
        print("Database initialization failed")
        sys.exit(1)