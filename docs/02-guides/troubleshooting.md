# 🔧 Troubleshooting Guide

> **Última Atualização:** 2026-01-23

Guia para resolver problemas comuns no desenvolvimento do KyrieOS.

---

## 🚨 Problemas Críticos

### 1. `supabase.ts` Corrompido

**Sintomas:**

- Arquivo contém "Need to install..."
- Erros de tipo em todo o projeto
- `Property 'Tables' does not exist on type 'DefaultSchema'`

**Causa:** Redirecionamento de output capturou mensagens do npm.

**Solução:**

```powershell
# 1. Deletar arquivo corrompido
Remove-Item -Path "src\types\supabase.ts" -Force

# 2. Regenerar via MCP (preferido)
# mcp_supabase-kyrie_generate_typescript_types(project_id: "jxkmmdmpmrhwxibalmkc")
# Salvar output em src/types/supabase.ts

# 3. OU via CLI com token
$env:SUPABASE_ACCESS_TOKEN="sbp_c58e1d81530976169f35b9f0e4ec28a166315435"
npx supabase gen types typescript --project-id jxkmmdmpmrhwxibalmkc 2>$null | Out-File -FilePath "src\types\supabase.ts" -Encoding utf8
```

---

### 2. "owner_id" ou "joined_at" Not Found

**Sintomas:**

- TypeScript error: Property 'owner_id' does not exist
- Insert/Update falha silenciosamente

**Causa:** Colunas com nomes errados nos types.

**Solução:**

- `workspaces` usa `created_by`, **NÃO** `owner_id`
- `workspace_members` usa `created_at`, **NÃO** `joined_at`

```typescript
// ❌ ERRADO
.insert({ name, slug, owner_id: user.id })

// ✅ CORRETO
.insert({ name, slug, created_by: user.id })
```

---

### 3. Avatar "src" Prop Error

**Sintomas:**

- `Property 'src' does not exist on type 'AvatarProps'`

**Causa:** HeroUI v3 usa compound components.

**Solução:**

```tsx
// ❌ ERRADO (v2 style)
<Avatar src={url} name="User" />

// ✅ CORRETO (v3 style)
<Avatar size="sm">
  {url && <Avatar.Image src={url} alt="User" />}
  <Avatar.Fallback>U</Avatar.Fallback>
</Avatar>
```

---

### 4. npm ERESOLVE Errors

**Sintomas:**

- `ERESOLVE could not resolve`
- Conflito de peer dependencies

**Causa:** React 19 + dependências antigas.

**Solução:**

```bash
# Usar --force ou --legacy-peer-deps
npm install -D supabase --force
```

---

### 5. MCP "Project not found"

**Sintomas:**

- Ferramentas MCP retornam "Project not found"
- `list_projects` não mostra o projeto esperado

**Causa:** Token de acesso errado ou MCP não reiniciado.

**Solução:**

1. Verificar `mcp_config.json` tem o token correto
2. Reiniciar o MCP server (fechar e reabrir VS Code/IDE)
3. Usar `list_projects` para verificar projetos disponíveis

---

## ⚠️ Warnings (Ignoráveis)

### "Unknown at rule @apply"

**Onde:** `globals.css`

**Causa:** VS Code CSS linter não reconhece Tailwind v4.

**Impacto:** Nenhum. O código funciona corretamente.

**Solução (opcional):**

```json
// .vscode/settings.json
{
    "css.lint.unknownAtRules": "ignore"
}
```

---

### "framer-motion peer dependency"

**Onde:** npm install

**Causa:** framer-motion pede React 18, temos React 19.

**Impacto:** Nenhum. Funciona com React 19.

**Solução:** Ignorar ou usar `--force`.

---

## 🔍 Debug Commands

### Verificar TypeScript

```bash
npx tsc --noEmit
```

### Verificar Build

```bash
npm run build
```

### Verificar Dev Server

```bash
npm run dev
```

### Limpar Cache

```bash
# Next.js cache
rm -rf .next

# npm cache
npm cache clean --force

# node_modules (último recurso)
rm -rf node_modules && npm install --force
```

---

## 📋 Checklist: Novo Ambiente

1. [ ] Clonar repositório
2. [ ] `npm install --force`
3. [ ] Copiar `.env.local.example` para `.env.local`
4. [ ] Configurar variáveis de ambiente
5. [ ] Regenerar types:
       `npx supabase gen types typescript --project-id jxkmmdmpmrhwxibalmkc > src/types/supabase.ts`
6. [ ] `npm run dev`
7. [ ] Verificar: `npx tsc --noEmit`
