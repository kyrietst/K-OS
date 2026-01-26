# 🚀 kOS Intelligence Engine - Setup Guide

## ⚡ Quick Start (MVP Ready)

### Step 1: Run Database Migrations

1. **Open Supabase SQL Editor:**
   - Navigate to:
     https://supabase.com/dashboard/project/jxkmmdmpmrhwxibalmkc/editor

2. **Execute the migration file:**
   - Open: `docs/02-guides/intelligence-migrations.sql`
   - Copy all SQL code
   - Paste into Supabase SQL Editor
   - Click **RUN**

3. **Verify tables created:**

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('ai_actions', 'contracts', 'worklogs')
ORDER BY table_name;
```

Expected result: 3 rows (`ai_actions`, `contracts`, `worklogs`)

---

### Step 2: Install Python Dependencies

The virtual environment has already been created. Activate it and install
dependencies:

```powershell
cd intelligence-engine
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Dependencies installed:**

- FastAPI + Uvicorn (API framework)
- CrewAI (AI agent orchestration)
- Supabase Python client
- Pydantic (data validation)
- OpenAI + Google GenAI (LLM APIs)

---

### Step 3: Verify Environment Configuration

The `.env` file has been copied from the root directory.Verify it contains:

```env
SUPABASE_URL=https://jxkmmdmpmrhwxibalmkc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh... (your service role key)
OPENROUTER_API_KEY=sk-or-v1-... (your OpenRouter key)
GEMINI_API_KEY=AIza... (your Gemini key)
```

---

### Step 4: Start the FastAPI Server

```powershell
cd intelligence-engine
uvicorn main:app --reload
```

**Expected output:**

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Application startup complete.
```

---

### Step 5: Test Health Check

Open browser or use curl:

```bash
curl http://localhost:8000/health
```

**Expected response:**

```json
{
    "status": "healthy",
    "service": "kOS Intelligence Engine",
    "version": "0.1.0",
    "database": "connected"
}
```

---

### Step 6: Insert Test Data

To test the CFO Agent, insert sample contracts and worklogs in Supabase SQL
Editor:

```sql
-- Get your workspace ID
SELECT id, name, slug FROM workspaces LIMIT 1;

-- Insert sample contract (Adega Anita's - 30% of revenue)
INSERT INTO contracts (workspace_id, client_name, monthly_value, hourly_cost, start_date, is_active)
VALUES (
  '<your-workspace-id-here>',
  'Adega Anita''s',
  3000.00,
  150.00,
  '2026-01-01',
  true
);

-- Insert another client for comparison
INSERT INTO contracts (workspace_id, client_name, monthly_value, hourly_cost, start_date, is_active)
VALUES (
  '<your-workspace-id-here>',
  'Cliente ABC',
  7000.00,
  150.00,
  '2026-01-01',
  true
);

-- Insert sample worklogs (simulate 60 hours on Adega Anita's = OVER BUDGET!)
-- First, get an issue ID:
SELECT id, title, project_id FROM issues LIMIT 1;

-- Then insert worklogs:
INSERT INTO worklogs (issue_id, user_id, hours, logged_at)
VALUES (
  '<issue-id-here>',
  '<your-user-id-here>',
  60.0,
  NOW()
);

-- Expected CFO Alert:
-- Revenue: R$3,000 (30% of total R$10,000)
-- Cost: 60 hours × R$150 = R$9,000 (300% over budget!)
```

---

### Step 7: Trigger CFO Analysis

**Option A: Swagger UI (Recommended)**

1. Open: http://localhost:8000/docs
2. Expand `POST /ai/cfo/analyze`
3. Click **Try it out**
4. Enter your `workspace_id`:
   ```json
   {
       "workspace_id": "your-workspace-id-here"
   }
   ```
5. Click **Execute**
6. Copy the returned `job_id`

**Option B: curl**

```bash
curl -X POST http://localhost:8000/ai/cfo/analyze \
  -H "Content-Type: application/json" \
  -d '{"workspace_id": "your-workspace-id-here"}'
```

**Response:**

```json
{
    "job_id": "550e8400-e29b-41d4-a716-446655440000",
    "message": "CFO analysis started for workspace ..."
}
```

---

### Step 8: Check Job Status

Use the `job_id` from Step 7:

```bash
curl http://localhost:8000/jobs/{job_id}
```

**While running:**

```json
{
    "id": "550e8400...",
    "type": "cfo_analysis",
    "status": "running",
    "result": null,
    "error": null,
    "created_at": "2026-01-25T21:00:00Z",
    "updated_at": "2026-01-25T21:00:05Z"
}
```

**When completed:**

```json
{
    "id": "550e8400...",
    "type": "cfo_analysis",
    "status": "completed",
    "result": {
        "workspace_id": "...",
        "total_monthly_revenue": 10000.0,
        "total_hours_logged": 60.0,
        "alerts": [
            {
                "client_name": "Adega Anita's",
                "monthly_revenue": 3000.0,
                "revenue_percentage": 30.0,
                "total_hours": 60.0,
                "expected_cost": 9000.0,
                "budget_variance": 6000.0,
                "alert_message": "ALERTA ORÇAMENTÁRIO: ..."
            }
        ],
        "summary": "🚨 1 alerta(s) orçamentário(s) encontrado(s). ..."
    }
}
```

---

### Step 9: Verify AI Actions Table

Check that the CFO Agent logged reasons to the audit table:

```sql
SELECT 
  agent_name,
  action,
  reasoning,
  metadata,
  status,
  created_at
FROM ai_actions
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:** Rows with `agent_name='CFO Agent'`, `action='budget_alert'`, and
detailed `reasoning` explaining the over-budget scenario.

---

## 📡 API Endpoints Reference

| Endpoint          | Method | Purpose                        |
| ----------------- | ------ | ------------------------------ |
| `/`               | GET    | Service information            |
| `/health`         | GET    | Health check + DB connectivity |
| `/ai/cfo/analyze` | POST   | Trigger CFO budget analysis    |
| `/jobs/{job_id}`  | GET    | Check async job status         |
| `/docs`           | GET    | Interactive Swagger UI         |

---

## 🧪 Next Steps

1. **Integrate with Next.js Frontend:**
   - Create Route Handler in Next.js: `src/app/api/ai/cfo/analyze/route.ts`
   - Call FastAPI from Next.js server-side
   - Display results in dashboard

2. **Add Scrum Master Agent:**
   - Implement ICE scoring logic
   - Prioritize issues automatically

3. **Add Worker Agent:**
   - Execute batch database operations
   - Create sprints, move cards

4. **Production Deployment:**
   - Deploy to Railway/Fly.io using Dockerfile
   - Migrate job tracker to Redis
   - Add authentication middleware

---

## 🔧 Troubleshooting

**Q: "database": "disconnected"**\
A: Check `SUPABASE_SERVICE_ROLE_KEY` in `.env` file

**Q: Job stuck in "pending"**\
A: Check FastAPI console for Python errors

**Q: No alerts generated**\
A: Ensure test data has hours > (revenue / hourly_cost)

**Q: "No matching distribution found for crewai==0.86.0"**\
A: Fixed - just use `crewai` without version pin

---

## 📚 Documentation

- **Implementation Plan:** `brain/implementation_plan.md`
- **Database Migrations:** `docs/02-guides/intelligence-migrations.sql`
- **PRD:** `docs/02-features/intelligence-integration.md.md`
- **FastAPI Docs:** http://localhost:8000/docs

---

**✅ You're ready to validate the first CFO analysis!**\
Run the test above and share the results for review.
