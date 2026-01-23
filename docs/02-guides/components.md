# 🧩 Components Reference

> **Última Atualização:** 2026-01-23

Referência rápida dos componentes do KyrieOS.

---

## 📦 Kanban

### `KanbanBoard`

Board principal com Drag & Drop e Realtime.

```typescript
// src/components/kanban/kanban-board.tsx

interface KanbanBoardProps {
    initialIssues: IssueWithAssignee[];
    workspaceSlug: string;
    projectIdentifier: string;
    projectId: string;
}
```

**Features:**

- ✅ Drag & Drop via `@dnd-kit`
- ✅ Realtime sync via `useIssuesRealtime`
- ✅ Optimistic updates
- ✅ Toast feedback (sonner)
- ✅ 5 colunas: Backlog, Todo, In Progress, Done, Canceled

---

### `KanbanCard`

Card draggável representando uma issue.

```typescript
// src/components/kanban/kanban-card.tsx

interface KanbanCardProps {
    issue: IssueWithAssignee;
    projectIdentifier: string;
}
```

**Exibe:**

- Título da issue
- ID sequencial (ex: `MKT-1`)
- Avatar do assignee
- Chip de prioridade

---

## 📝 Issues

### `CreateIssueModal`

Modal para criar novas issues.

```typescript
interface CreateIssueModalProps {
    workspaceSlug: string;
    projectIdentifier: string;
    projectId: string;
    workspaceId: string;
}
```

### `IssueDetailsModal`

Modal para visualizar/editar detalhes de uma issue.

```typescript
interface IssueDetailsModalProps {
    issue: Issue | null;
    isOpen: boolean;
    workspaceSlug: string;
    projectIdentifier: string;
    profiles: Profile[];
    cycles: Cycle[];
    modules: Module[];
}
```

### `IssueList`

Lista de issues em formato tabular.

```typescript
interface IssueListProps {
    issues: Issue[];
    projectIdentifier: string;
}
```

---

## 📊 Analytics

### `ProjectAnalytics`

Dashboard de analytics do projeto.

```typescript
interface ProjectAnalyticsProps {
    data: {
        totalIssues: number;
        issuesByStatus: Record<string, number>;
        issuesByPriority: Record<string, number>;
        recentActivity: Activity[];
    };
}
```

**Features:**

- KPI cards
- Gráfico de status (recharts)
- Gráfico de prioridade (recharts)
- Lista de atividade recente

---

## 🔄 Cycles ✨ ATUALIZADO

### `CycleCard`

Card de cycle com status temporal e barra de progresso.

```typescript
// src/components/cycles/cycle-card.tsx

interface CycleCardProps {
    cycle: Cycle;
    cycleIssues: Issue[];
}
```

**Features:**

- ✅ Status temporal (Ativo/Passado/Futuro)
- ✅ Barra de progresso calculada
- ✅ Datas formatadas PT-BR
- ✅ Glassmorphism design

### `CyclesView`

Grid de cycles com empty state.

```typescript
// src/components/cycles/cycles-view.tsx

interface CyclesViewProps {
    cycles: Cycle[];
    issues: Issue[];
    workspaceSlug: string;
    projectIdentifier: string;
    projectId: string;
}
```

**Features:**

- ✅ Grid responsivo (1-3 colunas)
- ✅ Botão "New Cycle"
- ✅ Empty state ilustrado
- ✅ Modal de criação embutido

---

## 📦 Modules ✨ ATUALIZADO

### `ModuleCard`

Card de module com status workflow e barra de progresso.

```typescript
// src/components/modules/module-card.tsx

interface ModuleCardProps {
    module: Module;
    moduleIssues: Issue[];
}
```

**Features:**

- ✅ Status workflow (Backlog/In Progress/Done/Canceled)
- ✅ Descrição truncada
- ✅ Timeline (start_date → target_date)
- ✅ Barra de progresso calculada

### `ModulesView`

Grid de modules com empty state.

```typescript
// src/components/modules/modules-view.tsx

interface ModulesViewProps {
    modules: Module[];
    issues: Issue[];
    workspaceSlug: string;
    projectIdentifier: string;
    projectId: string;
}
```

**Features:**

- ✅ Grid responsivo
- ✅ Botão "Novo Module"
- ✅ Empty state ilustrado
- ✅ Modal de criação com bug fix do Select

---

## ⚙️ Settings ✨ NOVO

### `ProjectSettingsForm`

Formulário de configurações do projeto.

```typescript
// src/app/dashboard/[workspaceSlug]/[projectIdentifier]/settings/project-settings-form.tsx

interface ProjectSettingsFormProps {
    project: Project;
    workspace: { id: string; name: string };
    members: Member[];
    workspaceSlug: string;
    projectIdentifier: string;
}
```

**Cards:**

| Card             | Descrição                       |
| ---------------- | ------------------------------- |
| General Settings | Editar nome e descrição         |
| Team Members     | Lista com avatars e roles       |
| Danger Zone      | Delete com modal de confirmação |

---

## 🏠 Dashboard

### `Sidebar`

Barra lateral de navegação.

```typescript
interface SidebarProps {
    user: {
        id: string;
        email: string;
        name: string;
        avatar: string | null;
    };
}
```

**Features:**

- Logo KyrieOS
- Navegação (Visão Geral, Tarefas, Ciclos)
- User profile com dados reais
- Botão de logout

---

## ✏️ UI Primitives

### `RichEditor`

Editor de texto rico baseado em Tiptap.

```typescript
// src/components/ui/rich-editor.tsx

interface RichEditorProps {
    content?: string;
    onChange?: (content: string) => void;
    placeholder?: string;
}
```

---

## 📋 Padrões de Uso

### View Component Pattern

```tsx
// View recebe dados e renderiza cards
interface ViewProps {
    items: Item[]; // Dados principais
    issues: Issue[]; // Para calcular progresso
    workspaceSlug: string; // Para navegação
    projectIdentifier: string;
    projectId: string; // Para Server Actions
}

// Card recebe item individual + issues filtradas
interface CardProps {
    item: Item;
    itemIssues: Issue[]; // Já filtradas pelo parent
}
```

### Cálculo de Progresso

```typescript
const totalIssues = issues.length;
const doneIssues = issues.filter((i) => i.status === "done").length;
const progress = totalIssues > 0
    ? Math.round((doneIssues / totalIssues) * 100)
    : 0;
```

### Client Component com Realtime

```tsx
"use client";

import { useIssuesRealtime } from "@/hooks/use-issues-realtime";
import { toast } from "sonner";

export default function MyComponent({ initialData, projectId }) {
    const { issues, optimisticUpdate, rollback } = useIssuesRealtime({
        initialIssues: initialData,
        projectId,
    });

    const handleAction = async () => {
        optimisticUpdate(id, { field: newValue });
        try {
            await serverAction(id, newValue);
            toast.success("Updated!");
        } catch {
            rollback(id, { field: oldValue });
            toast.error("Failed");
        }
    };

    return <div>...</div>;
}
```

### Server Component que passa dados

```tsx
// page.tsx (Server Component)
export default async function Page({ params }) {
    const supabase = await createClient();
    const { data } = await supabase.from("issues").select("*");

    return <ClientComponent initialData={data} projectId={params.id} />;
}
```
