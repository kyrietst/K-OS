"""
CFO Agent - Financial health analyzer (CrewAI Encapsulated).

Orchestrates DeepSeek-R1 via OpenRouter to analyze budget alignment.
"""
import os
import json
from textwrap import dedent
from typing import List, Dict, Any

from crewai import Agent, Task, Crew, Process, LLM
from crewai.tools import tool

from core.supabase import get_supabase_client
from core.job_tracker import update_job, JobStatus
from core.config import get_settings

settings = get_settings()

# --- Tools ---

class CFOTools:
    @tool("Fetch Contract Data")
    def fetch_contract_data(workspace_id: str):
        """
        Fetches active contracts for a workspace to get revenue and hourly cost data.
        Returns a list of contracts with 'client_name', 'monthly_value', and 'hourly_cost'.
        """
        supabase = get_supabase_client()
        result = supabase.table("contracts") \
            .select("id, client_name, monthly_value, hourly_cost") \
            .eq("workspace_id", workspace_id) \
            .eq("is_active", True) \
            .execute()
        return result.data if result.data else []

    @tool("Fetch Worklog Summary")
    def fetch_worklog_summary(workspace_id: str):
        """
        Fetches the summary of hours worked per client/project for the current period.
        Returns a list containing 'client_name' and 'total_hours'.
        """
        supabase = get_supabase_client()
        result = supabase.rpc("get_worklog_summary", {
            "workspace_id_param": workspace_id
        }).execute()
        return result.data if result.data else []

# --- Agent Definition ---

def create_cfo_crew(workspace_id: str) -> Crew:
    # --- LLM Configuration (Groq) ---
    # Using Groq for high-speed inference with Llama 3.3 70B
    llm = LLM(
        model="groq/llama-3.3-70b-versatile",
        api_key=os.getenv("GROQ_API_KEY"),
        temperature=0.1
    )

    # 2. Define the Agent
    cfo = Agent(
        role='Chief Financial Officer (CFO)',
        goal='Analyze financial health, budget variance, and profitability for the workspace.',
        backstory=dedent("""
            You are an expert CFO with a strategic mind for agency profitability.
            Your job is to look at the hard numbers (contracts vs active worklogs)
            and determine which clients are over-serviced (burning budget) or under-serviced.
            You don't just calculate; you provide STRATEGIC INSIGHTS and WARNINGS.
            You care deeply about "Effective Hourly Rate" and "Budget Variance".
        """),
        tools=[CFOTools.fetch_contract_data, CFOTools.fetch_worklog_summary],
        llm=llm,
        verbose=True,
        allow_delegation=False
    )

    # 3. Define the Task
    analysis_task = Task(
        description=dedent(f"""
            Analyze the financial health of workspace '{workspace_id}'.
            
            Steps:
            1. Fetch active contracts using `Fetch Contract Data`.
            2. Fetch worklog summaries using `Fetch Worklog Summary`.
            3. Compare the 'monthly_value' (Revenue) against 'total_hours' * 'hourly_cost' (Actual Cost).
            4. Calculate Budget Variance for each client.
            5. Identify any client where the Projected Cost > Monthly Revenue (Negative Variance).
            6. Identify any client consuming > 110% of their allocated budget.
            
            Output Requirements:
            - A strategic summary of the overall financial state.
            - A specific list of ALERTS for any client over budget.
            - Reasoning for *why* these discrepancies might be happening based on the data.
            
            Important: Ensure you actually call the tools to get the data. Do not hallucinate data.
        """),
        expected_output=dedent("""
            A JSON-like structure (markdown code block is fine) or structured report containing:
            - overall_health: "Healthy" | "At Risk" | "Critical"
            - financial_summary: text
            - alerts: List of dicts with { client, variance, warning_message }
            - strategic_advice: text
        """),
        agent=cfo
    )

    # 4. Create Crew
    crew = Crew(
        agents=[cfo],
        tasks=[analysis_task],
        process=Process.sequential,
        verbose=True
    )
    
    return crew

