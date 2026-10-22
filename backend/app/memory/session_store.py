import time
import uuid
from typing import Dict, List, Optional, Any
from backend.app.schemas.chat import SessionInfo, MessageRecord, ToolCallRecord

class SessionStore:
    def __init__(self):
        self._sessions: Dict[str, SessionInfo] = {}
        self._messages: Dict[str, List[MessageRecord]] = {}
        self._pending_approvals: Dict[str, Dict[str, Any]] = {}

    def create_session(self, title: Optional[str] = None) -> SessionInfo:
        session_id = str(uuid.uuid4())
        session = SessionInfo(
            session_id=session_id,
            title=title or f"City Intelligence {time.strftime('%b %d, %H:%M')}",
            created_at=time.time(),
            updated_at=time.time(),
            message_count=0
        )
        self._sessions[session_id] = session
        self._messages[session_id] = []
        return session

    def get_session(self, session_id: str) -> Optional[SessionInfo]:
        return self._sessions.get(session_id)

    def list_sessions(self) -> List[SessionInfo]:
        return sorted(list(self._sessions.values()), key=lambda s: s.updated_at, reverse=True)

    def get_messages(self, session_id: str) -> List[MessageRecord]:
        return self._messages.get(session_id, [])

    def add_message(self, session_id: str, message: MessageRecord) -> None:
        if session_id not in self._sessions:
            self._sessions[session_id] = SessionInfo(
                session_id=session_id,
                title=f"Chat {session_id[:8]}",
                created_at=time.time(),
                updated_at=time.time()
            )
            self._messages[session_id] = []
        
        self._messages[session_id].append(message)
        self._sessions[session_id].message_count = len(self._messages[session_id])
        self._sessions[session_id].updated_at = time.time()
        
        # Auto-update title if it's the first user message
        if len(self._messages[session_id]) == 1 and message.role == "user":
            preview = message.content[:35].strip()
            self._sessions[session_id].title = f"{preview}..." if len(message.content) > 35 else preview

    def delete_session(self, session_id: str) -> bool:
        if session_id in self._sessions:
            del self._sessions[session_id]
            self._messages.pop(session_id, None)
            return True
        return False

    def clear_all(self) -> None:
        self._sessions.clear()
        self._messages.clear()
        self._pending_approvals.clear()

    # Human-In-The-Loop Pending Approval Store
    def register_pending_approval(self, session_id: str, tool_call_id: str, tool_name: str, args: Dict[str, Any], future_or_event: Any) -> None:
        self._pending_approvals[tool_call_id] = {
            "session_id": session_id,
            "tool_call_id": tool_call_id,
            "tool_name": tool_name,
            "args": args,
            "notifier": future_or_event,
            "status": "pending",
            "decision": None
        }

    def resolve_pending_approval(self, tool_call_id: str, approved: bool, reason: Optional[str] = None) -> bool:
        record = self._pending_approvals.get(tool_call_id)
        if not record:
            return False
        record["status"] = "resolved"
        record["decision"] = approved
        record["reason"] = reason
        notifier = record.get("notifier")
        if notifier and hasattr(notifier, "set"):
            notifier.set()
        return True

    def get_pending_approval(self, tool_call_id: str) -> Optional[Dict[str, Any]]:
        return self._pending_approvals.get(tool_call_id)

session_store = SessionStore()
