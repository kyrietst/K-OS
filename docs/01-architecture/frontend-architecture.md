# 🎨 Frontend Architecture

## Overview

KyrieOS uses a modern, server-first architecture built on **Next.js 14+ (App
Router)**.

### Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS v4 + HeroUI v3 (Beta)
- **Icons:** Lucide React
- **State Management:** URL State (Nuqs) + React Server Actions + React Query
  (Supabase)

---

## 🧩 Component System (HeroUI v3)

We utilize **HeroUI v3** which follows a **Compound Component** pattern. This
differs significantly from v2.

### Principles

1. **Composition over Props:**
   - ❌ `<Accordion items={...} />` (v2 pattern)
   - ✅ `<Accordion><Accordion.Item>...</Accordion.Item></Accordion>` (v3
     pattern)
   - **Why?** Greater flexibility in styling and structure without prop
     explosion.

2. **Server Components Default:**
   - Standard UI components (Buttons, Cards) are client components only if they
     need interactivity (hooks).
   - Data fetching happens in Server Components (`page.tsx`, `layout.tsx`).

3. **Glassmorphism:**
   - Use `backdrop-blur-md` and semi-transparent backgrounds (`bg-content1/80`)
     to achieve the signature KyrieOS look.
   - Avoid solid opaque backgrounds in modals or overlapping layers.

### Key Components

| Component | Usage Note                                              |
| :-------- | :------------------------------------------------------ |
| `Button`  | Use `onPress` instead of `onClick` (React Aria).        |
| `Modal`   | Requires `Modal.Content`, `Modal.Header`, `Modal.Body`. |
| `Slider`  | Requires `Slider.Track`, `Slider.Fill`, `Slider.Thumb`. |

---

## 📂 Folder Structure

```
src/
├── app/                  # Routes (Server Components)
│   ├── dashboard/        # Authenticated App
│   └── invite/           # Public Invite Routes
├── components/           # UI Components
│   ├── ui/               # Generic (Buttons, Inputs)
│   ├── issues/           # Domain: Issues
│   └── workspace/        # Domain: Workspace
└── lib/                  # Utilities
    └── supabase/         # Auth & Database Clients
```
