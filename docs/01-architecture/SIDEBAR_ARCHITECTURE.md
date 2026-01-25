# Sidebar Architecture & Component Hierarchy

## Overview

The Sidebar module manages navigation, workspace switching, and user profile
actions. It is designed to be fully Client-Side interactive while maintaining a
seamless integration with the Next.js App Router.

## Component Structure

```mermaid
graph TD
    Layout[Dashboard Layout (Server)]
    Wrapper[SidebarWrapper (Client)]
    Logic[Sidebar Logic (Dynamic Import)]
    UI[HeroUI Components]

    Layout --> Wrapper
    Wrapper --"Next.js Dynamic (ssr: false)"--> Logic
    Logic --> UI
```

### 1. DashboardLayout (`layout.tsx`)

- **Role:** Server Component. Fetches initial data (User, Workspaces).
- **Responsibility:** Passes data props to the wrapper. Does NOT import the
  heavy sidebar logic directly.

### 2. SidebarWrapper (`sidebar-wrapper.tsx`)

- **Role:** Client Component Boundary.
- **Responsibility:**
  - Handles the `dynamic()` import.
  - Provides the `loading` state (Skeleton) to prevent layout shifts.
  - Bypasses Next.js strict SSR rules for the inner component.

### 3. Sidebar (`sidebar.tsx`)

- **Role:** Implementation Logic.
- **Features:**
  - **State:** `isCollapsed`, `activeWorkspace`.
  - **HeroUI V3:** Uses `Dropdown`, `Dropdown.Popover` (Critical for floating
    menus), `ListBox`.
  - **Visuals:** Conditional rendering for Collapsed/Expanded states to prevent
    overlaps.

## Key Technical Decisions

### HeroUI V3 Compliance

- **Dropdowns:** Must use `<Dropdown.Popover>` to render correctly via React
  Aria Portals. Inline rendering causes layout breakage.
- **Triggers:** Custom triggers must use `div role="button"` instead of nested
  `<button>` tags to avoid HTML validation errors.

### Visual Stability

- **Collapse Animation:** Uses unconditional rendering (removing text from DOM)
  rather than CSS opacity to ensure zero visual overlap/glitching during
  transitions.
