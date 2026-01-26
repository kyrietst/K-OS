"""
Health check endpoint for service monitoring.
"""
from fastapi import APIRouter, Depends
from core.supabase import get_supabase_client, test_connection
from supabase import Client


router = APIRouter()


@router.get("/health")
async def health_check(supabase: Client = Depends(get_supabase_client)):
    """
    Health check endpoint.
    
    Returns:
        - status: Overall service health
        - service: Service name
        - database: Supabase connection status
    """
    # Test database connectivity
    db_connected = test_connection()
    db_status = "connected" if db_connected else "disconnected"
    
    return {
        "status": "healthy" if db_connected else "degraded",
        "service": "kOS Intelligence Engine",
        "version": "0.1.0",
        "database": db_status
    }
