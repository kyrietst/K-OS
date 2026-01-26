"""
Configuration management using Pydantic Settings.
Reads environment variables for Supabase, LLM APIs, and CORS configuration.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Supabase Configuration
    supabase_url: str
    supabase_service_role_key: str
    
    # LLM API Configuration
    openrouter_api_key: str
    openrouter_model: str = "deepseek/deepseek-r1"
    gemini_api_key: str
    
    # CORS Configuration
    nextjs_url: str = "http://localhost:3000"
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )


@lru_cache
def get_settings() -> Settings:
    """
    Returns cached settings instance.
    Only reads .env file once for performance.
    """
    return Settings()
