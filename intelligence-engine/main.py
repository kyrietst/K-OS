"""
kOS Intelligence Engine - FastAPI Application
AI orchestration microservice for KyrieOS agency management.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import get_settings
from routes import health, jobs, cfo


# Load settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="kOS Intelligence Engine",
    description="AI orchestration for KyrieOS agency management using CrewAI",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.nextjs_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health.router, tags=["Health"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
app.include_router(cfo.router, prefix="/ai/cfo", tags=["CFO Agent"])


@app.get("/")
async def root():
    """Root endpoint with service information."""
    return {
        "service": "kOS Intelligence Engine",
        "version": "0.1.0",
        "status": "operational",
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "cfo_analysis": "POST /ai/cfo/analyze",
            "job_status": "GET /jobs/{job_id}"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )
