from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
import time
import uuid

class ToolCallRecord(BaseModel):
    id: str
    tool_name: str
    args: Dict[str, Any]
    status: str = "pending" # pending, approved, rejected, executing, completed, failed
    result: Optional[str] = None
    structured_data: Optional[Dict[str, Any]] = None
    execution_time_ms: Optional[float] = None
    timestamp: float = Field(default_factory=time.time)

class MessageRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str # "user", "assistant", "system", "tool"
    content: str
    tool_calls: Optional[List[ToolCallRecord]] = None
    timestamp: float = Field(default_factory=time.time)
    metadata: Optional[Dict[str, Any]] = None

class SessionInfo(BaseModel):
    session_id: str
    title: str = "New Urban Pulse Conversation"
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)
    message_count: int = 0
    pinned_city: Optional[str] = None

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    model: Optional[str] = None
    temperature: Optional[float] = None
    hitl_mode: Optional[str] = "auto" # "auto", "always_ask", "sensitive_only"

class ToolApprovalRequest(BaseModel):
    session_id: str
    tool_call_id: str
    approved: bool
    user_override_reason: Optional[str] = None

class AgentEvent(BaseModel):
    event: str # "session_init", "thought", "tool_call_pending", "tool_approval_required", "tool_result", "token", "done", "error"
    data: Dict[str, Any]
