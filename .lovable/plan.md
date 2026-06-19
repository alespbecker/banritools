## 1. Odômetro em todos os KPIs (incluindo ranking)

- Auditar todos os lugares onde números são exibidos como KPI/contador e trocar por `AnimatedNumber` / `AnimatedText` (já criados):
  - `src/components/ds/KpiCard.tsx` — usar `AnimatedNumber` quando `value` for número, `AnimatedText` quando vier formatado (string com "R$", "%", etc.).
  - `src/components/ds/HeroPerformance.tsx` — pontos, totais.
  - `src/components/GamificationWidgets.tsx` — pontos do usuário, nível.
  - Rotas de dashboard: `dashboard.tsx`, `dashboard-v2.tsx`, `dashboard-v3.tsx`, `admin.tsx` — números avulsos exibidos diretamente.
  - `_authenticated.ranking.tsx`, `ranking-v2.tsx`, `ranking-v3.tsx` — colunas de pontos.
- Ajuste fino no `AnimatedNumber`:
  - Suportar formatadores comuns (moeda BRL, percentual, "+N pts", abreviado "1,2k").
  - Variante "compacta" para números grandes que não devem rolar dígito a dígito do 0 (ex.: 854.765) — usar duração proporcional à diferença e cap de 1.2s, para evitar rolagem visualmente caótica.
- Ranking com **reordenação animada**:
  - Refatorar a tabela/lista de ranking para usar `framer-motion` (`motion.div` + `layout` + `AnimatePresence`) em vez de `<tr>`s estáticos — uma lista de cards/linhas com `layoutId` por `user_id`.
  - Quando a ordem mudar (ex.: alguém ultrapassa outro via realtime), as linhas deslizam suavemente para a nova posição enquanto os pontos rolam no odômetro.
  - Habilitar realtime em `production_entries` (publication `supabase_realtime`) para que o ranking se atualize sem refresh, alimentando o efeito.

## 2. Cadastro de usuários por código de convite (sem email real)

Fluxo escolhido: **admin gera código de convite → funcionário usa o código para criar conta com email e senha próprios**.

### Banco
Nova migration:
- Tabela `public.user_invites`:
  - `id uuid pk`, `code text unique` (8 chars alfanuméricos legíveis, sem 0/O/1/I), `agency_id uuid fk agencies`, `role app_role default 'funcionario'`, `name text` (nome opcional pré-preenchido), `created_by uuid fk auth.users`, `created_at`, `expires_at` (default now()+30 dias), `used_at`, `used_by uuid fk auth.users`.
  - GRANTs para `authenticated` e `service_role` (sem `anon`).
  - RLS: admin/gerente da mesma `agency_id` pode SELECT/INSERT/UPDATE/DELETE; demais sem acesso. A validação do código no signup é feita via server function `service_role`, não via SELECT do anon.
- Função `gen_invite_code()` que gera código único, e default na coluna `code`.

### Server functions (`src/lib/invites.functions.ts`)
- `createInvite({ name?, role, agency_id? })` — `requireSupabaseAuth` + checagem de role admin/gerente. Insere e retorna `code`.
- `listInvites()` — lista convites da agência do usuário (para a tela admin).
- `revokeInvite({ id })` — soft delete (define `expires_at = now()`).
- `redeemInvite({ code, email, password, name })` — **pública** (sem middleware), valida código, cria usuário via `supabaseAdmin.auth.admin.createUser` (`email_confirm: true` para não exigir verificação), cria/atualiza `profiles` com `agency_id` e `name`, insere `user_roles` com o `role` do convite, marca convite como `used_at/used_by`. Carrega `supabaseAdmin` via `await import` dentro do handler.

### UI
- Nova rota admin `src/routes/_authenticated.admin_.convites.tsx`:
  - Botão "Gerar convite" → modal com `name` (opcional) e `role` (funcionario/gerente).
  - Exibe código gerado com botão "copiar" e "copiar link" (`https://<app>/convite/<code>`).
  - Tabela: código, nome, role, criado em, expira em, status (ativo/usado/expirado), ação revogar.
- Nova rota pública `src/routes/convite.$code.tsx`:
  - Lê `code` do path, mostra formulário "Crie sua conta": email, senha, confirmar senha, nome (pré-preenchido se houver).
  - Validação Zod (email válido, senha ≥ 8, confirmação igual).
  - Submete em `redeemInvite`, ao sucesso faz `supabase.auth.signInWithPassword` e redireciona para `/dashboard-v3`.
  - Estados de erro: código inválido, expirado, já usado.
- Link "Tenho um convite" na tela `/login`.
- Sidebar admin: novo item "Convites" na seção admin.

## 3. Confete ao salvar lançamento de produção

- `bun add canvas-confetti @types/canvas-confetti`.
- Novo hook `src/hooks/useConfetti.ts` exportando `fireConfettiFromElement(el)` que dispara confete a partir do bounding rect do elemento (origem central do botão, cores do tema: primary/accent/success).
- Disparar no `onSuccess` da submissão em:
  - `src/routes/_authenticated.registrar-producao.tsx`
  - `src/routes/_authenticated.registrar-producao-v2.tsx`
  - `src/routes/_authenticated.registrar-producao-v3.tsx`
- Respeitar `prefers-reduced-motion`: se o usuário tiver essa preferência ativa, não disparar confete.

## Notas técnicas

- A migration de `user_invites` segue a ordem obrigatória: CREATE TABLE → GRANT → ENABLE RLS → CREATE POLICY.
- `redeemInvite` precisa autorizar pelo próprio código (segredo), já que é endpoint público; aplicar rate limit simples por IP via header se necessário em iteração futura.
- Realtime no ranking requer `ALTER PUBLICATION supabase_realtime ADD TABLE public.production_entries;` (se ainda não estiver).
- Nenhuma mudança em `daily_reports` ou no modelo legado.
