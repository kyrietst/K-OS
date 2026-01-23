# 🔴 Realtime Implementation Guide

> **Última Atualização:** 2026-01-23\
> **Status:** ✅ Funcional para tabela `issues`

Este documento descreve a implementação de Supabase Realtime no KyrieOS.

---

## 📂 Arquivos Chave

| Arquivo                                  | Propósito                     |
| ---------------------------------------- | ----------------------------- |
| `src/hooks/use-issues-realtime.ts`       | Hook principal de Realtime    |
| `src/components/kanban/kanban-board.tsx` | Integração no Kanban          |
| `src/lib/supabase/client.ts`             | Cliente Browser para Realtime |

---

## 🏗️ Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User A        │     │   Supabase      │     │   User B        │
│   (Browser)     │     │   Realtime      │     │   (Browser)     │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │ 1. Drag card          │                       │
         │────────────────────>  │                       │
         │                       │                       │
         │ 2. Server Action      │                       │
         │    UPDATE issues      │                       │
         │                       │                       │
         │                       │ 3. Broadcast          │
         │                       │────────────────────>  │
         │                       │                       │
         │                       │     4. UI Update      │
         │                       │                       │
```

---

## 🔧 Habilitação no Banco

A tabela `issues` foi adicionada à publication do Realtime:

```sql
-- Executado via migration
ALTER PUBLICATION supabase_realtime ADD TABLE issues;
```

### Verificar se está habilitado:

```sql
SELECT pubname, schemaname, tablename
FROM pg_publication_tables
WHERE tablename = 'issues';

-- Resultado esperado:
-- pubname: supabase_realtime
-- schemaname: public  
-- tablename: issues
```

---

## 🪝 Hook `useIssuesRealtime`

### Localização

`src/hooks/use-issues-realtime.ts`

### Interface

```typescript
interface UseIssuesRealtimeOptions {
    initialIssues: IssueWithAssignee[];
    projectId: string;
}

function useIssuesRealtime(options: UseIssuesRealtimeOptions): {
    issues: IssueWithAssignee[];
    optimisticUpdate: (issueId: string, updates: Partial<IssueRow>) => void;
    rollback: (issueId: string, originalData: Partial<IssueRow>) => void;
};
```

### Uso

```typescript
const { issues, optimisticUpdate, rollback } = useIssuesRealtime({
    initialIssues,
    projectId,
});
```

### Funcionamento Interno

1. **Inicialização:** Recebe `initialIssues` do Server Component
2. **Subscription:** Inscreve no canal `issues-realtime-{projectId}`
3. **Eventos:** Escuta INSERT, UPDATE, DELETE
4. **Merge:** Atualiza estado local mantendo dados existentes (ex: assignee)

---

## 📡 Canal de Subscription

```typescript
supabase
    .channel(`issues-realtime-${projectId}`)
    .on(
        "postgres_changes",
        {
            event: "*", // INSERT, UPDATE, DELETE
            schema: "public",
            table: "issues",
            filter: `project_id=eq.${projectId}`,
        },
        handleRealtimeChange,
    )
    .subscribe();
```

---

## 🔄 Tratamento de Eventos

### INSERT

```typescript
if (eventType === "INSERT") {
    const newIssue = payload.new as IssueRow;

    // Evita duplicatas (optimistic update pode ter adicionado)
    setIssues((prev) => {
        if (prev.some((i) => i.id === newIssue.id)) return prev;
        return [{ ...newIssue, assignee: null }, ...prev];
    });
}
```

### UPDATE

```typescript
if (eventType === "UPDATE") {
    const updatedIssue = payload.new as IssueRow;

    setIssues((prev) =>
        prev.map((issue) => {
            if (issue.id === updatedIssue.id) {
                return {
                    ...issue,
                    ...updatedIssue,
                    assignee: issue.assignee, // Preserva dados existentes
                };
            }
            return issue;
        })
    );
}
```

### DELETE

```typescript
if (eventType === "DELETE") {
    const deletedIssue = payload.old as IssueRow;
    setIssues((prev) => prev.filter((issue) => issue.id !== deletedIssue.id));
}
```

---

## ⚡ Optimistic Updates

O hook fornece funções para atualização otimista:

```typescript
// No handleDragEnd do Kanban:
const oldStatus = currentIssue.status

// 1. Atualiza UI imediatamente
optimisticUpdate(issueId, { status: newStatus })

try {
  // 2. Persiste no servidor
  await updateIssueStatus(issueId, newStatus, ...)

  toast.success('Moved!')
} catch (e) {
  // 3. Rollback se falhar
  rollback(issueId, { status: oldStatus })
  toast.error('Failed to move')
}
```

---

## 🔒 Segurança RLS

A policy de RLS da tabela `issues` permite que usuários autenticados escutem
mudanças:

```sql
-- Policy existente
CREATE POLICY "Allow all access to authenticated users"
ON issues FOR ALL
USING (auth.role() = 'authenticated');
```

---

## 📋 Expansão para Outras Tabelas

Para habilitar Realtime em outras tabelas:

### 1. Adicionar à publication

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE cycles;
ALTER PUBLICATION supabase_realtime ADD TABLE modules;
```

### 2. Criar hook específico

```typescript
// src/hooks/use-cycles-realtime.ts
export function useCyclesRealtime({ initialCycles, projectId }) {
    // Similar ao useIssuesRealtime
}
```

---

## ⚠️ Limitações Conhecidas

| Limitação                   | Workaround                          |
| --------------------------- | ----------------------------------- |
| Payload não inclui JOINs    | Preservar dados existentes no merge |
| Sem ordenação em tempo real | Reordenar depois do merge           |
| Limite de conexões          | Usar um canal por projeto           |

---

## 🧪 Teste Manual

1. Abra 2 abas do navegador no mesmo projeto
2. Na Aba A: Arraste um card no Kanban
3. Na Aba B: Card deve mover automaticamente
4. Verifique console: `[Realtime] Subscribed to issues channel`
