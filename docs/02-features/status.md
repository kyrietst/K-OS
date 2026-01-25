# 📊 Feature Status

> **Última Atualização:** 2026-01-25 **Fonte:** Estado atual do código em `src/`

Este documento lista o status atual das features do KyrieOS.

---

## 🎯 Legenda

| Símbolo | Significado               |
| ------- | ------------------------- |
| ✅      | Completo e funcional      |
| 🔶      | Parcialmente implementado |
| ❌      | Não iniciado              |
| 🔄      | Em progresso              |

---

## 📋 Fases do PRD vs Realidade

### Fase 0: Setup Inicial

| Feature                    | PRD | Status | Notas                     |
| -------------------------- | --- | ------ | ------------------------- |
| Next.js 16+ com App Router | Sim | ✅     | v16.1.1 instalado         |
| TypeScript Strict          | Sim | ✅     |                           |
| Tailwind CSS v4            | Sim | ✅     | Com Ambient Lights        |
| HeroUI v3                  | Sim | ✅     | v3.0.0-beta.3             |
| shadcn/ui                  | Sim | ❌     | Removido intencionalmente |
| Supabase Auth (Client)     | Sim | ✅     | Login + Logout funcional  |

---

### Fase 1: Modelagem de Dados & Auth

| Feature                    | PRD | Status | Notas                      |
| -------------------------- | --- | ------ | -------------------------- |
| Tabela `workspaces`        | Sim | ✅     |                            |
| Tabela `profiles`          | Sim | ✅     |                            |
| Tabela `workspace_members` | Sim | ✅     |                            |
| Tabela `projects`          | Sim | ✅     |                            |
| Tabela `cycles`            | Sim | ✅     | start_date, end_date       |
| Tabela `modules`           | Sim | ✅     | start_date, target_date    |
| Tabela `issues`            | Sim | ✅     | Com sequence_id + Realtime |
| RLS habilitado             | Sim | ✅     | Todas as tabelas           |
| Supabase Auth (Email)      | Sim | ✅     | Login + Logout funcional   |
| Supabase Auth (Google)     | Sim | ✅     | `signInWithGoogleAction`   |

---

### Fase 2: Layout Shell

| Feature                  | PRD | Status | Notas                   |
| ------------------------ | --- | ------ | ----------------------- |
| Sidebar colapsável       | Sim | ✅     | Funcional `sidebar.tsx` |
| Glassmorphism Design     | Sim | ✅     | Com Ambient Lights      |
| Workspace Switcher       | Sim | ✅     |                         |
| Navegação entre Projetos | Sim | ✅     | Via URL params          |
| User Profile na Sidebar  | Sim | ✅     | Dados reais do Supabase |
| Botão de Logout          | Sim | ✅     | signOutAction funcional |

---

### Fase 3: CRUD de Projetos & Issues

| Feature                | PRD | Status | Notas                |
| ---------------------- | --- | ------ | -------------------- |
| Criar Workspace        | Sim | ✅     |                      |
| Listar Workspaces      | Sim | ✅     |                      |
| Criar Projeto          | Sim | ✅     |                      |
| Listar Projetos        | Sim | ✅     |                      |
| **Editar Projeto**     | Sim | ✅     | **NOVO** Settings    |
| **Deletar Projeto**    | Sim | ✅     | **NOVO** Danger Zone |
| Criar Issue            | Sim | ✅     | Com modal            |
| Listar Issues          | Sim | ✅     | List view            |
| Editar Issue           | Sim | ✅     | Modal com detalhes   |
| Deletar Issue          | Sim | ✅     | Com confirmação      |
| Sequential IDs (MKT-1) | Sim | ✅     | Implementado         |

---

### Fase 4: Kanban Board

| Feature              | PRD | Status | Notas                    |
| -------------------- | --- | ------ | ------------------------ |
| Visualização Kanban  | Sim | ✅     | 5 colunas de status      |
| Drag & Drop          | Sim | ✅     | `@dnd-kit`               |
| Atualização otimista | Sim | ✅     | Via `optimisticUpdate()` |
| Realtime updates     | Sim | ✅     | `useIssuesRealtime` hook |
| Toast feedback       | Sim | ✅     | `sonner` success/error   |

---

### Fase 5: Cycles (Sprints)

| Feature                | PRD | Status | Notas                        |
| ---------------------- | --- | ------ | ---------------------------- |
| CRUD de Cycles         | Sim | ✅     |                              |
| **Cycles View**        | Sim | ✅     | **NOVO** Cards com progresso |
| Associar Issue a Cycle | Sim | ✅     | Via modal                    |
| Barra de Progresso     | Sim | ✅     | **NOVO** Calculada           |
| Burn-down chart        | Sim | ❌     | Não implementado             |

---

### Fase 6: Modules (Epics)

| Feature                 | PRD | Status | Notas                       |
| ----------------------- | --- | ------ | --------------------------- |
| CRUD de Modules         | Sim | ✅     |                             |
| **Modules View**        | Sim | ✅     | **NOVO** Cards com workflow |
| Associar Issue a Module | Sim | ✅     | Via modal                   |
| **Barra de Progresso**  | Sim | ✅     | **NOVO** Calculada          |
| Status Workflow         | Sim | ✅     | Backlog/In Progress/Done    |

---

### Fase 7: Analytics

| Feature             | PRD | Status | Notas                  |
| ------------------- | --- | ------ | ---------------------- |
| Overview tab        | Sim | ✅     |                        |
| Gráficos (recharts) | Sim | ✅     | Status/Priority charts |
| KPIs                | Sim | ✅     | Cards de métricas      |

---

### Fase 8: Project Settings ✨ NOVO

| Feature               | PRD | Status | Notas                  |
| --------------------- | --- | ------ | ---------------------- |
| **Settings Page**     | Sim | ✅     | **NOVO** Rota dedicada |
| Editar Nome/Descrição | Sim | ✅     | updateProject action   |
| Listar Membros        | Sim | ✅     | Com avatar e role      |
| **Danger Zone**       | Sim | ✅     | **NOVO** Delete seguro |
| Modal de Confirmação  | Sim | ✅     | Digitar identifier     |

---

## 🔴 Features Pendentes / Futuras

| Feature                              | Prioridade | Complexidade |
| ------------------------------------ | ---------- | ------------ |
| Burn-down chart                      | Baixa      | Média        |
| Upload de imagens (Supabase Storage) | Média      | Média        |
| Filtros avançados (nuqs)             | Média      | Média        |
| Dark/Light mode toggle               | Baixa      | Baixa        |

---

## ✅ Implementações Recentes (2026-01-23)

| Feature              | Descrição                                         |
| -------------------- | ------------------------------------------------- |
| **Cycles View**      | Cards com progresso, status temporal, datas PT-BR |
| **Modules View**     | Cards com workflow status, descrição, timeline    |
| **Project Settings** | Página completa com General, Members, Danger Zone |
| **Bug Fix Select**   | Corrigido bug do Select salvando IDs internos     |
| **updateProject**    | Server action para editar projeto                 |
| **deleteProject**    | Server action com verificação de admin            |

---

## 📈 Progresso Geral

```
Fases Completas:     8/8 ✅
Features PRD:        ~92% implementadas
MVP Ready:           ✅ SIM
Project Settings:    ✅ COMPLETO
```

### Próximos Passos (Nice to Have):

1. [ ] Implementar Google OAuth
2. [ ] Tornar sidebar colapsável
3. [ ] Implementar burn-down chart para cycles
4. [ ] Upload de imagens no Tiptap editor

---

## 📝 Discrepâncias PRD vs Código

| Área       | PRD Dizia             | Código Faz                | Decisão                      |
| ---------- | --------------------- | ------------------------- | ---------------------------- |
| UI Library | HeroUI + shadcn       | HeroUI v3 only            | ✅ Correto (evita conflitos) |
| State Mgmt | Zustand + nuqs        | useState + Realtime hooks | ✅ Suficiente para MVP       |
| Forms      | Zod + react-hook-form | Formulários nativos       | ⏳ Adicionar para validação  |
| Feedback   | sonner toasts         | sonner instalado          | ✅ Implementado              |
| Realtime   | Supabase Realtime     | useIssuesRealtime hook    | ✅ Implementado              |
