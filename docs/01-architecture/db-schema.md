# 🗄️ Database Schema

> **Última Atualização:** 2026-01-23\
> **Database:** Supabase PostgreSQL\
> **Project ID:** `jxkmmdmpmrhwxibalmkc`

Este documento descreve o schema do banco de dados do KyrieOS, **validado via
MCP**.

---

## 📊 Diagrama de Relacionamentos

```
┌─────────────┐     ┌─────────────────────┐     ┌─────────────┐
│  profiles   │────<│  workspace_members  │>────│  workspaces │
└─────────────┘     └─────────────────────┘     └──────┬──────┘
       │                                               │
       │                                               │
       │            ┌─────────────────┐               │
       │            │    projects     │<──────────────┘
       │            └────────┬────────┘
       │                     │
       │     ┌───────────────┼───────────────┐
       │     │               │               │
       │     ▼               ▼               ▼
       │  ┌──────┐      ┌─────────┐     ┌─────────┐
       │  │cycles│      │ issues  │     │ modules │
       │  └──────┘      └────┬────┘     └─────────┘
       │                     │
       └─────────────────────┘ (assignee_id)
```

---

## 📋 Tabelas (Validadas via MCP)

### `profiles`

Extensão da tabela `auth.users` do Supabase.

| Coluna       | Tipo        | Nullable | Default                  | Descrição              |
| ------------ | ----------- | -------- | ------------------------ | ---------------------- |
| `id`         | uuid        | No       | —                        | PK, FK para auth.users |
| `email`      | text        | No       | —                        | Email do usuário       |
| `full_name`  | text        | Yes      | —                        | Nome completo          |
| `avatar_url` | text        | Yes      | —                        | URL do avatar          |
| `role`       | user_role   | Yes      | `'member'`               | admin, member, client  |
| `created_at` | timestamptz | No       | `timezone('utc', now())` | Data de criação        |
| `updated_at` | timestamptz | No       | `timezone('utc', now())` | Última atualização     |

### `workspaces`

Organizações/equipes.

| Coluna       | Tipo        | Nullable | Default                  | Descrição           |
| ------------ | ----------- | -------- | ------------------------ | ------------------- |
| `id`         | uuid        | No       | `gen_random_uuid()`      | PK                  |
| `name`       | text        | No       | —                        | Nome do workspace   |
| `slug`       | text        | No       | — (unique)               | Slug único para URL |
| `logo_url`   | text        | Yes      | —                        | URL do logo         |
| `created_by` | uuid        | Yes      | —                        | FK para profiles    |
| `created_at` | timestamptz | No       | `timezone('utc', now())` | Data de criação     |

> [!IMPORTANT]
> A coluna é `created_by`, **NÃO** `owner_id`. Use `created_by` ao inserir
> workspaces.

### `workspace_members`

Relacionamento N:N entre users e workspaces.

| Coluna         | Tipo        | Nullable | Default             | Descrição          |
| -------------- | ----------- | -------- | ------------------- | ------------------ |
| `id`           | uuid        | No       | `gen_random_uuid()` | PK                 |
| `workspace_id` | uuid        | No       | —                   | FK para workspaces |
| `user_id`      | uuid        | No       | —                   | FK para profiles   |
| `role`         | user_role   | No       | `'member'`          | admin, member      |
| `created_at`   | timestamptz | No       | —                   | Data de entrada    |

> [!NOTE]
> A coluna é `created_at`, **NÃO** `joined_at`. Use `created_at` em queries.

### `projects`

Projetos dentro de um workspace.

| Coluna            | Tipo        | Nullable | Default                  | Descrição                   |
| ----------------- | ----------- | -------- | ------------------------ | --------------------------- |
| `id`              | uuid        | No       | `gen_random_uuid()`      | PK                          |
| `workspace_id`    | uuid        | No       | —                        | FK para workspaces          |
| `name`            | text        | No       | —                        | Nome do projeto             |
| `identifier`      | text        | No       | —                        | Ex: "MKT" para MKT-1, MKT-2 |
| `description`     | text        | Yes      | —                        | Descrição                   |
| `emoji`           | text        | Yes      | —                        | Emoji opcional              |
| `cover_image_url` | text        | Yes      | —                        | URL da capa                 |
| `created_at`      | timestamptz | No       | `timezone('utc', now())` | Data de criação             |

