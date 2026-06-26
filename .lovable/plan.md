## Objetivo

1. Renomear a seção **Convites → Usuários**, mantendo a tabela atual de convites como histórico secundário.
2. Permitir que o **admin** edite **qualquer dado** de qualquer usuário da agência (perfil, cargo, função/role, produção) através de um modal disparado por um botão "Editar" em cada linha.
3. Suavizar a abertura/fechamento do menu lateral no mobile.

Sem mexer em nada fora desses três pontos.

---

## 1. Rota e navegação

- **Renomear** a entrada do sidebar (`src/components/DashboardSidebar.tsx`) de `Convites` para `Usuários` (mesmo ícone `Mail` substituído por `Users`). A rota física continua `/admin/convites` por simplicidade (sem migração de URL) — apenas o label muda. *(Se preferir mudar a URL para `/admin/usuarios`, faço com redirect; aviso no chat para confirmar.)*
- Atualizar `head().meta.title` da rota para "Usuários — BanriTools".

## 2. Tela "Usuários" (`src/routes/_authenticated.admin_.convites.tsx`)

Estrutura nova em duas seções dentro da mesma página:

```text
PageHeader: Usuários
  action: [Gerar convite]   (mantido)

InfoCard "Equipe"  ← NOVO (principal)
  Tabela: Avatar | Nome | Email | Cargo | Função | Status | [Editar]
  Botão Editar (ícone Pencil) abre <UserEditDialog />

InfoCard "Histórico de convites"  ← existente, recolhido visualmente
  Mantém colunas atuais; sem mudanças funcionais.
```

### `<UserEditDialog />` (novo, `src/features/admin/UserEditDialog.tsx`)

Modal com abas (`Tabs` shadcn) reaproveitando o visual de `/perfil`:

- **Perfil** — nome, telefone, job_title, cargo + cargo_especialidade, avatar (upload reaproveitando o fluxo de `perfil.tsx`).
- **Acesso** — função (`app_role`) via `admin_set_user_role` (RPC já existente).
- **Produção** — lista paginada de `production_entries` do usuário (produto, data, qtd, valor, status) com ações **Editar** / **Excluir** inline. Edição inline simples (Dialog secundário com produto/variant/quantidade/valor/data/notas).

Sem reescrever `/perfil` — extraio um único helper `updateProfileFields(profileId, patch)` em `src/features/admin/users.ts` usado pelo dialog e, opcionalmente, pela página de perfil. Tudo client-side usando o `supabase` browser client (RLS).

## 3. Permissões (migration)

Hoje admin já **lê** profiles, user_roles e production_entries da agência, mas **não consegue UPDATE/DELETE** dos demais usuários. Adicionar políticas restritas a `admin` da mesma agência:

```sql
-- profiles: admin pode atualizar perfis da própria agência
CREATE POLICY "Admins can update agency profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (has_role(auth.uid(),'admin') AND agency_id = get_user_agency_id(auth.uid()))
WITH CHECK (has_role(auth.uid(),'admin') AND agency_id = get_user_agency_id(auth.uid()));

-- production_entries: admin pode atualizar/excluir lançamentos da agência
CREATE POLICY "Admins manage agency production update" ON public.production_entries
FOR UPDATE TO authenticated
USING (has_role(auth.uid(),'admin') AND agency_id = get_user_agency_id(auth.uid()));

CREATE POLICY "Admins manage agency production delete" ON public.production_entries
FOR DELETE TO authenticated
USING (has_role(auth.uid(),'admin') AND agency_id = get_user_agency_id(auth.uid()));
```

`user_roles` continua sendo alterado **apenas** via RPC `admin_set_user_role` (já valida agência e protege último admin). Sem nova policy de UPDATE direto.

Storage `avatars`: o upload pelo admin grava em `${targetUserId}/avatar-*` — verifico a policy do bucket; se necessário, adiciono policy permitindo admin escrever em paths de usuários da mesma agência. *(Reporto no chat se exigir ajuste de storage.)*

## 4. Otimização do menu mobile

Causa provável da "travadinha": o `Sheet` anima `transform` enquanto o `DashboardSidebar` interno tem `backdrop-blur-md` + `transition-[width]`. No mobile (`forceExpanded`) a transição de largura não é usada, mas o blur duplicado (Sheet overlay + sidebar) custa caro no primeiro frame.

Ajustes em `src/routes/_authenticated.tsx` e `DashboardSidebar.tsx`:

- Adicionar `will-change: transform` ao `SheetContent` mobile.
- Quando `forceExpanded` for true, remover `transition-[width]` do `<aside>` e remover o `backdrop-blur` interno (mantendo só o do SheetContent) — elimina o blur aninhado.
- Reduzir duração da animação do Sheet para `duration-200` via classe utilitária.

Sem alterar comportamento desktop.

---

## Arquivos tocados

- `src/components/DashboardSidebar.tsx` — label "Usuários", ícone `Users`, classes condicionais para mobile.
- `src/routes/_authenticated.tsx` — `SheetContent` com `will-change`/duração.
- `src/routes/_authenticated.admin_.convites.tsx` — nova seção "Equipe" + título da página.
- `src/features/admin/UserEditDialog.tsx` *(novo)* — modal com abas Perfil/Acesso/Produção.
- `src/features/admin/users.ts` *(novo)* — helpers `updateProfileFields`, `listUserEntries`, `updateEntry`, `deleteEntry`.
- 1 migration: políticas de UPDATE/DELETE para admin em `profiles` e `production_entries`.

## Riscos e mitigações

- **RLS mais permissiva**: escopo limitado a `admin` + mesma agência via `has_role` (security definer já existente). Não amplia acesso de `gerente`/`funcionario`.
- **Avatar de terceiros no storage**: confirmo policy antes de habilitar upload no dialog; se bloqueada, oculto o botão de avatar no modo admin e libero só os campos de texto nessa primeira versão.
- **Edição de produção pode disparar pontos/ranking**: o modelo novo (`production_entries`) não está ligado aos triggers de pontos (só `daily_reports`), então editar/excluir aqui não corrompe gamificação legada.

Sem mudanças em dashboards, exports, auth flow ou outros componentes.
