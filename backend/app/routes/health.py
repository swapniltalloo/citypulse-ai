from fastapi import APIRouter
from backend.app.config import settings
from backend.app.memory.session_store import session_store

router = APIRouter(prefix="/health", tags=["Health & Diagnostics"])

@router.get("")
def health_check():
    """System diagnostic, API key status & operational health"""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "diagnostics": {
            "groq_configured": bool(settings.GROQ_API_KEY),
            "openweather_configured": bool(settings.OPENWEATHER_API_KEY),
            "tavily_configured": bool(settings.TAVILY_API_KEY),
            "default_model": settings.DEFAULT_MODEL,
            "available_models": settings.AVAILABLE_MODELS,
            "active_sessions": len(session_store.list_sessions())
        }
    }
