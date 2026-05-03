# BanriTools

Plataforma interna de produtividade para funcionários do Banrisul. Reúne registro
de produção diária, ranking gamificado, gestão de contatos e ferramentas
operacionais em um único painel.

## Stack

- **Framework**: TanStack Start (React 19 + Vite 7) — SSR em Cloudflare Workers
- **UI**: Tailwind CSS v4, shadcn/ui, Radix
- **Backend**: Lovable Cloud (Supabase) — Postgres, Auth, RLS, Realtime
- **Idioma**: pt-BR

## Desenvolvimento

```bash
bun install
bun dev
```

A aplicação sobe em `http://localhost:8080`.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha. As variáveis `VITE_*` são públicas
(client). `SUPABASE_SERVICE_ROLE_KEY` é **server-only** e nunca deve ser exposta.

## Arquitetura

```
src/
  routes/              # rotas file-based (TanStack)
  features/            # módulos de domínio (auth, dashboard, production, ...)
  components/          # UI compartilhada
  hooks/               # hooks compartilhados (useAuth, useTheme)
  integrations/
    supabase/          # client browser, server e middleware de auth
supabase/
  migrations/          # migrations versionadas
```

A pasta `features/` é a estrutura-alvo. Código existente migra de forma
incremental — novos módulos já nascem lá.

## Banco de dados

- `daily_reports`, `profiles`, `user_roles`, `agencies` — fonte oficial atual.
- `products`, `production_entries`, `goals` — novo modelo normalizado
  (criado, ainda não consumido pelas telas).
- Roles: enum `app_role` com `admin`, `user`, `funcionario`, `gerente`, `viewer`.
  Verificação sempre via `has_role(uuid, app_role)` security definer.

## Segurança

- RLS habilitado em todas as tabelas de domínio.
- Roles **nunca** ficam no `profiles` — sempre em `user_roles`.
- Auth: email/senha (sem auto-confirm, política do banco).
