"""
Security module for Intelligence Engine.
Handles API Key validation for inter-service communication.
"""
from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader
from core.config import get_settings

# Define header key
API_KEY_HEADER = APIKeyHeader(name="X-Internal-Secret", auto_error=False)

async def validate_internal_secret(api_key: str = Security(API_KEY_HEADER)):
    """
    Validates that the incoming request has the correct internal secret.
    Used to secure communication between Next.js backend and FastAPI.
    """
    settings = get_settings()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Missing authentication header"
        )
        
    if api_key != settings.internal_api_secret:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid authentication credentials"
        )
    
    return api_key
