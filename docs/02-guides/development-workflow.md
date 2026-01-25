# 🚀 Development Workflow

## Feature Lifecycle

Follow this process to implement new features in KyrieOS.

### 1. Planning (Task Mode)

- **Artifact:** `task.md`
- Break down the feature into:
  - Database changes (if any)
  - Backend logic (Actions/RPCs)
  - Frontend UI

### 2. Database First

- If the feature needs data, start with the Database.
- **Steps:**
  1. Create/Modify Tables in Supabase.
  2. **CRITICAL:** Add RLS Policies immediately.
  3. Regenerate Types (`src/types/supabase.ts`).

### 3. Backend Logic

- Create Server Actions in `src/app/dashboard/actions.ts`.
- Test logic (you can use temporary pages or scripts).
- Ensure error handling returns friendly messages.

### 4. UI Implementation (HeroUI v3)

- Create Components in `src/components/[domain]/`.
- Use **Compound Components** (e.g., `Modal.Header`, not `title=""`).
- Connect to Server Actions via `useFormState` or event handlers.
- **Feedback:** Always add `toast.success` or error handling.

### 5. Verification

- **Manual Test:** Click through the flow.
- **Lint Check:** Ensure no TypeScript errors or linter warnings.
- **Docs:** Update `docs/` folder (Status, Architecture) if major changes
  occurred.

---

## 🛠️ Tooling

- **State:** `task.md` (Keep it updated).
- **Docs:** `docs/` (Read before coding).
- **UI Lib:** HeroUI v3 (Consult `frontend-architecture.md`).
