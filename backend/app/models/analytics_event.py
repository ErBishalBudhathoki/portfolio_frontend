# app/models/analytics_event.py
from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
# Import Base from database.py instead of creating a new one
from app.database import Base # Ensure this path is correct relative to how scripts run

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False)
    path = Column(String(255), nullable=False)
    referrer = Column(String(255), nullable=True)
    ip = Column(String(50), nullable=True)  # Will store truncated IP
    country = Column(String(50), nullable=True)
    user_agent = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "event_type": self.event_type,
            "path": self.path,
            "referrer": self.referrer,
            "ip": self.ip,
            "country": self.country,
            "user_agent": self.user_agent,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }