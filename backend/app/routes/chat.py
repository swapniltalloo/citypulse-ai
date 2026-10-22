import json
from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse
from backend.app.schemas.chat import ChatRequest, ToolApprovalRequest
from backend.app.agent.core import CityAgentRunner
from backend.app.memory.session_store import session_store

router = APIRouter(prefix="", tags=["Chat & Agent Execution"])

@router.post("/chat/stream")
async def stream_chat(req: ChatRequest):
    """Server-Sent Events (SSE) streaming endpoint for real-time agent execution"""
    
    async def event_generator():
        target_session = req.session_id
        if not target_session or not session_store.get_session(target_session):
            new_sess = session_store.create_session()
            target_session = new_sess.session_id

        async for event in CityAgentRunner.execute_stream(
            session_id=target_session,
            user_message=req.message,
            model_name=req.model,
            temperature=req.temperature,
            hitl_mode=req.hitl_mode
        ):
            yield {
                "event": event["event"],
                "data": json.dumps(event["data"])
            }

    return EventSourceResponse(event_generator())

@router.post("/chat/approve")
async def approve_tool(req: ToolApprovalRequest):
    """Human-in-the-Loop decision endpoint to approve or reject a tool call"""
    success = session_store.resolve_pending_approval(
        tool_call_id=req.tool_call_id,
        approved=req.approved,
        reason=req.user_override_reason
    )
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Tool call approval request not found or already resolved."
        )
    return {"status": "ok", "tool_call_id": req.tool_call_id, "approved": req.approved}
