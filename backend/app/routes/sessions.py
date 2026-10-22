from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.schemas.chat import SessionInfo, MessageRecord
from backend.app.memory.session_store import session_store

router = APIRouter(prefix="/sessions", tags=["Sessions & Memory"])

class CreateSessionRequest(BaseModel):
    title: Optional[str] = None

@router.get("", response_model=List[SessionInfo])
def list_sessions():
    """List all active conversation sessions"""
    return session_store.list_sessions()

@router.post("", response_model=SessionInfo)
def create_session(req: Optional[CreateSessionRequest] = None):
    """Create a new agent session"""
    title = req.title if req else None
    return session_store.create_session(title=title)

@router.get("/{session_id}/messages", response_model=List[MessageRecord])
def get_session_messages(session_id: str):
    """Fetch all messages and tool execution traces for a session"""
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session_store.get_messages(session_id)

@router.delete("/{session_id}")
def delete_session(session_id: str):
    """Delete a conversation session"""
    deleted = session_store.delete_session(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "success", "session_id": session_id}
