# 🥞 Tech Stack (A "Stack de Ouro")

> **Última Atualização:** 2026-01-23\
> **Status:** ✅ VALIDADO contra `package.json`

Esta é a definição oficial das tecnologias instaladas no **KyrieOS**.

---

## 📦 Versões Exatas Instaladas

| Categoria       | Tecnologia    | Versão         | Status |
| --------------- | ------------- | -------------- | ------ |
| **Framework**   | Next.js       | `16.1.1`       | ✅     |
| **Runtime**     | React         | `19.2.3`       | ✅     |
| **Linguagem**   | TypeScript    | `^5`           | ✅     |
| **Estilização** | Tailwind CSS  | `^4`           | ✅     |
| **UI Library**  | HeroUI React  | `3.0.0-beta.3` | ✅     |
| **UI Styles**   | HeroUI Styles | `3.0.0-beta.3` | ✅     |

---

## 🎨 UI & Styling

### HeroUI v3 (Beta)

- **Packages:** `@heroui/react`, `@heroui/styles`
- **Pattern:** Compound Components (ex:
  `<Modal><Modal.Dialog>...</Modal.Dialog></Modal>`)
- **CSS Import:** `@import "@heroui/styles";` em `globals.css`

> [!IMPORTANT]
> **shadcn/ui foi REMOVIDO.** O PRD original sugeria HeroUI + shadcn, mas a
> implementação atual usa **HeroUI v3 puro** para evitar conflitos de design
> system.

### Tailwind CSS v4

- **Config:** `tailwind.config.js` (minimal)
- **PostCSS:** `@tailwindcss/postcss ^4`
- **Utilities:** `tailwind-merge ^3.4.0`, `clsx ^2.1.1`

### Ícones

- **Library:** `lucide-react ^0.562.0`

### Toasts

- **Library:** `sonner ^2.x` ✅ INSTALADO
- **Uso:** `toast.success()`, `toast.error()`
- **Config:** `<Toaster />` em `providers.tsx`

---

## 🔧 State Management

| Camada              | Tecnologia                            | Status           |
| ------------------- | ------------------------------------- | ---------------- |
| **Server State**    | Server Components + Server Actions    | ✅ Implementado  |
| **Client State**    | `React.useState` / `React.useReducer` | ✅ Implementado  |
| **Realtime State**  | Custom Hook `useIssuesRealtime`       | ✅ Implementado  |
| **URL State**       | `nuqs`                                | ❌ Não instalado |
| **Global UI State** | `Zustand`                             | ❌ Não instalado |

> [!NOTE]
> `nuqs` e `Zustand` estão no PRD mas não foram necessários até agora. Adicionar
> quando surgir necessidade.

---

## 🗄️ Backend & Data

| Tecnologia      | Package                 | Versão    | Status           |
| --------------- | ----------------------- | --------- | ---------------- |
| Supabase SSR    | `@supabase/ssr`         | `^0.8.0`  | ✅               |
| Supabase Client | `@supabase/supabase-js` | `^2.90.1` | ✅               |
| Database        | PostgreSQL (Supabase)   | —         | ✅               |
| **Realtime**    | Supabase Realtime       | —         | ✅ Habilitado    |
| **RLS**         | Row Level Security      | —         | ✅ Todas tabelas |

### Realtime Habilitado

```sql
-- Tabela issues está na publication supabase_realtime
ALTER PUBLICATION supabase_realtime ADD TABLE issues;
```

---

## 📝 Rich Text & Interactivity

| Feature               | Package                         | Versão    |
| --------------------- | ------------------------------- | --------- |
| Rich Editor           | `@tiptap/react`                 | `^3.15.3` |
| Tiptap Starter Kit    | `@tiptap/starter-kit`           | `^3.15.3` |
| Placeholder Extension | `@tiptap/extension-placeholder` | `^3.15.3` |
| Drag & Drop           | `@dnd-kit/core`                 | `^6.3.1`  |
| DnD Sortable          | `@dnd-kit/sortable`             | `^10.0.0` |
| DnD Utils             | `@dnd-kit/utilities`            | `^3.2.2`  |
| Charts                | `recharts`                      | `^3.6.0`  |
| Animations            | `framer-motion`                 | `^11.9.0` |

---

## 🤖 AI Integration (v1.1)

| Feature          | Technology                | Versão          |
| ---------------- | ------------------------- | --------------- |
| **Framework**    | CrewAI                    | Latest (Python) |
| **Primary LLM**  | Llama-3.3-70b (via Groq)  | -               |
| **Fallback/BFF** | Gemini 1.5 Flash (Native) | `latest`        |
| **Orchestrator** | FastAPI Microservice      | -               |
| **Traceability** | Supabase `ai_actions`     | -               |

---

## 📋 Tecnologias do PRD NÃO Instaladas

| Tecnologia        | PRD Sugeria | Motivo da Ausência                    |
| ----------------- | ----------- | ------------------------------------- |
| `shadcn/ui`       | Sim         | Substituído por HeroUI v3 puro        |
| `nuqs`            | Sim         | Não necessário ainda                  |
| `Zustand`         | Sim         | Não necessário ainda                  |
| `Zod`             | Sim         | Ainda não implementado                |
| `react-hook-form` | Sim         | Usando forms nativos + Server Actions |

---

## 🏛️ Decisões Arquiteturais

1. **HeroUI v3 Only:** Usar Compound Components. Não misturar com shadcn.
2. **Server First:** Preferir Server Components. Usar `'use client'` apenas para
   interatividade.
3. **Server Actions:** Preferir Server Actions sobre API Routes para mutações.
4. **Tailwind v4:** Configuração via CSS imports, não via `tailwind.config.ts`.
5. **Realtime Hook:** Usar `useIssuesRealtime` para sincronização multiplayer.
6. **Toast Feedback:** Usar `sonner` para feedback visual em todas as ações.
