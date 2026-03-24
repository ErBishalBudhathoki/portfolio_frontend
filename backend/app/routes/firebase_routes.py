from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from ..firebase_config import firebase

router = APIRouter()

class Message(BaseModel):
    text: str
    
class MessageResponse(BaseModel):
    id: str
    text: str
    created_at: Optional[datetime] = None
    
@router.get("/messages", response_model=List[MessageResponse])
async def get_messages():
    """Get all messages from Firestore"""
    try:
        if not firebase["db"]:
            raise HTTPException(status_code=500, detail="Firebase not configured")
            
        # Get messages collection
        messages_ref = firebase["db"].collection("messages")
        messages = messages_ref.order_by("created_at", direction="DESCENDING").limit(20).get()
        
        result = []
        for msg in messages:
            msg_data = msg.to_dict()
            result.append(MessageResponse(
                id=msg.id,
                text=msg_data.get("text", ""),
                created_at=msg_data.get("created_at")
            ))
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get messages: {str(e)}")

@router.post("/messages", response_model=MessageResponse)
async def create_message(message: Message):
    """Add a new message to Firestore"""
    try:
        if not firebase["db"]:
            raise HTTPException(status_code=500, detail="Firebase not configured")
            
        # Add message to collection
        message_data = {
            "text": message.text,
            "created_at": datetime.now()
        }
        
        # Add to Firestore
        new_message = firebase["db"].collection("messages").add(message_data)
        
        # Get the document ID
        message_id = new_message[1].id
        
        return MessageResponse(
            id=message_id,
            text=message.text,
            created_at=message_data["created_at"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create message: {str(e)}")

@router.get("/test-firebase")
async def test_firebase():
    """Test Firebase connection"""
    try:
        if not firebase["db"]:
            return {"status": "error", "message": "Firebase not configured"}
            
        # Try to access a collection
        test_ref = firebase["db"].collection("test").document("test")
        test_ref.set({"timestamp": datetime.now(), "message": "Firebase connection test"})
        
        return {
            "status": "success",
            "message": "Firebase connection working correctly",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Firebase connection error: {str(e)}"
        } 