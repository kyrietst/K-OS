"""
kOS Intelligence Engine - FastAPI Application (Simplified)
All routes inline to avoid import issues.
"""
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from core.config import get_settings
from core.supabase import get_supabase_client, test_connection
from core.job_tracker import create_job, get_job, JobStatus
from agents.cfo_agent import run_cfo_analysis

# Load settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="kOS Intelligence Engine",
    description="AI orchestration for KyrieOS agency management",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class CFOAnalysisRequest(BaseModel):
    workspace_id: str

class JobCreatedResponse(BaseModel):
    job_id: str
    message: str

# Routes
@app.get("/")
async def root():
    return {
        "service": "kOS Intelligence Engine",
        "version": "0.1.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    db_connected = test_connection()
    return {
        "status": "healthy" if db_connected else "degraded",
        "service": "kOS Intelligence Engine",
        "version": "0.1.0",
        "database": "connected" if db_connected else "disconnected"
    }

from fastapi import Depends
from core.security import validate_internal_secret

@app.post("/ai/cfo/analyze", response_model=JobCreatedResponse)
async def trigger_cfo_analysis(
    request: CFOAnalysisRequest, 
    background_tasks: BackgroundTasks,
    api_key: str = Depends(validate_internal_secret)
):
    """
    Triggers CFO analysis. Protected by X-Internal-Secret.
    """
    # Create job in Supabase (persisted)
    job = create_job("cfo_analysis", workspace_id=request.workspace_id)
    background_tasks.add_task(run_cfo_analysis, job.id, request.workspace_id)
    return JobCreatedResponse(
        job_id=job.id,
        message=f"CFO analysis started. Check /jobs/{job.id} for status."
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )
