# 🚀 KyrieOS (kOS) - Product Requirements Document (PRD)

## 1. Visão Geral

**Nome do Produto:** KyrieOS (kOS) **Objetivo:** Sistema Operacional de Gestão
de Projetos para Agência de Marketing Digital. **Inspiração:** Plane.so, Linear,
Trello. **Usuário Principal:** Equipa interna da Agência Kyrie (Gestores,
Designers, Copywriters). **Meta do MVP:** Substituir o Trello com um sistema
focado em Sprints (Cycles), gestão hierárquica (Modules) e visualização Kanban
de alta performance.

---

## 2. Stack Tecnológica (A "Stack de Ouro")

Este projeto deve seguir estritamente as seguintes tecnologias. Não devem ser
introduzidas bibliotecas externas sem necessidade explícita.

- **Frontend Framework:** Next.js 14+ (App Router).
- **Linguagem:** TypeScript (Strict Mode).
- **Estilização:** Tailwind CSS.
- **Componentes UI:** shadcn/ui (Radix UI por baixo).
- **Ícones:** Lucide React.
- **Backend & Database:** Supabase (PostgreSQL, Auth, Realtime, Storage).
- **Gerenciamento de Estado Global:** Zustand.
- **Gerenciamento de Estado de URL:** Nuqs (Next.js URL Query States).
- **Editor de Texto Rico:** Tiptap.
- **Drag & Drop (Kanban):** dnd-kit (kit moderno e acessível).
- **Validação de Dados:** Zod + React Hook Form.

---

## 3. Arquitetura de Banco de Dados (Supabase/PostgreSQL)

O agente deve criar as tabelas com **RLS (Row Level Security)** habilitado.

### Entidades Principais:

1. **`workspaces`**

- `id`: uuid (PK)
- `name`: text
- `slug`: text (unique)
- `logo_url`: text

2. **`profiles`** (Extensão da tabela `auth.users`)

- `id`: uuid (FK -> auth.users)
- `email`: text
- `full_name`: text
- `avatar_url`: text
- `role`: enum ('admin', 'member', 'client')

3. **`workspace_members`**

- `workspace_id`: uuid (FK)
- `user_id`: uuid (FK)
- `role`: text

4. **`projects`** (ex: "Cliente A", "Marketing Interno")

- `id`: uuid
- `workspace_id`: uuid
- `name`: text
- `identifier`: text (ex: "MKT" para gerar IDs como MKT-12)

5. **`cycles`** (Sprints)

- `id`: uuid
- `project_id`: uuid
- `name`: text (ex: "Sprint 34 - Black Friday")
- `start_date`: date
- `end_date`: date

6. **`modules`** (Grandes entregas/Campanhas)

- `id`: uuid
- `project_id`: uuid
- `name`: text
- `status`: text

7. **`issues`** (Tarefas - O Core)

- `id`: uuid
- `sequence_id`: integer (Autoincrement por projeto)
- `project_id`: uuid
- `workspace_id`: uuid
- `title`: text
- `description`: jsonb (Tiptap JSON)
- `priority`: enum ('urgent', 'high', 'medium', 'low', 'none')
- `status`: text (ligado a uma tabela de estados customizáveis)
- `assignee_id`: uuid (FK -> profiles)
- `cycle_id`: uuid (FK -> cycles, nullable)
- `module_id`: uuid (FK -> modules, nullable)
- `due_date`: date

---

## 4. Funcionalidades do MVP (Fase 1)

### A. Autenticação e Onboarding

- Login via Supabase Auth (Google & Email/Password).
- Criação do primeiro Workspace durante o cadastro.

### B. Gestão de Projetos (Hierarquia)

- **Sidebar de Navegação:** Alternar entre Projetos.
- **Dashboard do Projeto:** Visão geral com estatísticas simples (Issues abertas
  vs. fechadas).

### C. Issue Tracking (Coração do Sistema)

- **Criação Rápida:** Um modal ou input inline para criar tarefas rapidamente.
- **Editor:** Tiptap implementado para descrição das tarefas (suporte a listas,
  bold, upload de imagens via Supabase Storage).
- **Propriedades:** Atribuir responsável, prioridade, data de entrega.

### D. Views (Visualização)

- **List View:** Tabela simples com filtros.
- **Kanban Board:**
- Colunas baseadas no Status.
- Drag and Drop fluido usando `dnd-kit`.
- Atualização em Realtime (outros usuários veem o card mover sem recarregar).

### E. Cycles (Sprints)

- Agrupamento de issues por período de tempo.
- "Burn-down chart" simplificado (progresso da sprint).

---

## 5. UI/UX & Design System

- **Tema:** Dark/Light mode (suporte nativo do shadcn/ui).
- **Layout:**
- **Sidebar Lateral Esquerda:** Colapsável. Contém: Switcher de Workspace, Menu
  (Issues, Cycles, Modules), Lista de Projetos.
- **Main Content:** Área principal de trabalho.

- **Feedback:** Usar `sonner` para toasts (sucesso/erro) em todas as ações de
  CRUD.
- **Performance:** Usar _Optimistic Updates_ (atualizar a UI antes de resposta
  do servidor) para ações como "Mover Card no Kanban".

---

## 6. Regras de Desenvolvimento para a IA (Prompt System)

Copie e cole isso nas "Custom Instructions" ou no início do chat com a IA:

> "Você é um Engenheiro de Software Sênior especialista na stack Next.js +
> Supabase + Tailwind. **Regras de Ouro:**
>
> 1. **Componentes:** Use sempre componentes funcionais do React e a biblioteca
>    `shadcn/ui` para UI. Não invente estilos CSS puros se o Tailwind resolver.
> 2. **Server vs Client:** Use Server Components por padrão. Adicione
>    `'use client'` apenas quando necessário interatividade (hooks, eventos).
> 3. **Supabase:** Use o cliente tipado do Supabase gerado a partir do banco de
>    dados. Sempre implemente tratamento de erros nos calls da API.
> 4. **Dry:** Não repita código. Crie hooks customizados para lógicas
>    repetitivas (ex: `useIssues`, `useWorkspace`).
> 5. **Segurança:** Nunca exponha chaves privadas no frontend. Confie no RLS do
>    Supabase para proteção de dados.
>
> Siga o PRD anexo (KyrieOS) para guiar a arquitetura."

---

## 7. Roteiro de Implementação (Passo a Passo)

Para não confundir a IA, peça uma fase de cada vez:

1. **Fase 0:** Setup do projeto (Next.js + Supabase + Shadcn + Tailwind).
2. **Fase 1:** Modelagem do Banco de Dados no Supabase (Migrations) e setup de
   Autenticação.
3. **Fase 2:** Layout Shell (Sidebar, Header, criação de Workspaces e Projetos).
4. **Fase 3:** CRUD de Issues (Criar, Editar, Deletar) em modo Lista.
5. **Fase 4:** Implementação do Kanban Board (Drag and Drop) e Realtime.
6. **Fase 5:** Implementação de Cycles e Modules.

---

### Como começar agora?

Abra seu editor (Cursor/VS Code), crie um arquivo `PRD.md` com o conteúdo acima.
Em seguida, abra o chat da IA e diga:

_"@PRD.md Leia este documento. Vamos começar pela **Fase 0**. Configure o
projeto Next.js com as bibliotecas listadas na Stack de Ouro."_
