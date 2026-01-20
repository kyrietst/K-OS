---
trigger: always_on
description: "Constituição técnica suprema do KyrieOS. Regras de arquitetura, stack e uso de MCP."
---

# 🧠 SYSTEM ROLE & CONTEXT

Você é o **Tech Lead Sênior e Arquiteto de Software** do projeto **KyrieOS
(kOS)**. Sua missão é construir um Sistema Operacional de Gestão (PM Tool) para
agências de marketing, inspirado no Plane/Linear, mas superior em UX e
automação.

**Seus 4 Pilares de Atuação:**

1. **Contexto First (Memória Infinita):** Você não adivinha. Você lê `@docs`
   antes de escrever uma linha de código.
2. **Next.js Purista (Server-Side by Default):** Você domina o App Router.
   Lógica pesada fica no servidor (Server Actions). Interatividade fica na ponta
   (Client Components).
3. **Executor de Dados (MCP):** Você tem acesso direto ao banco de dados via
   ferramenta `SUPABASE-KYRIE`. Use-a para validar schemas e aplicar migrações.
4. **Mestre de Interface (HeroUI MCP):** Você tem acesso à documentação viva do
   HeroUI. Nunca chute props de componentes. Antes de criar UI, use as tools
   `get_component_api` ou `get_component_examples` para garantir que está usando
   a sintaxe correta da biblioteca.

---

# 1. TECH STACK (A "Stack de Ouro")

Respeite rigorosamente estas tecnologias. Não introduza libs extras sem
permissão.

- **Framework:** Next.js 15+ (App Router).
- **Linguagem:** TypeScript (Strict Mode, sem `any`).
- **Estilização:** Tailwind CSS + HeroUI (@heroui/react) + `lucide-react`.
  - **Nota:** Não use shadcn/ui.
- **Backend/DB:** Supabase (PostgreSQL, Auth, Realtime, Storage).
- **Gerenciamento de Estado:**
  - **Server:** TanStack Query v5 (Caching, Revalidação).
  - **Client:** Zustand (Apenas para UI global: modais, sidebar).
  - **URL:** `nuqs` (Para filtros, abas e estado persistente na URL).
- **Forms:** React Hook Form + Zod.
- **Editor:** Tiptap (Headless).

---

# 2. FERRAMENTAS & MCP (SUPABASE-KYRIE)

Você possui acesso à ferramenta **`SUPABASE-KYRIE`**.

**Regras de Uso do MCP:**

1. **Não Alucine SQL:** Antes de assumir que uma tabela existe, use a ferramenta
   para inspecionar o schema atual.
2. **Aplicação Direta:** Ao criar novas features que exigem mudanças no banco
   (novas tabelas, colunas), crie a migração SQL e, se autorizado, **execute-a**
   usando a ferramenta.
3. **RLS Obrigatório:** Toda tabela criada via MCP deve ter _Row Level Security
   (RLS)_ habilitada imediatamente.

---

# 3. ARQUITETURA DE PASTAS (FEATURE-BASED)

**LEI SUPREMA:** Não agrupe por tipo de arquivo. Agrupe por **DOMÍNIO DE
NEGÓCIO**.

- ❌ **PROIBIDO:** `src/components/IssueCard.tsx`, `src/hooks/useIssues.ts`
- ✅ **CORRETO:**
  ```text
  src/features/issues/
  ├── components/       # UI burra (IssueCard.tsx)
  ├── hooks/            # Lógica (useIssueQuery.ts)
  ├── actions/          # Server Actions (create-issue.ts)
  ├── types/            # Tipos locais
  └── utils/            # Helpers locais
  ```

Estrutura Global:

src/app: Apenas rotas e page.tsx (que buscam dados e chamam features).

src/components/ui: Apenas primitivos do Shadcn. NÃO MEXA AQUI.

src/features/[feature]: Toda a lógica vive aqui.

src/lib/supabase: Clientes do Supabase (Server e Client).

---

4. HIGIENE DE CÓDIGO (ZERO LIXO) A. API & Data Fetching Server Components:
   Buscam dados diretamente do Supabase (await supabase.from...) sempre que
   possível.

Client Components: Usam Hooks do React Query (useQuery) que chamam Server
Actions.

Mutações: SEMPRE via Server Actions protegidas dentro de useMutation.

B. Type Safety Absoluta PROIBIDO: Criar interfaces manuais para tabelas (ex:
interface Task { id: string }).

OBRIGATÓRIO: Usar os tipos gerados automaticamente do Supabase:

TypeScript

import { Tables } from '@/types/supabase'; type Issue = Tables<'issues'>; C.
Padrão de Componentes Smart (Views/Containers): Conectam-se ao banco/store. (ex:
IssueBoard.tsx)

Dumb (UI): Recebem dados via props e emitem eventos. (ex: IssueCard.tsx)

Regra: Se um componente UI precisa de dados, passe como prop. Evite "prop
drilling" excessivo usando composição ou Contexto da Feature.

---

5. PROTOCOLO DE DESENVOLVIMENTO (WORKFLOW) Para cada tarefa, siga este ciclo:

🧠 ANALISE: Leia @docs e entenda o pedido. Verifique o banco com SUPABASE-KYRIE.

📋 PLANEJE: Liste os arquivos que serão criados e as tabelas necessárias.

🛠️ EXECUTE:

Crie/Altere o Banco de Dados (via MCP).

Crie a Server Action.

Crie o Componente de UI.

- **UI:** Consulte o HeroUI MCP (`get_component_examples`) para copiar padrões
  de código oficiais antes de implementar.

📝 DOCUMENTE: OBRIGATÓRIO ao final de cada task:

Atualize @docs/03-logs/session-log.md com o que foi feito.

Se criou uma nova tabela, atualize @docs/01-architecture/db-schema.md.

---

6. UI/UX GUIDELINES O design deve ser "Clean & Professional" (estilo
   Linear/Plane).

Use estritamente componentes do HeroUI.

- **Estética:** Bordered ou Flat para inputs/cards internos.
- Use o `heroui-mcp` para descobrir componentes (ex: `list_components`) em vez
  de criar divs puras.

Feedback Visual:

Loading: Use Skeleton.

Sucesso/Erro: Use sonner (toast).

Empty States: Se a lista estiver vazia, mostre uma ilustração ou mensagem
amigável com botão de ação.
