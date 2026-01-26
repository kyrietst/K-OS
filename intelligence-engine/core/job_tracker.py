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


# In-memory storage (WARNING: lost on restart)
_JOBS: Dict[str, Job] = {}


def create_job(job_type: str) -> Job:
    """
    Creates a new job and stores it in memory.
    Returns the created Job instance.
    """
    job = Job(job_type)
    _JOBS[job.id] = job
    return job


def get_job(job_id: str) -> Optional[Job]:
    """
    Retrieves a job by ID.
    Returns None if job not found.
    """
    return _JOBS.get(job_id)


def update_job(
    job_id: str,
    status: JobStatus,
    result: Optional[dict] = None,
    error: Optional[str] = None
):
    """
    Updates job status, result, and error message.
    Updates timestamp to current time.
    """
    if job := _JOBS.get(job_id):
        job.status = status
        if result is not None:
            job.result = result
        if error is not None:
            job.error = error
        job.updated_at = datetime.utcnow()


def list_jobs(limit: int = 10) -> list[Job]:
    """
    Returns most recent jobs (for debugging).
    Sorted by created_at descending.
    """
    jobs = list(_JOBS.values())
    jobs.sort(key=lambda j: j.created_at, reverse=True)
    return jobs[:limit]
