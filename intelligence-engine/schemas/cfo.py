"""
Pydantic schemas for CFO agent requests and responses.
"""
from pydantic import BaseModel, Field
from typing import List


class CFOAnalysisRequest(BaseModel):
    """Request model for triggering CFO budget analysis."""
    workspace_id: str = Field(..., description="UUID of the workspace to analyze")
    
    class Config:
        json_schema_extra = {
            "example": {
                "workspace_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        }


class BudgetAlert(BaseModel):
    """Individual budget alert from CFO analysis."""
    client_name: str
    monthly_revenue: float
    revenue_percentage: float
    total_hours: float
    hours_percentage: float
    expected_cost: float
    hourly_rate: float
    budget_variance: float  # Negative = under budget, Positive = over budget
    alert_message: str


class CFOAnalysisResponse(BaseModel):
    """Response model for completed CFO analysis."""
    workspace_id: str
    total_monthly_revenue: float
    total_hours_logged: float
    alerts: List[BudgetAlert]
    summary: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "workspace_id": "550e8400-e29b-41d4-a716-446655440000",
                "total_monthly_revenue": 10000.00,
                "total_hours_logged": 120.0,
                "alerts": [
                    {
                        "client_name": "Adega Anita's",
                        "monthly_revenue": 3000.00,
                        "revenue_percentage": 30.0,
                        "total_hours": 60.0,
                        "hours_percentage": 50.0,
                        "expected_cost": 9000.00,
                        "hourly_rate": 150.00,
                        "budget_variance": 6000.00,
                        "alert_message": "OVER BUDGET: Expected R$3,000, team cost is R$9,000 (300%)"
                    }
                ],
                "summary": "1 budget alert found. Adega Anita's is consuming 50% of hours but only represents 30% of revenue."
            }
        }
