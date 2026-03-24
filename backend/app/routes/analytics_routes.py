from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, cast, Date
from typing import Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import ipaddress
import httpx
from ..database import get_db
from ..models import AnalyticsEvent

router = APIRouter()

class EventCreate(BaseModel):
    event_type: str
    pathname: str
    referrer: Optional[str] = None
    userAgent: Optional[str] = None
    timestamp: Optional[datetime] = None

async def get_country_from_ip(ip: str) -> str:
    """Get country from IP using a free IP geolocation API"""
    try:
        # Use a free IP geolocation API
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://ipapi.co/{ip}/json/")
            if response.status_code == 200:
                data = response.json()
                return data.get("country_name", "Unknown")
    except Exception:
        pass
    return "Unknown"

def truncate_ip(ip: str) -> str:
    """Truncate IP address for privacy (keep only first parts)"""
    try:
        if ":" in ip:  # IPv6
            return str(ipaddress.IPv6Address(ip)).rsplit(":", 2)[0] + ":0:0"
        else:  # IPv4
            return ".".join(str(ipaddress.IPv4Address(ip)).split(".", 3)[:3]) + ".0"
    except Exception:
        return "0.0.0.0"

@router.post("/track")
async def track_event(event: EventCreate, request: Request, db: Session = Depends(get_db)):
    """Track an analytics event"""
    # Get client IP
    client_ip = request.client.host
    
    # Create new event
    db_event = AnalyticsEvent(
        event_type=event.event_type,
        path=event.pathname,
        referrer=event.referrer,
        ip=truncate_ip(client_ip),
        user_agent=event.userAgent,
        timestamp=event.timestamp or datetime.utcnow()
    )
    
    # Get country asynchronously
    country = await get_country_from_ip(client_ip)
    db_event.country = country
    
    # Save to database
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    
    return {"success": True, "event_id": db_event.id}

@router.get("/summary")
def get_analytics_summary(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Get analytics summary for the dashboard"""
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Total visits
    total_visits = db.query(func.count(AnalyticsEvent.id)).filter(
        AnalyticsEvent.event_type == "pageview",
        AnalyticsEvent.timestamp >= start_date
    ).scalar()
    
    # Visits by day
    daily_visits = db.query(
        cast(AnalyticsEvent.timestamp, Date).label('date'),
        func.count(AnalyticsEvent.id).label('count')
    ).filter(
        AnalyticsEvent.event_type == "pageview",
        AnalyticsEvent.timestamp >= start_date
    ).group_by(cast(AnalyticsEvent.timestamp, Date)).all()
    
    # Most viewed pages
    most_viewed_pages = db.query(
        AnalyticsEvent.path,
        func.count(AnalyticsEvent.id).label('count')
    ).filter(
        AnalyticsEvent.event_type == "pageview",
        AnalyticsEvent.timestamp >= start_date
    ).group_by(AnalyticsEvent.path).order_by(desc('count')).limit(10).all()
    
    # Top referrers
    top_referrers = db.query(
        AnalyticsEvent.referrer,
        func.count(AnalyticsEvent.id).label('count')
    ).filter(
        AnalyticsEvent.event_type == "pageview",
        AnalyticsEvent.timestamp >= start_date,
        AnalyticsEvent.referrer != None,
        AnalyticsEvent.referrer != ""
    ).group_by(AnalyticsEvent.referrer).order_by(desc('count')).limit(10).all()
    
    # Top countries
    top_countries = db.query(
        AnalyticsEvent.country,
        func.count(AnalyticsEvent.id).label('count')
    ).filter(
        AnalyticsEvent.event_type == "pageview",
        AnalyticsEvent.timestamp >= start_date,
        AnalyticsEvent.country != None
    ).group_by(AnalyticsEvent.country).order_by(desc('count')).limit(10).all()
    
    # Format the results
    result = {
        "total_visits": total_visits,
        "daily_visits": [{"date": str(day.date), "count": day.count} for day in daily_visits],
        "most_viewed_pages": [{"path": page.path, "count": page.count} for page in most_viewed_pages],
        "top_referrers": [{"referrer": ref.referrer, "count": ref.count} for ref in top_referrers],
        "top_countries": [{"country": country.country, "count": country.count} for country in top_countries]
    }
    
    return result

@router.get("/events")
def get_recent_events(
    limit: int = 100,
    event_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get recent analytics events"""
    query = db.query(AnalyticsEvent)
    
    if event_type:
        query = query.filter(AnalyticsEvent.event_type == event_type)
    
    events = query.order_by(desc(AnalyticsEvent.timestamp)).limit(limit).all()
    
    return [event.to_dict() for event in events] 