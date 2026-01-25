# 📖 KyrieOS Documentation Index

> **Última Atualização:** 2026-01-23

Índice central da documentação do KyrieOS.

---

## 📂 Estrutura

```
docs/
├── README.md                       # Este arquivo (índice)
├── 01-architecture/                # Arquitetura técnica
│   ├── stack.md                    # Tech stack e versões
│   ├── structure.md                # Estrutura de pastas
│   ├── db-schema.md                # Schema do banco de dados ✨ ATUALIZADO
│   └── agency-module.md            # ✨ NOVO - Arquitetura de Agência (God Mode/Invites)
├── 02-features/                    # Status de features
│   ├── auth-flow.md                # ✨ NOVO - Fluxos de Autenticação e Convites
│   ├── kyrie-report-spec.md        # ✨ NOVO - Spec do Relatório de Valor
│   └── status.md                   # Status de Implementação
├── 02-guides/                      # Guias de implementação
│   ├── auth.md                     # Autenticação
│   ├── realtime.md                 # Supabase Realtime
│   ├── hooks.md                    # Custom Hooks
│   ├── components.md               # Referência de componentes
│   ├── server-actions.md           # Referência de Server Actions
│   ├── heroui-v3.md                # ✨ NOVO - Guia HeroUI v3
│   ├── supabase-mcp.md             # ✨ NOVO - Guia MCP Supabase
│   └── troubleshooting.md          # ✨ NOVO - Problemas comuns
└── 03-logs/                        # Logs de sessão
    └── session-log.md              # Histórico de desenvolvimento
```

---

## 🚀 Quick Links

### Para Desenvolvedores

| Documento                                                              | Descrição                         |
| ---------------------------------------------------------------------- | --------------------------------- |
| [stack.md](./01-architecture/stack.md)                                 | Tecnologias e versões             |
| [structure.md](./01-architecture/structure.md)                         | Estrutura de pastas               |
| [db-schema.md](./01-architecture/db-schema.md)                         | Schema do banco (MCP-validated)   |
| [backend-architecture.md](./01-architecture/backend-architecture.md)   | **NOVO** Supabase & Actions       |
| [frontend-architecture.md](./01-architecture/frontend-architecture.md) | **NOVO** Components & Styling     |
| [server-actions.md](./02-guides/server-actions.md)                     | Referência de Actions             |
| [development-workflow.md](./02-guides/development-workflow.md)         | **NOVO** Feature Lifecycle        |
| [heroui-v3.md](./02-guides/heroui-v3.md)                               | **NOVO** Compound Components      |
| [troubleshooting.md](./02-guides/troubleshooting.md)                   | **NOVO** Problemas comuns         |
| [agency-module.md](./01-architecture/agency-module.md)                 | **NOVO** Entenda God Mode/Invites |

### Para Agentes AI

| Documento                                            | Quando Usar                            |
| ---------------------------------------------------- | -------------------------------------- |
| [status.md](./02-features/status.md)                 | Ver o que já foi implementado          |
| [db-schema.md](./01-architecture/db-schema.md)       | **LEIA PRIMEIRO** antes de queries SQL |
| [heroui-v3.md](./02-guides/heroui-v3.md)             | **LEIA PRIMEIRO** antes de criar UI    |
| [supabase-mcp.md](./02-guides/supabase-mcp.md)       | Como usar ferramentas MCP              |
| [troubleshooting.md](./02-guides/troubleshooting.md) | Resolver erros comuns                  |

---

## ✅ Status do MVP

```
Fases Completas:   9/9 ✅
Features PRD:      ~92% implementadas
MVP Ready:         ✅ SIM
Settings:          ✅ COMPLETO
Cycles View:       ✅ COMPLETO
Modules View:      ✅ COMPLETO
```

### Implementado

- ✅ Auth (Login/Logout com email)
- ✅ Workspaces e Projects
- ✅ Issues CRUD com IDs sequenciais
- ✅ Kanban Board com Drag & Drop
- ✅ Realtime multiplayer
- ✅ Cycles View (Cards com progresso temporal)
- ✅ Modules View (Cards com workflow status)
- ✅ Project Settings (General, Members, Danger Zone)
- ✅ Analytics Dashboard
- ✅ Toast feedback (sonner)
- ✅ Glassmorphism UI
- ✅ Google OAuth (via `signInWithGoogleAction`)
- ✅ Sidebar colapsável

### Não Implementado

- ❌ Burn-down chart
- ❌ Upload de imagens

---

## 🔧 Convenções

### Código

- **Server First:** Preferir Server Components
- **HeroUI v3:** Compound Components pattern (ver
  [heroui-v3.md](./02-guides/heroui-v3.md))
- **Realtime:** Usar `useIssuesRealtime` hook
- **Feedback:** Toast para todas as ações

### Server Actions

- **Localização:** `src/app/dashboard/actions.ts`
- **Pattern:** `useActionState` do React 19
- **Naming:** `createX`, `updateX`, `deleteX`

### Database

- **Workspaces:** Use `created_by`, NÃO `owner_id`
- **Members:** Use `created_at`, NÃO `joined_at`
- **Types:** Regenere via MCP ou CLI após mudanças no schema

### Docs

- **Formato:** Markdown com emojis para seções
- **Data:** Sempre incluir "Última Atualização"
- **Status:** Usar ✅ 🔶 ❌ para indicar completude

---

## 📝 Atualizando Docs

Ao implementar uma nova feature:

1. Atualizar `02-features/status.md` com o novo status
2. Adicionar entry no `03-logs/session-log.md`
3. Se criar nova action, documentar em `02-guides/server-actions.md`
4. Atualizar `01-architecture/structure.md` se houver novos arquivos
5. Se encontrar bug/gotcha, adicionar em `02-guides/troubleshooting.md`

---

## 🤖 Instruções para AI Agents

```
REGRAS DE OURO:

1. LEIA docs/01-architecture/db-schema.md ANTES de qualquer query SQL
   - workspaces usa created_by, NÃO owner_id
   - workspace_members usa created_at, NÃO joined_at

2. LEIA docs/02-guides/heroui-v3.md ANTES de criar UI
   - HeroUI v3 usa Compound Components
   - Use onPress, NÃO onClick
   - Avatar precisa de <Avatar.Image> e <Avatar.Fallback>

3. CONSULTE docs/02-guides/supabase-mcp.md para operações de banco
   - Use generate_typescript_types para atualizar types
   - Use list_tables para verificar schema

4. CONSULTE docs/02-guides/troubleshooting.md se encontrar erros

5. ATUALIZE docs após implementar features

NÃO:
- Reinvente o que já existe
- Use shadcn/ui (removido)
- Ignore RLS nas tabelas
- Crie novas actions sem documentar
- Use sintaxe HeroUI v2
```

---

## 🔗 Links Úteis

| Recurso            | URL                                                                          |
| ------------------ | ---------------------------------------------------------------------------- |
| Supabase Dashboard | [jxkmmdmpmrhwxibalmkc.supabase.co](https://jxkmmdmpmrhwxibalmkc.supabase.co) |
| HeroUI v3 Docs     | [v3.heroui.com](https://v3.heroui.com)                                       |
| Tailwind v4        | [tailwindcss.com](https://tailwindcss.com)                                   |
| MCP Config         | `C:\Users\lukka\.gemini\antigravity\mcp_config.json`                         |
