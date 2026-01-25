# 🏢 Agency Module Architecture

## Conceito: God Mode vs Client Mode

O KyrieOS foi evoluído para suportar operações de Agência, introduzindo a
distinção entre **God Mode** (Administradores/Donos da Agência) e **Client
Mode** (Clientes com visão restrita).

### 👑 God Mode (Admin/Owner)

- **Acesso Total:** Pode criar, editar e deletar qualquer recurso (Workspaces,
  Projects, Issues).
- **Visão Técnica:** Vê campos técnicos como `technical_effort_score`, logs de
  sistema, e configurações avançadas.
- **Gerenciamento:** Pode convidar membros e gerenciar permissões.

### 👤 Client Mode (Restricted)

- **Visão Filtrada:** Apenas visualiza Issues marcadas com
  `client_visible = true`.
- **Interação Limitada:** Pode comentar e aprovar, mas não editar estimativas
  técnicas ou configurações profundas.
- **Foco:** Acompanhamento de progresso e validação de entregas.

---

## 🎟️ Sistema de Convites (Secure Invites)

O sistema de convites permite adicionar novos membros a Workspaces de forma
segura e auditável.

### Tabela `invites`

| Coluna         | Tipo        | Descrição                                 |
| :------------- | :---------- | :---------------------------------------- |
| `id`           | uuid        | PK                                        |
| `email`        | text        | Email do convidado (usado para validação) |
| `role`         | text        | Papel sugerido (ex: 'member', 'viewer')   |
| `token`        | text        | Token único seguro (gerado via crypto)    |
| `workspace_id` | uuid        | FK para o workspace alvo                  |
| `expires_at`   | timestamptz | Validade do convite (padrão: 7 dias)      |
| `created_by`   | uuid        | Quem enviou o convite                     |

### Fluxo de Segurança RPC

Para garantir que convites não sejam enumerados ou abusados, utilizamos
**PostgreSQL RPCs com `SECURITY DEFINER`**, bypassando RLS de forma controlada
apenas para validação de tokens.

1. **Validação (`get_invite_by_token`):**
   - Recebe o `token`.
   - Busca na tabela `invites` (bypass RLS).
   - Retorna dados básicos do convite APENAS se válido e não expirado.

2. **Redenção (`redeem_invite`):**
   - Recebe `token` e `target_user_id`.
   - Executa transação atômica:
     1. Verifica validade.
     2. Insere na tabela `workspace_members`.
     3. Deleta o convite da tabela `invites`.
   - Garante que um convite só pode ser usado uma vez.
