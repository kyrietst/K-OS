"""
Supabase client configured with Service Role Key.
Service Role bypasses RLS policies for AI agent operations.
"""
from supabase import create_client, Client
from core.config import get_settings
from functools import lru_cache


@lru_cache
def get_supabase_client() -> Client:
    """
    Returns cached Supabase client with Service Role authentication.
    
    SECURITY NOTE: Service Role Key bypasses Row Level Security (RLS).
    Only use server-side. Never expose to client.
    """
    settings = get_settings()
    return create_client(
        supabase_url=settings.supabase_url,
        supabase_key=settings.supabase_service_role_key
    )


def test_connection() -> bool:
    """
    Tests Supabase connection by querying workspaces table.
    Returns True if connection successful, False otherwise.
    """
    try:
        client = get_supabase_client()
        result = client.table("workspaces").select("id").limit(1).execute()
        return True
    except Exception as e:
        print(f"Supabase connection failed: {e}")
        return False
