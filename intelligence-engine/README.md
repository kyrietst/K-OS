# kOS Intelligence Engine

AI orchestration microservice for KyrieOS agency management using FastAPI and
CrewAI.

## 🧠 Architecture

This microservice uses **CrewAI** to orchestrate AI agents that analyze and
optimize agency operations:

- **CFO Agent**: Ensures team hours align with client revenue (DeepSeek-R1)
- **Scrum Master Agent**: Prioritizes tasks using ICE scoring (Gemini Flash)
- **Worker Agent**: Executes database operations (Gemini Flash)

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Supabase project with service role key
- OpenRouter API key (for DeepSeek-R1)
- Google Gemini API key

### Setup

1. **Create virtual environment:**

```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # macOS/Linux
```

2. **Install dependencies:**

```bash
pip install -r requirements.txt
```

3. **Environment configuration:** Create a `.env` file in the
   `intelligence-engine/` directory (or symlink from root):

```env
# Supabase
SUPABASE_URL=https://jxkmmdmpmrhwxibalmkc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# LLM APIs
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=deepseek/deepseek-r1
GEMINI_API_KEY=your_gemini_key

# CORS
NEXTJS_URL=http://localhost:3000
```

4. **Run database migrations:** Execute the SQL in
   `docs/02-guides/intelligence-migrations.sql` in Supabase SQL Editor.

5. **Start the server:**

```bash
uvicorn main:app --reload
```

Server runs at: `http://localhost:8000`\
API Docs: `http://localhost:8000/docs`

## 📡 API Endpoints

### Health Check

```http
GET /health
```

Returns service status and database connectivity.

### CFO Analysis

```http
POST /ai/cfo/analyze
Content-Type: application/json

{
  "workspace_id": "uuid-of-workspace"
}
```

Triggers async CFO budget analysis. Returns `job_id`.

### Job Status

```http
GET /jobs/{job_id}
```

Check status of async AI analysis job.

## 🗄️ Database Schema

### `ai_actions`

Audit log for AI decisions. Ensures transparency (why did the AI change this
priority?).

### `contracts`

Client contracts with `monthly_value` and `hourly_cost` for CFO revenue
analysis.

### `worklogs`

Time entries linked to issues. CFO compares hours spent vs contract value.

## 🤖 CFO Agent Logic

The CFO Agent analyzes financial health using this formula:

```
Expected Cost = (Total Hours on Client) × (Hourly Cost)
Actual Revenue = Monthly Contract Value

If Expected Cost > Actual Revenue → BUDGET ALERT
```

**Example (Adega Anita's):**

- Contract: R$3,000/month
- Hourly Cost: R$150/hour
- Max Sustainable Hours: 20 hours/month
- If team logs 40 hours → Alert: "Team is spending 200% of budget!"

The agent logs its reasoning to `ai_actions` table for review.

## 🔧 Future Enhancements

> [!NOTE]
> **Job Tracker (MVP → Production)**
>
> Current implementation uses **in-memory dictionary** for job tracking. This
> means:
>
> - ✅ Fast, no dependencies
> - ❌ Jobs lost on server restart
> - ❌ Not compatible with multi-worker deployment (Gunicorn)
>
> **Production Migration Path:**
>
> - Replace `core/job_tracker.py` with **Redis** or **PostgreSQL-based queue**
> - Use **Celery** or **ARQ** for distributed task processing
> - Add job persistence and retry logic

## 🐳 Docker Deployment

```bash
docker build -t kos-intelligence .
docker run -p 8000:8000 --env-file .env kos-intelligence
```

For Railway/Fly.io deployment, use the provided `Dockerfile`.

## 📚 Project Structure

```
intelligence-engine/
├── main.py                 # FastAPI app entry point
├── core/
│   ├── config.py           # Pydantic settings
│   ├── supabase.py         # Supabase client
│   └── job_tracker.py      # Async job system
├── agents/
│   ├── cfo_agent.py        # CFO Agent (DeepSeek-R1)
│   ├── scrum_agent.py      # Scrum Master (Gemini Flash)
│   └── worker_agent.py     # Worker (Gemini Flash)
├── tools/
│   ├── supabase_writer.py  # Logs to ai_actions
│   ├── contract_reader.py  # Reads contracts
│   └── worklog_reader.py   # Reads worklogs
├── routes/
│   ├── health.py           # Health check
│   ├── jobs.py             # Job status
│   └── cfo.py              # CFO triggers
└── schemas/
    ├── job.py              # Job models
    └── cfo.py              # CFO request/response
```

## 🔐 Security

- Uses **Supabase Service Role Key** (server-side only, never exposed to client)
- Row Level Security (RLS) policies on all tables
- AI actions logged to `ai_actions` for audit trails
- CORS restricted to Next.js origin

## 📖 Related Documentation

- [Intelligence Integration PRD](../docs/02-features/intelligence-integration.md.md)
- [Implementation Plan](../brain/implementation_plan.md)
- [Database Migrations](../docs/02-guides/intelligence-migrations.sql)