### `cycles`

Sprints/iterações de um projeto.

| Coluna       | Tipo        | Nullable | Default                  | Descrição        |
| ------------ | ----------- | -------- | ------------------------ | ---------------- |
| `id`         | uuid        | No       | `gen_random_uuid()`      | PK               |
| `project_id` | uuid        | No       | —                        | FK para projects |
| `name`       | text        | No       | —                        | Nome do cycle    |
| `start_date` | date        | Yes      | —                        | Data de início   |
| `end_date`   | date        | Yes      | —                        | Data de fim      |
| `created_at` | timestamptz | No       | `timezone('utc', now())` | Data de criação  |

### `modules`

Epics/grandes funcionalidades.

| Coluna        | Tipo        | Nullable | Default                  | Descrição                  |
| ------------- | ----------- | -------- | ------------------------ | -------------------------- |
| `id`          | uuid        | No       | `gen_random_uuid()`      | PK                         |
| `project_id`  | uuid        | No       | —                        | FK para projects           |
| `name`        | text        | No       | —                        | Nome do module             |
| `description` | text        | Yes      | —                        | Descrição                  |
| `status`      | text        | Yes      | —                        | Backlog, In Progress, Done |
| `start_date`  | date        | Yes      | —                        | Data de início             |
| `target_date` | date        | Yes      | —                        | Data alvo                  |
| `created_at`  | timestamptz | No       | `timezone('utc', now())` | Data de criação            |

### `issues`

Tarefas/tickets - coração do sistema.

| Coluna         | Tipo        | Nullable | Default                  | Descrição                                  |
| -------------- | ----------- | -------- | ------------------------ | ------------------------------------------ |
| `id`           | uuid        | No       | `gen_random_uuid()`      | PK                                         |
| `sequence_id`  | bigint      | No       | IDENTITY BY DEFAULT      | ID sequencial por projeto                  |
| `project_id`   | uuid        | No       | —                        | FK para projects                           |
| `workspace_id` | uuid        | No       | —                        | FK para workspaces                         |
| `title`        | text        | No       | —                        | Título da issue                            |
| `description`  | jsonb       | Yes      | —                        | Conteúdo Tiptap em JSON                    |
| `priority`     | priority    | Yes      | `'none'`                 | urgent, high, medium, low, none            |
| `status`       | text        | Yes      | `'backlog'`              | backlog, todo, in-progress, done, canceled |
| `assignee_id`  | uuid        | Yes      | —                        | FK para profiles                           |
| `cycle_id`     | uuid        | Yes      | —                        | FK para cycles                             |
| `module_id`    | uuid        | Yes      | —                        | FK para modules                            |
| `due_date`     | date        | Yes      | —                        | Data de entrega                            |
| `created_at`   | timestamptz | No       | `timezone('utc', now())` | Data de criação                            |
| `updated_at`   | timestamptz | No       | `timezone('utc', now())` | Última atualização                         |

---

### `contracts`

Contratos de clientes para análise financeira.

| Coluna          | Tipo          | Nullable | Default             | Descrição          |
| --------------- | ------------- | -------- | ------------------- | ------------------ |
| `id`            | uuid          | No       | `gen_random_uuid()` | PK                 |
| `workspace_id`  | uuid          | No       | —                   | FK para workspaces |
| `client_name`   | text          | No       | —                   | Nome do cliente    |
| `monthly_value` | decimal(10,2) | No       | —                   | Valor mensal       |
| `start_date`    | date          | No       | —                   | Início do contrato |
| `is_active`     | boolean       | Yes      | `true`              | Contrato ativo?    |

### `worklogs`

Registro de horas para comparação com receita.

