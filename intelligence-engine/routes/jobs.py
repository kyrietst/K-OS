"""
Job status endpoint for tracking async AI agent tasks.
"""
from fastapi import APIRouter, HTTPException
from core.job_tracker import get_job
from schemas.job import JobResponse


router = APIRouter()


@router.get("/{job_id}", response_model=JobResponse)
async def get_job_status(job_id: str):
    """
    Get status of an async job by ID.
    
    Args:
        job_id: UUID of the job to query
        
    Returns:
        JobResponse with current status, result, or error
        
    Raises:
        404: Job not found
    """
    job = get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=404,
            detail=f"Job {job_id} not found. It may have expired or never existed."
        )
    
    return JobResponse(
        id=job.id,
        type=job.type,
        status=job.status,
        result=job.result,
        error=job.error,
        created_at=job.created_at,
        updated_at=job.updated_at
    )
