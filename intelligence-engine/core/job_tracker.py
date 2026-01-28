"""
In-memory async job tracker for AI agent tasks.

MVP IMPLEMENTATION: Uses Python dict for job storage.
PRODUCTION TODO: Migrate to Redis or PostgreSQL queue for:
  - Job persistence across restarts
  - Multi-worker support (Gunicorn)
  - Distributed task processing
"""
import uuid
from datetime import datetime
from typing import Dict, Optional
from enum import Enum


class JobStatus(str, Enum):
    """Job execution status."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class Job:
    """Represents an async AI agent job."""
    
    def __init__(self, job_type: str):
        self.id = str(uuid.uuid4())
        self.type = job_type  # 'cfo_analysis', 'scrum_priority', etc.
        self.status = JobStatus.PENDING
        self.result: Optional[dict] = None
        self.error: Optional[str] = None
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def to_dict(self) -> dict:
        """Serialize job for API response."""
        return {
            "id": self.id,
            "type": self.type,
            "status": self.status.value,
            "result": self.result,
            "error": self.error,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }


from core.supabase import get_supabase_client
from datetime import datetime

# Supabase Persistence Implementation

def create_job(job_type: str, workspace_id: Optional[str] = None) -> Job:
    """
    Creates a new job in Supabase.
    Returns the created Job instance.
    """
    client = get_supabase_client()
    data = {
        "type": job_type,
        "workspace_id": workspace_id,
        "status": JobStatus.PENDING,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    # Execute insert and get single row back
    # Note: Supabase-py uses .execute() which returns response
    response = client.table("jobs").insert(data).execute()
    
    if not response.data:
        raise Exception("Failed to create job in Supabase")
        
    record = response.data[0]
    return _record_to_job(record)


def get_job(job_id: str) -> Optional[Job]:
    """
    Retrieves a job by ID from Supabase.
    """
    client = get_supabase_client()
    try:
        response = client.table("jobs").select("*").eq("id", job_id).execute()
        if response.data and len(response.data) > 0:
            return _record_to_job(response.data[0])
        return None
    except Exception as e:
        print(f"[JobTracker] Error getting job {job_id}: {e}")
        return None


def update_job(
    job_id: str,
    status: JobStatus,
    result: Optional[dict] = None,
    error: Optional[str] = None
):
    """
    Updates job status in Supabase.
    """
    client = get_supabase_client()
    update_data = {
        "status": status,
        "updated_at": datetime.utcnow().isoformat()
    }
    
    if result is not None:
        update_data["result"] = result
    if error is not None:
        update_data["error"] = error
        
    try:
        client.table("jobs").update(update_data).eq("id", job_id).execute()
    except Exception as e:
        print(f"[JobTracker] Error updating job {job_id}: {e}")


def list_jobs(limit: int = 10) -> list[Job]:
    """
    Returns recent jobs from Supabase.
    """
    client = get_supabase_client()
    try:
        response = client.table("jobs").select("*").order("created_at", desc=True).limit(limit).execute()
        return [_record_to_job(r) for r in response.data]
    except Exception as e:
        print(f"[JobTracker] Error listing jobs: {e}")
        return []

def _record_to_job(record: dict) -> Job:
    """Map DB record to Job object."""
    job = Job(record["type"])
    job.id = record["id"]
    job.status = JobStatus(record["status"])
    job.result = record.get("result")
    job.error = record.get("error")
    # Parse timestamps might be needed depending on usage, 
    # but currently Job to_dict expects basic types or manages them?
    # Job class init creates now(), we override:
    # Supabase returns ISO strings, so we can store them directly or parse
    # For MVP consistency with existing class which uses datetime objects:
    try:
        job.created_at = datetime.fromisoformat(record["created_at"].replace('Z', '+00:00'))
        job.updated_at = datetime.fromisoformat(record["updated_at"].replace('Z', '+00:00'))
    except:
        pass # Keep defaults if parse fails
        
    return job
