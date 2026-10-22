from typing import Dict, Any, List
from fastapi import APIRouter
from backend.app.tools import ALL_TOOLS

router = APIRouter(prefix="/tools", tags=["Tools Catalog"])

@router.get("", response_model=List[Dict[str, Any]])
def list_available_tools():
    """Returns documentation and schemas for all active tools in the agent"""
    tool_list = []
    for t in ALL_TOOLS:
        tool_list.append({
            "name": t.name,
            "description": t.description,
            "args_schema": str(t.args_schema.schema()) if getattr(t, "args_schema", None) else None
        })
    return tool_list
