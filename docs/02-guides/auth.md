# 🔐 Authentication Guide

> **Última Atualização:** 2026-01-23\
> **Status:** ✅ Funcional (Email/Password)

Este documento descreve a implementação de autenticação no KyrieOS.

---

## 📂 Arquivos Chave

| Arquivo                          | Propósito                  |
| -------------------------------- | -------------------------- |
| `src/app/login/page.tsx`         | Página de login            |
| `src/app/auth/actions.ts`        | Server Actions de Auth     |
| `src/app/dashboard/layout.tsx`   | Proteção de rotas          |
| `src/lib/supabase/server.ts`     | Cliente Supabase (Server)  |
| `src/lib/supabase/client.ts`     | Cliente Supabase (Browser) |
| `src/lib/supabase/middleware.ts` | Helper para middleware     |
| `src/middleware.ts`              | Auth middleware global     |

---

## 🔄 Fluxo de Autenticação

```
1. Usuário acessa /dashboard
2. middleware.ts verifica sessão
3. Se não autenticado → redirect /login
4. Se autenticado → permite acesso
5. dashboard/layout.tsx busca dados do usuário
6. Passa userData para Sidebar
```

---

## 🛠️ Server Actions

### `signOutAction()`

Faz logout do usuário e redireciona para `/login`.

```typescript
// src/app/auth/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signOutAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}
```

### `getCurrentUser()`

Retorna o usuário autenticado ou `null`.

```typescript
export async function getCurrentUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user || null;
}
```

---

## 🔒 Proteção de Rotas

### Layout do Dashboard

O `layout.tsx` do dashboard verifica autenticação:

```typescript
// src/app/dashboard/layout.tsx
export default async function DashboardLayout({ children }) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    const userData = {
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.full_name || user.email?.split("@")[0],
        avatar: user.user_metadata?.avatar_url || null,
    };

    return (
        <div className="flex h-screen">
            <Sidebar user={userData} />
            <main>{children}</main>
        </div>
    );
}
```

---

## 👤 Dados do Usuário na Sidebar

A Sidebar recebe `user` como prop do layout:

```typescript
// src/app/dashboard/sidebar.tsx
interface SidebarProps {
    user: {
        id: string;
        email: string;
        name: string;
        avatar: string | null;
    };
}

export default function Sidebar({ user }: SidebarProps) {
    // Usa dados reais do usuário
    // Botão de logout chama signOutAction()
}
```

---

## 📋 Configuração Supabase

### Cliente Server

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: {/* ... */} },
    );
}
```

### Cliente Browser

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
}
```

---

## ❌ Não Implementado

| Feature         | Status | Notas                     |
| --------------- | ------ | ------------------------- |
| Google OAuth    | ❌     | Requer config no Supabase |
| Magic Link      | ❌     | Não necessário para MVP   |
| Password Reset  | ❌     | Implementar quando pedido |
| Session Refresh | 🔶     | Middleware básico existe  |

---

## 🔧 Como Adicionar Google OAuth

1. Ativar Google Provider no Supabase Dashboard
2. Configurar OAuth credentials no Google Cloud
3. Adicionar botão na página de login:

```typescript
const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${origin}/auth/callback` },
    });
};
```

4. Criar rota `/auth/callback/route.ts` para exchange do code.
