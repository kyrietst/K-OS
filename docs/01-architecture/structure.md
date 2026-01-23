# 📁 Project Structure

> **Última Atualização:** 2026-01-23\
> **Root:** `src/`

Estrutura de pastas do KyrieOS seguindo padrão Feature-Based.

---

## 🗂️ Árvore Completa

```
src/
├── app/                                    # Next.js App Router
│   ├── globals.css                         # Tailwind + Ambient Lights
│   ├── layout.tsx                          # Root layout
│   ├── page.tsx                            # Landing page
│   ├── login/
│   │   └── page.tsx                        # Login page
│   └── dashboard/
│       ├── layout.tsx                      # Dashboard shell
│       ├── page.tsx                        # Dashboard home
│       ├── actions.ts                      # ⭐ ALL Server Actions
│       └── [workspaceSlug]/
│           ├── page.tsx                    # Workspace page
│           └── [projectIdentifier]/
│               ├── page.tsx                # Project page (views)
│               └── settings/               # ✨ NOVO
│                   ├── page.tsx            # Server component
│                   └── project-settings-form.tsx
│
├── components/                             # Componentes por domínio
│   ├── analytics/
│   │   └── project-analytics.tsx           # KPIs + Charts
│   ├── cycles/                             # ✨ NOVO
│   │   ├── cycle-card.tsx                  # Card com progresso
│   │   └── cycles-view.tsx                 # Grid de cycles
│   ├── issues/
│   │   ├── create-issue-modal.tsx
│   │   ├── issue-details-modal.tsx
│   │   └── issue-list.tsx
│   ├── kanban/
│   │   ├── kanban-board.tsx
│   │   └── kanban-card.tsx
│   ├── modules/                            # ✨ ATUALIZADO
│   │   ├── create-module-modal.tsx
│   │   ├── module-card.tsx                 # ✨ NOVO
│   │   └── modules-view.tsx                # ✨ NOVO
│   ├── sidebar/
│   │   └── sidebar.tsx                     # Navegação lateral
│   └── ui/
│       ├── ambient-lights.tsx              # Background effects
│       ├── premium-background.tsx
│       ├── rich-editor.tsx                 # Tiptap editor
│       └── tiptap-extensions/
│           └── thought-extension.tsx       # AI thinking UI
│
├── features/                               # Feature-based modules
│   └── projects/
│       └── actions/
│           └── get-project-analytics.ts    # Analytics aggregation
│
├── lib/                                    # Utilities
│   ├── ai.ts                               # OpenRouter client
│   ├── gemini.ts                           # Gemini client (legacy)
│   └── supabase/
│       ├── client.ts                       # Browser client
│       ├── middleware.ts                   # Auth middleware
│       └── server.ts                       # Server client
│
└── types/
    └── supabase.ts                         # Generated types
```

---

## 📌 Convenções

### Nomenclatura

| Tipo              | Padrão           | Exemplo             |
| ----------------- | ---------------- | ------------------- |
| Pages             | `page.tsx`       | `settings/page.tsx` |
| Server Components | `PascalCase`     | `ProjectPage`       |
| Client Components | `kebab-case.tsx` | `cycle-card.tsx`    |
| Server Actions    | `camelCase`      | `createModule`      |
| Hooks             | `use*`           | `useIssuesRealtime` |

### Onde Colocar

| Elemento          | Localização                    |
| ----------------- | ------------------------------ |
| Server Actions    | `src/app/dashboard/actions.ts` |
| Componentes de UI | `src/components/{feature}/`    |
| Hooks Globais     | `src/lib/hooks/`               |
| Feature Logic     | `src/features/{feature}/`      |
| Types             | `src/types/`                   |

---

## 🔗 Rotas Disponíveis

| Rota                              | Componente                     | Descrição         |
| --------------------------------- | ------------------------------ | ----------------- |
| `/`                               | `app/page.tsx`                 | Landing page      |
| `/login`                          | `app/login/page.tsx`           | Autenticação      |
| `/dashboard`                      | `app/dashboard/page.tsx`       | Home do dashboard |
| `/dashboard/{slug}`               | `[workspaceSlug]/page.tsx`     | Workspace         |
| `/dashboard/{slug}/{id}`          | `[projectIdentifier]/page.tsx` | Projeto           |
| `/dashboard/{slug}/{id}/settings` | `settings/page.tsx`            | ✨ **NOVO**       |

### Query Params (Project Page)

| Param     | Valores                                          | Descrição              |
| --------- | ------------------------------------------------ | ---------------------- |
| `view`    | `overview`, `board`, `list`, `cycles`, `modules` | Visualização ativa     |
| `issueId` | UUID                                             | Abre modal de detalhes |

---

## 🎨 Componentes Chave

### Views do Projeto

```
[projectIdentifier]/page.tsx
    ├── ProjectAnalytics   (view=overview)
    ├── KanbanBoard        (view=board)
    ├── IssueList          (view=list)
    ├── CyclesView         (view=cycles)    ✨ NOVO
    └── ModulesView        (view=modules)   ✨ NOVO
```

### Settings

```
settings/page.tsx (Server)
    └── ProjectSettingsForm (Client)
        ├── General Settings Card
        ├── Team Members Card
        └── Danger Zone Card
            └── Delete Confirmation Modal
```
