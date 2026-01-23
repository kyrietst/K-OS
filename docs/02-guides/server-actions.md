# 🛠️ Server Actions Reference

> **Última Atualização:** 2026-01-23\
> **Arquivo:** `src/app/dashboard/actions.ts`

Referência de todas as Server Actions disponíveis no KyrieOS.

---

## 📋 Índice

| Action                | Descrição                     | Requer Auth |
| --------------------- | ----------------------------- | ----------- |
| `createWorkspace`     | Cria novo workspace           | ✅          |
| `createProject`       | Cria novo projeto             | ✅          |
| `updateProject`       | Edita nome/descrição          | ✅          |
| `deleteProject`       | Deleta projeto (admin only)   | ✅ Admin    |
| `createIssue`         | Cria nova issue               | ✅          |
| `updateIssueStatus`   | Atualiza status (drag & drop) | ✅          |
| `updateIssueDetails`  | Edita issue completa          | ✅          |
| `deleteIssue`         | Deleta issue                  | ✅          |
| `createCycle`         | Cria novo sprint              | ✅          |
| `createModule`        | Cria novo epic                | ✅          |
| `generateDescription` | AI gera descrição             | ✅          |

---

## 📝 Workspace Actions

### `createWorkspace`

```typescript
createWorkspace(prevState: ActionState, formData: FormData)
```

**FormData:**

- `name` (required) - Nome do workspace

**Comportamento:**

1. Gera slug automaticamente
2. Cria workspace no banco
3. Adiciona criador como admin em `workspace_members`
4. Redireciona para `/dashboard/{slug}`

---

## 📁 Project Actions

### `createProject`

```typescript
createProject(prevState: ActionState, formData: FormData)
```

**FormData:**

- `name` (required) - Nome do projeto
- `identifier` (required) - Ex: "WEB" (convertido para UPPERCASE)
- `workspace_id` (required)

### `updateProject` ✨ NOVO

```typescript
updateProject(prevState: ActionState, formData: FormData)
```

**FormData:**

- `project_id` (required)
- `name` (required)
- `description` (optional)
- `workspace_slug` (required)
- `project_identifier` (required)

**Retorno:**

- `{ message: 'success' }` ou erros de validação

### `deleteProject` ✨ NOVO

```typescript
deleteProject(prevState: ActionState, formData: FormData)
```

**FormData:**

- `project_id` (required)
- `confirmation` (required) - Deve coincidir com `project_identifier`
- `project_identifier` (required)
- `workspace_slug` (required)

**Segurança:**

1. Verifica se usuário está autenticado
2. Verifica se `confirmation === project_identifier`
3. Verifica se usuário é `admin` do workspace
4. Deleta em cascata: issues → cycles → modules → project
5. Redireciona para `/dashboard/{workspace_slug}`

---

## 🎫 Issue Actions

### `createIssue`

```typescript
createIssue(prevState: ActionState, formData: FormData)
```

**FormData:**

- `title` (required)
- `description` (optional)
- `priority` (optional) - urgent, high, medium, low, none
- `project_id`, `workspace_id`, `workspace_slug`, `project_identifier`

**Comportamento:**

- Gera `sequence_id` automático (MAX + 1)
- Define `status: 'backlog'` por padrão
- Atribui `assignee_id` ao criador

### `updateIssueStatus`

```typescript
updateIssueStatus(
  issueId: string, 
  newStatus: string, 
  workspaceSlug: string, 
  projectIdentifier: string
)
```

Usado pelo Kanban Board para drag & drop.

### `updateIssueDetails`

```typescript
updateIssueDetails(prevState: ActionState, formData: FormData)
```

**FormData:**

- `issue_id`, `project_identifier`, `workspace_slug`
- `title`, `description`, `status`, `priority`
- `assignee_id` (use "unassigned" para remover)
- `cycle_id` (use "none" para remover)
- `module_id` (use "none" para remover)
- `due_date`

### `deleteIssue`

```typescript
deleteIssue(
  workspaceSlug: string,
  projectIdentifier: string,
  issueId: string
)
```

Verifica se rows foram deletadas para confirmar sucesso.

---

## 🔄 Cycle Actions

### `createCycle`

```typescript
createCycle(prevState: ActionState, formData: FormData)
```

**FormData:**

- `name` (required)
- `start_date` (required)
- `end_date` (required) - Deve ser > start_date
- `project_id`, `project_identifier`, `workspace_slug`

---

## 📦 Module Actions

### `createModule`

```typescript
createModule(prevState: ActionState, formData: FormData)
```

**FormData:**

- `name` (required)
- `description` (optional)
- `status` (optional) - backlog, planned, in-progress, paused, completed,
  canceled
- `start_date` (optional)
- `target_date` (optional)
- `project_id`, `project_identifier`, `workspace_slug`

---

## 🤖 AI Actions

### `generateDescription`

```typescript
generateDescription(title: string): Promise<string>
```

Gera descrição técnica usando OpenRouter (DeepSeek/Gemini fallback).

**Retorno:**

- Markdown com `<think>` tags para Chain of Thought
- Formato: Contexto, Critérios de Aceite, Passos Técnicos

---

## 🔧 Padrões de Uso

### Com `useActionState` (React 19)

```tsx
"use client";
import { useActionState } from "react";
import { ActionState, createProject } from "@/app/dashboard/actions";

const initialState: ActionState = { message: "", errors: {} };

function MyForm() {
    const [state, formAction, isPending] = useActionState(
        createProject,
        initialState,
    );

    return (
        <form action={formAction}>
            {/* inputs */}
            <Button type="submit" isPending={isPending}>Save</Button>
            {state.message && <p>{state.message}</p>}
        </form>
    );
}
```

### Chamada Direta (sem form)

```tsx
import { updateIssueStatus } from "@/app/dashboard/actions";

async function handleDragEnd(issueId: string, newStatus: string) {
    await updateIssueStatus(
        issueId,
        newStatus,
        workspaceSlug,
        projectIdentifier,
    );
}
```
