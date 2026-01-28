# User Stories: KyrieOS v1.1 Offensive

**Epic:** Operational Efficiency & True AI Integration **Date:** 2026-01-27
**Status:** PENDING APPROVAL

---

## US-001: TimeTracker (Pulmão Operacional)

> **As a** Developer/CFO, **I want to** register time logs directly in the
> dashboard, **So that** the CFO Agent has actual data to calculate
> profitability.

### Acceptance Criteria

- [ ] **UI:** Card component positioned in
      `src/components/dashboard/TimeTracker.tsx`.
- [ ] **Controls:**
  - Play button (start timer).
  - Stop button (stop timer and open save modal or auto-save).
  - Input field for description ("What are you working on?").
- [ ] **Logic:**
  - Calculates duration in real-time (displayed as `HH:MM:SS`).
  - On stop, calls Server Action
    `saveWorklog(workspaceId, duration, description)`.
- [ ] **Tech Stack:** HeroUI v3 (`Card`, `Button`, `Input`), `lucide-react`
      icons.
- [ ] **Data:** Successfully inserts a row into `worklogs` table.

---

## US-002: AI Refactoring (Cérebro Real)

> **As a** System Architect, **I want** the `cfo_agent.py` to be a true CrewAI
> Agent, **So that** it can intelligently reason about data using the
> DeepSeek-R1 model, not just run hardcoded SQL.

### Acceptance Criteria

- [ ] **Architecture:** Convert functional script to Class-based structure
      (`class CFOAgent(Agent)`).
- [ ] **Config:** Agent uses `LLM(model="deepseek/deepseek-r1")` from
      environment variables.
- [ ] **Tooling:** Refactor direct SQL calls into `@tool` decorated functions:
  - `fetch_contract_data(workspace_id)`
  - `fetch_worklog_summary(workspace_id)`
- [ ] **Orchestration:** Main execution uses
      `Crew(agents=[cfo], tasks=[analyze_budget]).kickoff()`.

---

## US-003: Client Visibilty Toggle (Ponte Tática)

> **As a** Project Manager, **I want to** toggle which issues are visible to the
> client, **So that** we can start populating the Client Portal without exposing
> sensitive internal tasks.

### Acceptance Criteria

- [ ] **UI:** Add a Switch/Toggle in the **Issue Details Modal**.
- [ ] **Label:** "Visible to Client" (Default: False).
- [ ] **Action:** Updating the toggle updates the `client_visible` boolean in
      `issues` table via Supabase.
- [ ] **Feedback:** Visual indicator (e.g., Eye icon) on the Issue Card in
      Kanban view if `client_visible` is true.
