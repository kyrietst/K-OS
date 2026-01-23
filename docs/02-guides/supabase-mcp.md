# 🔌 Supabase MCP Guide

> **Última Atualização:** 2026-01-23\
> **MCP Server:** `supabase-kyrie`\
> **Project ID:** `jxkmmdmpmrhwxibalmkc`

Guia de uso das ferramentas MCP para interagir com o Supabase.

---

## 📋 Ferramentas Disponíveis

| Ferramenta                  | Descrição                                    |
| --------------------------- | -------------------------------------------- |
| `list_projects`             | Lista todos os projetos Supabase             |
| `list_tables`               | Lista tabelas de um schema                   |
| `execute_sql`               | Executa SQL (DML - SELECT, INSERT, UPDATE)   |
| `apply_migration`           | Aplica SQL de migração (DDL - CREATE, ALTER) |
| `generate_typescript_types` | Gera tipos TypeScript                        |
| `get_advisors`              | Verifica segurança e performance             |

---

## 🔧 Operações Comuns

### 1. Verificar Schema

```
mcp_supabase-kyrie_list_tables(
  project_id: "jxkmmdmpmrhwxibalmkc",
  schemas: ["public"]
)
```

**Retorna:** Lista de tabelas com colunas, tipos, constraints e FKs.

### 2. Regenerar Types

```
mcp_supabase-kyrie_generate_typescript_types(
  project_id: "jxkmmdmpmrhwxibalmkc"
)
```

**Importante:** Após obter os types, salve em `src/types/supabase.ts`
manualmente.

### 3. Executar Query (SELECT)

```
mcp_supabase-kyrie_execute_sql(
  project_id: "jxkmmdmpmrhwxibalmkc",
  query: "SELECT * FROM issues LIMIT 5"
)
```

### 4. Aplicar Migração (DDL)

```
mcp_supabase-kyrie_apply_migration(
  project_id: "jxkmmdmpmrhwxibalmkc",
  name: "add_priority_column",
  query: "ALTER TABLE issues ADD COLUMN priority text DEFAULT 'none'"
)
```

> [!CAUTION]
> Use `execute_sql` para DML (SELECT, INSERT, UPDATE, DELETE). Use
> `apply_migration` para DDL (CREATE, ALTER, DROP).

---

## 🔒 Verificar Segurança

```
mcp_supabase-kyrie_get_advisors(
  project_id: "jxkmmdmpmrhwxibalmkc",
  type: "security"
)
```

**Verifica:**

- Tabelas sem RLS
- Policies ausentes
- Vulnerabilidades comuns

---

## 📊 Queries Úteis

### Contar Issues por Status

```sql
SELECT status, COUNT(*) as count 
FROM issues 
GROUP BY status 
ORDER BY count DESC
```

### Verificar RLS

```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
```

### Verificar Realtime

```sql
SELECT pubname, schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
```

---

## ⚠️ Gotchas

| Problema            | Causa                             | Solução                               |
| ------------------- | --------------------------------- | ------------------------------------- |
| "Project not found" | Access token inválido ou expirado | Verifique config em `mcp_config.json` |
| Types corrompidos   | npm output no arquivo             | Use MCP para gerar, salve manualmente |
| RLS blocking        | Auth header ausente               | Verifique client config               |

---

## 🔑 Configuração do MCP

Arquivo: `C:\Users\lukka\.gemini\antigravity\mcp_config.json`

```json
{
    "mcpServers": {
        "supabase-kyrie": {
            "command": "npx",
            "args": ["-y", "@supabase/mcp-server-supabase"],
            "env": {
                "SUPABASE_URL": "https://jxkmmdmpmrhwxibalmkc.supabase.co",
                "SUPABASE_ACCESS_TOKEN": "sbp_c58e1d81530976169f35b9f0e4ec28a166315435"
            }
        }
    }
}
```

> [!IMPORTANT]
> Após alterar credenciais, **reinicie o MCP server** para as mudanças terem
> efeito.
