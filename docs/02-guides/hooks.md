# 🪝 Hooks Reference

> **Última Atualização:** 2026-01-23

Documentação dos custom hooks do KyrieOS.

---

## 📂 Localização

```
src/hooks/
└── use-issues-realtime.ts    # Realtime sync para issues
```

---

## `useIssuesRealtime`

Hook para sincronização em tempo real das issues via Supabase Realtime.

### Import

```typescript
import {
    IssueWithAssignee,
    useIssuesRealtime,
} from "@/hooks/use-issues-realtime";
```

### Assinatura

```typescript
function useIssuesRealtime(options: {
    initialIssues: IssueWithAssignee[];
    projectId: string;
}): {
    issues: IssueWithAssignee[];
    optimisticUpdate: (issueId: string, updates: Partial<IssueRow>) => void;
    rollback: (issueId: string, originalData: Partial<IssueRow>) => void;
};
```

### Parâmetros

| Parâmetro       | Tipo                  | Descrição                               |
| --------------- | --------------------- | --------------------------------------- |
| `initialIssues` | `IssueWithAssignee[]` | Issues carregadas pelo Server Component |
| `projectId`     | `string`              | UUID do projeto para filtrar eventos    |

### Retorno

| Campo              | Tipo       | Descrição                               |
| ------------------ | ---------- | --------------------------------------- |
| `issues`           | `array`    | Lista atualizada em tempo real          |
| `optimisticUpdate` | `function` | Atualiza UI antes do servidor responder |
| `rollback`         | `function` | Reverte atualização em caso de erro     |

### Exemplo

```typescript
export default function KanbanBoard({ initialIssues, projectId }) {
    const { issues, optimisticUpdate, rollback } = useIssuesRealtime({
        initialIssues,
        projectId,
    });

    const handleDragEnd = async (event) => {
        const issueId = event.active.id;
        const newStatus = event.over.id;
        const oldStatus = issues.find((i) => i.id === issueId)?.status;

        // Optimistic update
        optimisticUpdate(issueId, { status: newStatus });

        try {
            await updateIssueStatus(issueId, newStatus);
            toast.success("Moved!");
        } catch {
            rollback(issueId, { status: oldStatus });
            toast.error("Failed");
        }
    };

    return <DndContext onDragEnd={handleDragEnd}>...</DndContext>;
}
```

### Type: `IssueWithAssignee`

```typescript
interface IssueWithAssignee extends Database['public']['Tables']['issues']['Row'] {
  assignee?: {
    full_name: string | null
    email: string
  } | null
}
```

---

## Hooks Planejados (Futuro)

| Hook                 | Propósito                      | Status |
| -------------------- | ------------------------------ | ------ |
| `useCyclesRealtime`  | Realtime para cycles           | ❌     |
| `useModulesRealtime` | Realtime para modules          | ❌     |
| `useWorkspace`       | Dados do workspace atual       | ❌     |
| `useProjects`        | Lista de projetos do workspace | ❌     |

---

## Padrões de Hooks

### Naming

- Prefix `use` obrigatório
- Nome descritivo do recurso
- Sufixo `Realtime` para hooks de tempo real

### Estrutura Recomendada

```typescript
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFeatureRealtime(options) {
  const [data, setData] = useState(options.initialData)
  const supabase = createClient()

  // Sync with server data
  useEffect(() => {
    setData(options.initialData)
  }, [options.initialData])

  // Subscribe to realtime
  useEffect(() => {
    const channel = supabase.channel('...')
      .on('postgres_changes', { ... }, handleChange)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [supabase])

  const optimisticUpdate = useCallback((id, updates) => {
    setData(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ))
  }, [])

  const rollback = useCallback((id, original) => {
    setData(prev => prev.map(item =>
      item.id === id ? { ...item, ...original } : item
    ))
  }, [])

  return { data, optimisticUpdate, rollback }
}
```
