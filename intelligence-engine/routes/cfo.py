"""
CFO Agent endpoints for budget analysis.
"""
from fastapi import APIRouter, BackgroundTasks
from core.job_tracker import create_job
from schemas.cfo import CFOAnalysisRequest
from schemas.job import JobCreatedResponse


router = APIRouter()


@router.post("/analyze", response_model=JobCreatedResponse, status_code=202)
async def trigger_cfo_analysis(
    request: CFOAnalysisRequest,
    background_tasks: BackgroundTasks
):
    """
    Trigger async CFO budget analysis for a workspace.
    
    The CFO Agent will:
    1. Read all active contracts to calculate revenue %
    2. Read all worklogs to calculate hour allocation %
    3. Compare (hours × hourly_cost) vs monthly_revenue
    4. Generate budget alerts for misalignments
    5. Log findings to ai_actions table
    
    Args:
        request: CFOAnalysisRequest with workspace_id
        
    Returns:
        JobCreatedResponse with job_id to track progress
    """
    # Create job
    job = create_job("cfo_analysis")
    
    # Import here to avoid circular dependency
    from agents.cfo_agent import run_cfo_analysis
    
    # Execute in background
    background_tasks.add_task(run_cfo_analysis, job.id, request.workspace_id)
    
    return JobCreatedResponse(
        job_id=job.id,
        message=f"CFO analysis started for workspace {request.workspace_id}. Check /jobs/{job.id} for status."
    )
