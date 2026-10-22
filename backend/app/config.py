import os
from typing import List
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    # App info
    PROJECT_NAME: str = "CityPulse AI - Urban Intelligence Agent"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # LLM Settings
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "openai/gpt-oss-120b")
    AVAILABLE_MODELS: List[str] = [
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "qwen/qwen3.8-27b",
    ]
    DEFAULT_TEMPERATURE: float = 0.2
    
    # External APIs
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")
    
    # Tool Execution & Safety
    TOOL_TIMEOUT_SECONDS: int = 15
    MAX_TOOL_ITERATIONS: int = 8
    
    # Human-In-The-Loop Defaults
    # Options: "auto" (always allow), "guard_all" (always require approval), "sensitive_only"
    DEFAULT_HITL_MODE: str = "auto"
    SENSITIVE_TOOLS: List[str] = ["get_news"]

    # CORS
    CORS_ORIGINS: List[str] = ["*"]

settings = Settings()
