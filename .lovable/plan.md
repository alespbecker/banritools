## Objetivo

Diferenciar os CTAs do header da Landing: "Entrar" continua indo para `/login`, e o botão principal vira **"Primeiro acesso"**, levando a uma nova página híbrida onde o usuário (a) informa um código de convite recebido ou (b) solicita um novo convite. Admins recebem essas solicitações em `/admin/convites`.

## Mudanças

### 1. Header da Landing (`src/features/marketing/Landing.tsx`)
- Renomear o botão "Acessar painel" para **"Primeiro acesso"** e apontar `to="/primeiro-acesso"`.
- "Entrar" permanece igual (`/login`).
- O CTA final da página ("Entrar no painel", linha 804) continua indo para `/login` — é usuário retornante.

### 2. Nova rota pública `src/routes/primeiro-acesso.tsx`
Layout único com dois blocos:

**Bloco A — "Já tenho um código de convite"**
- Input do código (8 caracteres, uppercase automático).
- Botão "Continuar" → navega para `/convite/$code` (a rota existente exige login e chama `redeem_invite_code`; a página `/convite/$code` já orienta o usuário a criar conta se ainda não tiver).

**Bloco B — "Ainda não tenho convite? Solicitar"**
- Campos: nome, email corporativo, agência (texto livre — não há tabela pública de agências acessível a anon), cargo (usa `CargoSelect`), mensagem opcional.
- Validação com Zod (nome ≤100, email válido ≤255, agência ≤120, mensagem ≤500).
- Ao enviar, insere em nova tabela `invite_requests`. Feedback de sucesso ("Solicitação enviada. Você receberá o código por email quando aprovada.") e limpa o formulário.

Meta head: título "Primeiro acesso — BanriTools", descrição pt-BR.

### 3. Nova tabela `invite_requests` (migration)

Colunas: `id`, `name`, `email`, `agency_name`, `cargo`, `cargo_especialidade`, `message`, `status` (`pending`/`approved`/`rejected`, default `pending`), `reviewed_by`, `reviewed_at`, `invite_id` (fk opcional para `user_invites` quando aprovado), `created_at`, `updated_at`.

Trigger `validate_invite_request_status` (não CHECK, segue padrão do projeto) e `set_updated_at`.

RLS + GRANTs:
- `GRANT INSERT ON public.invite_requests TO anon, authenticated;` (para o formulário público funcionar).
- `GRANT SELECT, UPDATE ON public.invite_requests TO authenticated;`
- `GRANT ALL ON public.invite_requests TO service_role;`
- Policy INSERT: `TO anon, authenticated USING (true) WITH CHECK (true)` — qualquer um pode solicitar. Rate-limit fica para depois se necessário.
- Policy SELECT: `TO authenticated USING (public.has_role(auth.uid(),'admin'))`.
- Policy UPDATE: `TO authenticated USING (has_role(...,'admin')) WITH CHECK (has_role(...,'admin'))`.
- Sem policy DELETE (apenas service_role).

### 4. `/admin/convites` (`src/routes/_authenticated.admin_.convites.tsx`)
- Nova aba/seção "Solicitações" listando `invite_requests` com status `pending`.
- Cada linha mostra nome, email, agência solicitada, cargo, data.
- Botão **"Aprovar e gerar código"** → cria um `user_invites` na agência do admin (usa `get_user_agency_id` + `gen_invite_code()`) e marca a solicitação como `approved` com `invite_id` preenchido. Exibe o código gerado para o admin copiar/enviar por fora.
- Botão **"Rejeitar"** → seta status `rejected`.
- Sem envio automático de email nesta iteração (não há infra transacional configurada); admin repassa o código manualmente.

## Não muda

- `/login` e cadastro direto: intactos.
- `/convite/$code`: intacto.
- Nenhuma alteração em `useAuth`, RPC de ranking, ou v3.
- Nenhum arquivo auto-gerado tocado.

## Riscos

- **Spam no formulário público** (RLS abre INSERT para anon). Mitigação para esta iteração: nenhum campo é exibido publicamente e admin sempre revisa antes de gerar código. Se virar problema, próximo passo é rate-limit por IP via server route em `/api/public/*` + captcha.
- Admin de agência A aprovando pedido de alguém que informou agência B: o código gerado vincula à agência do admin (comportamento de `user_invites`). Documentado no texto do card de aprovação.

## Detalhes técnicos

- Formulário público usa `supabase` (browser client + anon key) para o INSERT — não precisa de server function.
- Aprovação em `/admin/convites` executa duas queries via `supabase`: INSERT em `user_invites` + UPDATE em `invite_requests`. Envolve em try/catch e mostra toast.
- CargoSelect já existe em `src/features/auth/CargoSelect.tsx` e é reaproveitado.

## Ordem de execução

1. Migration `invite_requests` (aguarda aprovação e regenera types).
2. Criar `src/routes/primeiro-acesso.tsx`.
3. Editar `src/features/marketing/Landing.tsx` (renomear CTA + rota).
4. Estender `src/routes/_authenticated.admin_.convites.tsx` com a seção Solicitações.
