"""
Pydantic schemas for job tracking and status responses.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from core.job_tracker import JobStatus


class JobResponse(BaseModel):
    """Response model for job status queries."""
    id: str
    type: str
    status: JobStatus
    result: Optional[dict] = None
    error: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "type": "cfo_analysis",
                "status": "completed",
                "result": {
                    "findings": [
                        {
                            "client": "Adega Anita's",
                            "revenue_pct": 30.0,
                            "hours_pct": 50.0,
                            "alert": "Team é spending 67% more hours than revenue justifies"
                        }
                    ]
                },
                "error": None,
                "created_at": "2026-01-25T21:00:00Z",
                "updated_at": "2026-01-25T21:00:15Z"
            }
        }


class JobCreatedResponse(BaseModel):
    """Response when a new job is created."""
    job_id: str
    message: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "job_id": "550e8400-e29b-41d4-a716-446655440000",
                "message": "CFO analysis started. Check /jobs/{job_id} for status."
            }
        }
