"""
CFO Agent - Financial health analyzer using DeepSeek-R1.

Analyzes budget alignment by comparing:
  (Total Hours × Hourly Cost) vs Monthly Contract Revenue

Logs budget alerts to ai_actions table for transparency.
"""
from crewai import Agent, Task, Crew
from core.supabase import get_supabase_client
from core.job_tracker import update_job, JobStatus
from core.config import get_settings
from typing import Dict, List


settings = get_settings()


async def run_cfo_analysis(job_id: str, workspace_id: str):
    """
    Execute CFO budget analysis for a workspace.
    
    Args:
        job_id: Job ID for status tracking
        workspace_id: UUID of workspace to analyze
    """
    try:
        update_job(job_id, JobStatus.RUNNING)
        
        # Get Supabase client
        supabase = get_supabase_client()
        
        # Step 1: Fetch active contracts
        contracts_result = supabase.table("contracts") \
            .select("id, client_name, monthly_value, hourly_cost") \
            .eq("workspace_id", workspace_id) \
            .eq("is_active", True) \
            .execute()
        
        contracts = contracts_result.data
        if not contracts:
            update_job(job_id, JobStatus.COMPLETED, result={
                "finding": "No active contracts found for this workspace.",
                "alerts": []
            })
            return
        
        # Step 2: Fetch worklog summary (using helper function)
        worklog_result = supabase.rpc("get_worklog_summary", {
            "workspace_id_param": workspace_id
        }).execute()
        
        worklogs = {w["client_name"]: float(w["total_hours"]) for w in worklog_result.data}
        
        # Step 3: Calculate budget analysis
        total_revenue = sum(c["monthly_value"] for c in contracts)
        total_hours = sum(worklogs.values())
        
        alerts = []
        for contract in contracts:
            client_name = contract["client_name"]
            monthly_revenue = float(contract["monthly_value"])
            hourly_cost = float(contract["hourly_cost"])
            hours_logged = worklogs.get(client_name, 0.0)
            
            # Calculate percentages
            revenue_pct = (monthly_revenue / total_revenue) * 100 if total_revenue > 0 else 0
            hours_pct = (hours_logged / total_hours) * 100 if total_hours > 0 else 0
            
            # Calculate expected cost vs actual revenue
            expected_cost = hours_logged * hourly_cost
            budget_variance = expected_cost - monthly_revenue
            
            # Alert if over budget by >10%
            variance_pct = (budget_variance / monthly_revenue) * 100 if monthly_revenue > 0 else 0
            
            if variance_pct > 10:
                alert_msg = (
                    f"ALERTA ORÇAMENTÁRIO: {client_name} - "
                    f"Receita: R${monthly_revenue:.2f} ({revenue_pct:.1f}%), "
                    f"Custo Real: R${expected_cost:.2f} ({hours_logged:.1f}h × R${hourly_cost:.2f}/h), "
                    f"Variância: R${budget_variance:.2f} (+{variance_pct:.1f}%). "
                    f"Time está consumindo {hours_pct:.1f}% das horas mas cliente representa apenas {revenue_pct:.1f}% da receita."
                )
                
                alerts.append({
                    "client_name": client_name,
                    "monthly_revenue": monthly_revenue,
                    "revenue_percentage": revenue_pct,
                    "total_hours": hours_logged,
                    "hours_percentage": hours_pct,
                    "expected_cost": expected_cost,
                    "hourly_rate": hourly_cost,
                    "budget_variance": budget_variance,
                    "variance_percentage": variance_pct,
                    "alert_message": alert_msg
                })
                
                # Log to ai_actions table
                supabase.table("ai_actions").insert({
                    "task_id": None,  # Not linked to specific issue
                    "agent_name": "CFOAgent",
                    "action": "budget_alert",
                    "reasoning": alert_msg,
                    "metadata": {
                        "workspace_id": workspace_id,
                        "client_name": client_name,
                        "monthly_revenue": monthly_revenue,
                        "expected_cost": expected_cost,
                        "budget_variance": budget_variance,
                        "variance_percentage": variance_pct
                    },
                    "status": "pending"
                }).execute()
        
        # Step 4: Generate summary
        if alerts:
            summary = (
                f"🚨 {len(alerts)} alerta(s) orçamentário(s) encontrado(s). "
                f"Receita total: R${total_revenue:.2f}, "
                f"Horas totais: {total_hours:.1f}h. "
                f"Verifique a tabela ai_actions para detalhes."
            )
        else:
            summary = (
                f"✅ Orçamento saudável! Receita total: R${total_revenue:.2f}, "
                f"Horas totais: {total_hours:.1f}h. "
                f"Todos os clientes estão dentro da margem de custo."
            )
        
        # Step 5: Complete job
        update_job(job_id, JobStatus.COMPLETED, result={
            "workspace_id": workspace_id,
            "total_monthly_revenue": total_revenue,
            "total_hours_logged": total_hours,
            "alerts": alerts,
            "summary": summary
        })
        
    except Exception as e:
        update_job(job_id, JobStatus.FAILED, error=str(e))