# --- Entry Point ---

async def run_cfo_analysis(job_id: str, workspace_id: str):
    """
    Execute CFO budget analysis using CrewAI.
    """
    try:
        update_job(job_id, JobStatus.RUNNING)
        supabase = get_supabase_client()

        # Instantiate and Run Crew
        print(f"[CFO] Starting Crew for Workspace: {workspace_id}")
        try:
            crew = create_cfo_crew(workspace_id)
            print("[CFO] Crew created. Kicking off...")
            result = crew.kickoff()
            print("[CFO] Crew kickoff finished.")
        except Exception as crew_error:
            print(f"[CFO] CRITICAL CREW ERROR: {crew_error}")
            import traceback
            traceback.print_exc()
            raise crew_error
            
        final_output = str(result)
        print(f"[CFO] Final Output Length: {len(final_output)}")
        
        # --- FALLBACK LOGGING (AUDIT) ---
        # Save reasoning to local file to bypass DB connection issues
        try:
            log_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "last_ai_reasoning.txt")
            with open(log_path, "w", encoding="utf-8") as f:
                f.write(final_output)
            print(f"[CFO] Reasoning saved locally to: {log_path}")
        except Exception as log_err:
            print(f"[CFO] Failed to save local log: {log_err}")
        # -------------------------------
        
        # Log to ai_actions
        # We'll store the entire output as the 'reasoning' for now, 
        # or verify if we want to parse it. 
        # Since the user asked to "Audit Log: Salve o reasoning", storing the full text is good.
        
        # Attempt to parse the result to extract structured data
        parsed_output = {}
        try:
            # Assuming the output is a markdown code block with JSON inside
            json_str = final_output.split("```json")[1].split("```")[0]
            parsed_output = json.loads(json_str)
        except (json.JSONDecodeError, IndexError):
            print("[CFO] Could not parse CrewAI output as JSON. Storing raw output.")
            # Fallback to a simpler structure if parsing fails
            parsed_output = {"full_report": final_output}

        alerts = parsed_output.get("alerts", [])
        total_revenue = parsed_output.get("total_monthly_revenue", 0.0) # Assuming these might be in the output
        total_hours = parsed_output.get("total_hours_logged", 0.0) # Assuming these might be in the output

        insert_res = supabase.table("ai_actions").insert({
            "task_id": None, # Set to None to avoid FK constraint with issues table if job_id is not a real issue UUID
            "agent_name": "CFOAgent",
            "action": "budget_analysis_crew_run",
            "reasoning": final_output, # Store full output for audit
            "metadata": {
                "workspace_id": workspace_id,
                "tool_usage": "crewai_orchestration",
                "parsed_output": parsed_output, # Store parsed output if available
                "parsed_output": parsed_output, # Store parsed output if available
                "original_job_id": str(job_id) # Strictly cast to string to avoid serialization issues
            },
            "status": "completed"
        }).execute()
        print(f"[CFO] AI Action Inserted: {insert_res.data}")

        if alerts:
            summary = (
                f"[ALERT] {len(alerts)} budget alert(s) found. "
                f"Total Revenue: R${total_revenue:.2f}, "
                f"Total Hours: {total_hours:.1f}h. "
                f"Check ai_actions for details."
            )
        else:
            summary = (
                f"[OK] Budget healthy. Total Revenue: R${total_revenue:.2f}, "
                f"Total Hours: {total_hours:.1f}h. "
                f"All clients within margin."
            )
        
        # Step 5: Complete job
        update_job(job_id, JobStatus.COMPLETED, result={
            "workspace_id": workspace_id,
            "total_monthly_revenue": total_revenue,
            "total_hours_logged": total_hours,
            "alerts": alerts,
            "summary": summary,
            "full_report": final_output # Keep full report in job result as well
        })
        
    except Exception as e:
        print(f"[CFO] Check failed: {e}")
        import traceback
        traceback.print_exc()
        update_job(job_id, JobStatus.FAILED, error=str(e))
