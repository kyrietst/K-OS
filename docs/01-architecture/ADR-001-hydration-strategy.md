# ADR-001: Hydration Strategy & Client-Side Isolation

## Status

Accepted

## Context

We encountered persistent "Hydration failed" errors (React error #418/423) in
the `Sidebar` component. Root cause analysis revealed that browser extensions
(e.g., "Booster") were injecting DOM elements (e.g., `id="booster_root"`) or
modifying attributes `cz-shortcut-listen` before React hydration completed.
Attempts to use `suppressHydrationWarning` and `isMounted` checks were partially
successful but fragile against invasive extensions.

## Decision

We decided to enforce a **Client-Side Only** rendering strategy for complex
interactive components like the `Sidebar` using `next/dynamic` with
`ssr: false`.

### Implementation Pattern

To comply with Next.js 16 Server Component rules (which forbid `ssr: false`
directly in Server Components), we established a Wrapper Pattern:

1. **Wrapper Component (Client):** `sidebar-wrapper.tsx` (`'use client'`)
   - Imports the logic component dynamically:
     ```tsx
     const Sidebar = dynamic(() => import("./sidebar"), { ssr: false });
     ```
2. **Layout (Server):** `layout.tsx` imports `SidebarWrapper`.

## Consequences

### Positive

- **Guaranteed Consistency:** The server renders a skeleton/null. The client
  renders the UI only _after_ taking control. Zero chance of mismatch.
- **Extension Immunity:** DOM injections by extensions before hydration do not
  conflict because React isn't trying to match a server-generated tree.

### Negative

- **SEO Impact:** The Sidebar content is not visible to crawlers (acceptable for
  a Dashboard behind auth).
- **CLS (Cumulative Layout Shift):** Potential visual shift if the skeleton
  doesn't match the final UI perfectly (mitigated by matching skeleton
  dimensions).
