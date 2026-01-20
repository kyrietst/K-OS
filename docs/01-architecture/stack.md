# 🥞 Tech Stack (A "Stack de Ouro")

Esta é a definição oficial das tecnologias utilizadas no **KyrieOS**. Respeite
rigorosamente estas versões e bibliotecas.

## Frontend Core

- **Framework**: `Next.js 16+` (App Router, Turbopack enabled)
- **Linguagem**: `TypeScript` (Strict Mode)
- **Build Tool**: `Turbopack` (Default in Next.js 15+)

## UI & Styling

- **Component Library**: `HeroUI v3 (Beta)`
  - **Import**: `@heroui/react` (Compound Components pattern)
  - **Estilização:** Tailwind CSS v4.
  - Configuração via CSS imports (`@import "tailwindcss";`).
  - Integração com HeroUI via `@plugin` e `@source`.

- **Componentes UI:** HeroUI v3 Beta.
  - **Pattern:** Compound Components Exclusivamente (ex: `Modal` >
    `Modal.Container` > `Modal.Dialog`).
  - **Primitivos:** Components como `Input` e `TextArea` são primitivos (sem
    props de `label` complexas).
  - **Ícones:** Lucide React.
  - **Table:** Atualmente em desenvolvimento no v3 Beta (usando fallback HTML +
    Tailwind).
  - **Drag & Drop:** `@dnd-kit` (Core, Sortable, Utilities).
  - **Charts:** `recharts` (Responsive, Composition components).

- **Tailwind Tools**:
  - **Variables**: Native CSS variables for theming
  - **Utility Class Management**: `tailwind-merge` + `clsx` (via `cn` helper)

## State Management

- **Server State**: `TanStack Query` (via Supabase helpers if needed, otherwise
  Server Components)
- **Client State**: `React.useState` / `React.useReducer` (local), `Zustand`
  (global UI state if needed)
- **URL State**: `nuqs` (Search params as state)

## Backend & Data

- **Platform**: `Supabase`
- **Database**: `PostgreSQL`
- **ORM/Client**: `@supabase/supabase-js` (Typed via `database.types.ts`)
- **Auth**: `Supabase Auth` (SSR supported)

## Key Architectural Decisions

1. **HeroUI v3 Usage**: Use Compound Components (e.g., `modal.content`,
   `card.header`). Do NOT use v2 flat props.
2. **Server First**: Prefer Server Components for data fetching. use
   `use client` only for interactive leaves.
3. **Tailwind v4**: No `tailwind.config.ts` needed for standard usage;
   configuration lives in CSS.
