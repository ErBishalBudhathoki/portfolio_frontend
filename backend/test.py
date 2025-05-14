# test.py - place this in your project root directory
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import database first
from app.database import Base, engine
# Then import models
from app.models import AnalyticsEvent

print("Checking SQLAlchemy model registration:")
print(f"Number of tables in metadata: {len(Base.metadata.tables)}")
for table_name, table in Base.metadata.tables.items():
    print(f"- Table '{table_name}' with columns: {[c.name for c in table.columns]}")

print("\nVerifying AnalyticsEvent model:")
print(f"Table name: {AnalyticsEvent.__tablename__}")
print(f"Primary key: {[c.name for c in AnalyticsEvent.__table__.primary_key.columns]}")
print(f"Columns: {[c.name for c in AnalyticsEvent.__table__.columns]}")