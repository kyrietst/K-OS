# Client Portal (PRD-002)

## Overview

The Client Portal is a secure, read-only interface dedicated to external
clients. It allows clients to track the progress of their projects without
exposing internal agency operations or financial data.

## Key Features

- **Route:** `/dashboard/[slug]/client`
- **Security:**
  - Strict Role-Based Access Control (RBAC) via `middleware.ts`.
  - Row Level Security (RLS) ensures clients only see issues where
    `client_visible = true`.
- **UI:**
  - Simplified layout (No Sidebar).
  - Status Mapping (e.g., "Done" -> "Concluído").
  - Read-Only Issue Details Modal.

## Workflow

1. **Invite:** Admin invites user with role `client`.
2. **Onboarding:** User accepts invite -> System detects role -> Redirects to
   Portal.
3. **Visibility:** Agency toggles `Visible to Client` in Issue Details to share
   progress.
