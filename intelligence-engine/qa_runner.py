
import asyncio
import httpx
import sys
import os
from time import sleep

# Add current dir to path to import core
sys.path.append(os.getcwd())

from core.supabase import get_supabase_client
from core.config import get_settings

settings = get_settings()
BASE_URL_FASTAPI = "http://127.0.0.1:8000"
BASE_URL_NEXTJS = "http://localhost:3000"
WORKSPACE_ID = "45bb72d6-97f3-4410-8db2-02ae6d4e9fcb"

async def run_qa():
    print("[INFO] Starting QA Test Suite...")
    supabase = get_supabase_client()
    
    # ---------------------------------------------------------
    # TEST 1: Security Check (Blindagem)
    # ---------------------------------------------------------
    print("\n[TEST 1] Security Check: Request without X-Internal-Secret")
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                f"{BASE_URL_FASTAPI}/ai/cfo/analyze", 
                json={"workspace_id": WORKSPACE_ID} # Missing Header
            )
            if resp.status_code == 403:
                print("[PASS] Access Denied (403 Forbidden)")
            else:
                print(f"[FAIL] Expected 403, got {resp.status_code}")
                print(resp.text)
        except Exception as e:
            print(f"[FAIL] Connection Error: {e}")

    # ---------------------------------------------------------
    # TEST 2: Job Integrity (Persistência)
    # ---------------------------------------------------------
    print("\n[TEST 2] Job Integrity: Trigger via Next.js & Check DB")
    job_id = None
    async with httpx.AsyncClient() as client:
        try:
            # Trigger via Next.js Route Handler
            resp = await client.post(
                f"{BASE_URL_NEXTJS}/api/cfo-analyze",
                json={"workspace_id": WORKSPACE_ID}
            )
            if resp.status_code == 200:
                data = resp.json()
                job_id = data.get("job_id")
                print(f"[INFO] Triggered: Job ID {job_id}")
            else:
                print(f"[FAIL] Next.js Error {resp.status_code} - {resp.text}")
                # Continue testing even if trigger fails
        except Exception as e:
             print(f"[FAIL] Next.js Connection Error: {e}")


    # Check DB for 'running' then 'completed'
    if job_id:
        print("   Polling DB for status...")
        for _ in range(10):
            res = supabase.table("jobs").select("*").eq("id", job_id).execute()
            if res.data:
                job = res.data[0]
                status = job["status"]
                print(f"   Status: {status}")
                if status == "completed":
                    print("[PASS] Job completed successfully")
                    print(f"   Result: {str(job.get('result'))[:100]}...")
                    break
                if status == "failed":
                    print(f"[FAIL] Job failed with error: {job.get('error')}")
                    break
            await asyncio.sleep(2)
        else:
            print("[WARN] TIMEOUT: Job did not complete in 20s")

    # ---------------------------------------------------------
    # TEST 3: Stress Test (Multiple Clients)
    # ---------------------------------------------------------
    print("\n[TEST 3] Stress Test: Multi-Client Analysis")
    # Insert Mock Clients
    mock_clients = [
        {"workspace_id": WORKSPACE_ID, "client_name": "Client Beta", "monthly_value": 5000, "start_date": "2026-01-01", "is_active": True, "hourly_cost": 100},
        {"workspace_id": WORKSPACE_ID, "client_name": "Marketing X", "monthly_value": 8000, "start_date": "2026-01-01", "is_active": True, "hourly_cost": 120}
    ]
    try:
        supabase.table("contracts").insert(mock_clients).execute()
        print("   Inserted 2 mock clients")
    except Exception as e:
        print(f"   Warning: Could not insert clients (maybe duplicates): {e}")

    # Trigger 2 parallel requests
    async with httpx.AsyncClient() as client:
        reqs = [
            client.post(f"{BASE_URL_NEXTJS}/api/cfo-analyze", json={"workspace_id": WORKSPACE_ID}),
            client.post(f"{BASE_URL_NEXTJS}/api/cfo-analyze", json={"workspace_id": WORKSPACE_ID})
        ]
        responses = await asyncio.gather(*reqs)
        
        valid_jobs = []
        for r in responses:
            if r.status_code == 200:
                valid_jobs.append(r.json()["job_id"])
        
        if len(valid_jobs) == 2:
            print(f"[PASS] 2 Simultaneous Jobs Created: {valid_jobs}")
        else:
            print(f"[FAIL] Expected 2 jobs, got {len(valid_jobs)}")

    # ---------------------------------------------------------
    # TEST 4: Fail Fast (Error Scenario)
    # ---------------------------------------------------------
    print("\n[TEST 4] Fail Fast: Invalid Workspace ID")
    invalid_ws = "00000000-0000-0000-0000-000000000000"
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(
             f"{BASE_URL_NEXTJS}/api/cfo-analyze",
             json={"workspace_id": invalid_ws}
        )
        if resp.status_code == 200:
             fail_job_id = resp.json().get("job_id")
             print(f"   Job created: {fail_job_id}. Checking DB for failure status...")
             
             for _ in range(10):
                res = supabase.table("jobs").select("*").eq("id", fail_job_id).execute()
                if res.data:
                    job = res.data[0]
                    if job["status"] == "failed":
                        print("[PASS] Job marked as FAILED")
                        print(f"   Error Message: {job.get('error')}")
                        print(f"   Job Link: {fail_job_id}")
                        break
                    if job["status"] == "completed":
                         print("[FAIL] Job completed unexpectedly (should fail)")
                         break
                await asyncio.sleep(2)
        else:
             print(f"   Note: API returned {resp.status_code} (Acceptable if fail-fast happens at API level)")


if __name__ == "__main__":
    asyncio.run(run_qa())
