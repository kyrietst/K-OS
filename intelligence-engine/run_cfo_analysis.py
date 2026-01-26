"""
Simplified CFO Analysis Script - Direct Execution
Bypasses CrewAI for MVP testing.
"""
import asyncio
import sys
sys.path.insert(0, 'd:\\1. LUCCAS\\aplicativos ai\\KyrieOS\\intelligence-engine')

from core.supabase import get_supabase_client

async def run_cfo_analysis_simple(workspace_id: str):
    """Direct CFO analysis without CrewAI."""
    print(f"🤖 CFO Agent iniciando análise para workspace {workspace_id}...")
    
    supabase = get_supabase_client()
    
    # Fetch contracts
    print("📊 Buscando contratos ativos...")
    contracts_result = supabase.table("contracts") \
        .select("id, client_name, monthly_value, hourly_cost") \
        .eq("workspace_id", workspace_id) \
        .eq("is_active", True) \
        .execute()
    
    contracts = contracts_result.data
    if not contracts:
        print("❌ Nenhum contrato ativo encontrado.")
        return
    
    print(f"✅ {len(contracts)} contratos encontrados")
    
    # Fetch worklogs
    print("⏱️  Buscando worklogs...")
    worklog_result = supabase.rpc("get_worklog_summary", {
        "workspace_id_param": workspace_id
    }).execute()
    
    worklogs = {w["client_name"]: float(w["total_hours"]) for w in worklog_result.data}
    print(f"✅ Worklogs processados: {worklogs}")
    
    # Calculate analysis
    total_revenue = sum(c["monthly_value"] for c in contracts)
    total_hours = sum(worklogs.values())
    
    print(f"\n💰 RECEITA TOTAL: R${total_revenue:.2f}")
    print(f"⏰ HORAS TOTAIS: {total_hours:.1f}h")
    print(f"\n{'='*60}")
    print("ANÁLISE DETALHADA POR CLIENTE:")
    print(f"{'='*60}\n")
    
    alerts = []
    for contract in contracts:
        client_name = contract["client_name"]
        monthly_revenue = float(contract["monthly_value"])
        hourly_cost = float(contract["hourly_cost"])
        hours_logged = worklogs.get(client_name, 0.0)
        
        revenue_pct = (monthly_revenue / total_revenue) * 100 if total_revenue > 0 else 0
        hours_pct = (hours_logged / total_hours) * 100 if total_hours > 0 else 0
        
        expected_cost = hours_logged * hourly_cost
        budget_variance = expected_cost - monthly_revenue
        variance_pct = (budget_variance / monthly_revenue) * 100 if monthly_revenue > 0 else 0
        
        print(f"👤 CLIENTE: {client_name}")
        print(f"   📈 Receita: R${monthly_revenue:.2f} ({revenue_pct:.1f}% do total)")
        print(f"   ⏱️  Horas: {hours_logged:.1f}h ({hours_pct:.1f}% do total)")
        print(f"   💸 Custo Real: {hours_logged:.1f}h × R${hourly_cost:.2f} = R${expected_cost:.2f}")
        print(f"   📊 Variância: R${budget_variance:.2f} ({variance_pct:+.1f}%)")
        
        if variance_pct > 10:
            alert_msg = (
                f"🚨 ALERTA ORÇAMENTÁRIO: {client_name} - "
                f"Receita mensal é R${monthly_revenue:.2f}, mas o custo real da equipe é R${expected_cost:.2f}. "
                f"Variância de +{variance_pct:.1f}% (R${budget_variance:.2f} acima do orçamento). "
                f"Cliente representa {revenue_pct:.1f}% da receita mas está consumindo {hours_pct:.1f}% das horas."
            )
            print(f"   ⚠️  STATUS: OVER BUDGET!")
            alerts.append({"client": client_name, "alert": alert_msg, "variance": budget_variance})
            
            # Log to ai_actions
            supabase.table("ai_actions").insert({
                "task_id": None,
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
        else:
            print(f"   ✅ STATUS: Dentro do orçamento")
        print()
    
    print(f"{'='*60}")
    if alerts:
        print(f"\n🚨 RESUMO: {len(alerts)} alerta(s) orçamentário(s) gerado(s)!")
        print("\nAlertas registrados na tabela ai_actions para revisão.\n")
    else:
        print(f"\n✅ RESUMO: Todos os clientes estão dentro do orçamento!\n")
    
    return alerts

if __name__ == "__main__":
    workspace_id = "45bb72d6-97f3-4410-8db2-02ae6d4e9fcb"
    asyncio.run(run_cfo_analysis_simple(workspace_id))