| Coluna      | Tipo         | Nullable | Default             | Descrição                 |
| ----------- | ------------ | -------- | ------------------- | ------------------------- |
| `id`        | uuid         | No       | `gen_random_uuid()` | PK                        |
| `issue_id`  | uuid         | Yes      | —                   | FK para issues (opcional) |
| `user_id`   | uuid         | No       | —                   | FK para profiles          |
| `hours`     | decimal(5,2) | No       | —                   | Horas trabalhadas         |
| `logged_at` | timestamptz  | No       | `now()`             | Data do registro          |

### `jobs`

Persistência de tarefas assíncronas (Jobs) do Intelligence Engine.

| Coluna       | Tipo        | Nullable | Default                  | Descrição                   |
| ------------ | ----------- | -------- | ------------------------ | --------------------------- |
| `id`         | uuid        | No       | `gen_random_uuid()`      | PK                          |
| `type`       | text        | No       | —                        | Ex: 'cfo_analysis'          |
| `status`     | text        | No       | `'pending'`              | pending, running, completed |
| `result`     | jsonb       | Yes      | —                        | Resultado (findings)        |
| `error`      | text        | Yes      | —                        | Mensagem de erro            |
| `created_at` | timestamptz | No       | `timezone('utc', now())` |                             |

### `ai_actions`

Audit Log de decisões tomadas pelos agentes.

| Coluna       | Tipo | Nullable | Default             | Descrição                      |
| ------------ | ---- | -------- | ------------------- | ------------------------------ |
| `id`         | uuid | No       | `gen_random_uuid()` | PK                             |
| `agent_name` | text | No       | —                   | Ex: 'CFOAgent'                 |
| `action`     | text | No       | —                   | Ex: 'budget_alert'             |
| `reasoning`  | text | No       | —                   | Explicação do raciocínio (CoT) |
| `status`     | text | No       | `'pending'`         | Estado da ação                 |

---

## 🔒 Row Level Security (RLS)

Todas as tabelas têm RLS habilitado.

### Policy Padrão

```sql
-- Acesso total para usuários autenticados
CREATE POLICY "Allow all access to authenticated users"
ON [table_name] FOR ALL
USING (auth.role() = 'authenticated');
```

---

## 📡 Realtime

### Tabelas com Realtime Habilitado

| Tabela    | Status            |
| --------- | ----------------- |
| `issues`  | ✅ Habilitado     |
| `cycles`  | ❌ Não habilitado |
| `modules` | ❌ Não habilitado |

### Habilitar Realtime

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE [table_name];
```

---

## 🎯 Enums

### `priority`

```sql
CREATE TYPE priority AS ENUM ('urgent', 'high', 'medium', 'low', 'none');
```

### `user_role`

```sql
CREATE TYPE user_role AS ENUM ('admin', 'member', 'client');
```

---

## 🔧 Comandos Úteis

### Regenerar Types (Local)

```bash
# Com CLI instalado localmente
$env:SUPABASE_ACCESS_TOKEN="sbp_c58e1d81530976169f35b9f0e4ec28a166315435"
npx supabase gen types typescript --project-id jxkmmdmpmrhwxibalmkc > src/types/supabase.ts
```

### Regenerar Types (MCP)

Use a ferramenta `generate_typescript_types` do MCP `supabase-kyrie`:

```
mcp_supabase-kyrie_generate_typescript_types(project_id: "jxkmmdmpmrhwxibalmkc")
```

### Verificar Schema (MCP)

```
mcp_supabase-kyrie_list_tables(project_id: "jxkmmdmpmrhwxibalmkc", schemas: ["public"])
```

---

## ⚠️ Gotchas Comuns

| Problema              | Causa              | Solução                                 |
| --------------------- | ------------------ | --------------------------------------- |
| `owner_id` not found  | Coluna não existe  | Use `created_by` para workspaces        |
| `joined_at` not found | Coluna não existe  | Use `created_at` para workspace_members |
| Types não atualizados | Arquivo corrompido | Regenere via MCP ou CLI                 |
| RLS blocking queries  | Policy não existe  | Verifique se RLS está configurado       |
