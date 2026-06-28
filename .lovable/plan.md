
# Auditoria — Fluxo de Dados, Relatórios e Segurança

Modo somente leitura. Nada será alterado neste plano — abaixo segue o diagnóstico por área, evidências coletadas no banco/código, simulações de problemas e a remediação recomendada para quando for autorizado agir.

---

## 1) Estado do banco (snapshot agora)

- `production_entries`: **628** lançamentos, **10** usuários, datas **19/06 → 28/06/2026**, qtd total **604**, valor **R$ 2.258.500,00** (dados do seed).
- `daily_reports`: legado, não é mais lido por nenhuma tela (boa notícia — fonte única é `production_entries`).
- `ranking_monthly`, `points_log`, `user_points`: **0 linhas**. Isso é a causa-raiz do problema #2 abaixo.
- `products`: 22 produtos cadastrados, com `metric_type` e `points_per_unit` coerentes (ex.: Consignado ppu=1, Recuperação E2/E3 ppu=0,002, Seguro Vida ppu=50).

---

## 2) Coerência por seção (coleta → envio → recebimento → apresentação)

### Registrar Produção (`/registrar-producao-v3`)
- Coleta `quantity` + `amount` + `variants` e grava em `production_entries` com `status='confirmed'`. `agency_id` é preenchido pelo trigger `fill_production_entry_agency`. **OK.**
- Realtime dispara `banritools:sync`, que invalida o painel admin com debounce de 500 ms. **OK.**

### Dashboard pessoal (`/dashboard-v3`)
- Lê `production_entries` do mês do usuário + da agência para ranking local. **OK.**
- Pontuação: `pts = (quantity + amount) × points_per_unit`. **Observação:** para produtos `mixed` (ex.: Seguro Vida, ppu=50), 1 unidade + R$ 500 vira `551 × 50 = 27.550 pts` — fórmula consistente em todas as telas, mas potencialmente inflada. Não é um bug; é uma decisão de produto que vale revisar quando quiser calibrar gamificação.

### Ranking (`/ranking-v3`)
- Calcula no cliente a partir de `production_entries`. Mesma fórmula do dashboard. **Consistente.**

### Painel da Agência (`/admin`)
- KPIs e agregações (`stats`, `teamStats`, `entriesAgg`) lêem `production_entries` filtrando por `agency_id` + `status='confirmed'` + janela mensal. **OK.**
- **PROBLEMA REAL — coluna "Pontos do mês" e gráfico "Top 10 do Ranking" lêem de `ranking_monthly`, que está vazia.** A tabela só é alimentada pelo trigger `handle_report_points` em `daily_reports` (legado descontinuado). Resultado: pontos/posição aparecem como `0`/`—` no painel da agência e no export Detalhado, mesmo com produção registrada.
  - **Remediação sugerida** (a aplicar depois): trocar o consumo de `ranking_monthly` por agregação client-side sobre `production_entries` (idêntica ao `/ranking-v3`), ou portar a função `update_monthly_ranking` para um trigger em `production_entries`. Recomendo a 1ª opção (mais simples, fonte única, sem manter trigger legado).

### Metas (`/metas`) e Campanhas (`/campanhas`)
- `goals` é lido com filtro de período e escopo. Dashboard usa `personalMonthGoal` e `personalDailyGoal` corretamente. **OK.**
- `goalsAtRisk` usa elapsed%×target×0,8 — fórmula plausível, alinhada ao mês corrente.

### Contatos (`/contacts`)
- `overdueFollowups` e `pendingContacts` derivados de `contacts.next_follow_up`/`status`. Lógica coerente.

### Usuários (`/admin/convites`)
- Painel admin de edição de perfil e produção individual. Usa o serviço `src/features/admin/users.ts`. Sem inconsistência detectada na navegação ↔ dados.

---

## 3) Relatórios (export — foco do pedido)

### Variantes
- **Detalhado** (`rawRows`): 1 linha por lançamento (`production_entries`) — Data, Colaborador, Email, Categoria, Produto, Qtd, R$. **OK.**
- **Resumido** (`summaryRows`): agrupa por `entry_date|product` somando `quantity`/`amount` e contando colaboradores únicos. Ordenação data DESC, produto ASC. **OK.**

### KPIs do cabeçalho do PDF/XLSX
- `Engajamento %`, `Unidades`, `Vol. Crédito`, `Recuperação` — todos derivados de `entriesAgg` (production_entries). **Consistentes.**

### Problemas/riscos detectados
1. **Pontos no Detalhado**: a coluna "Pontos do mês" no export por colaborador (`exportRows`) puxa de `rankMap` (= `ranking_monthly`). Pelo motivo #2 acima, sai **0 para todos**. — Mesma remediação: usar agregação client-side.
2. **Carregamento da Poppins no PDF** (`ExportDialog.loadPoppins`): faz `fetch` em `cdn.jsdelivr.net` → fallback `raw.githubusercontent.com`. Se o usuário estiver em rede corporativa Banrisul bloqueando CDN externa, o PDF renderiza com fonte fallback (Helvetica). Não quebra o relatório, só perde a marca. — **Sugestão:** empacotar o TTF no bundle (`?url` import) ou hospedar em `/public/fonts/`.
3. **Filtro de status `"inactive"`**: ao exportar, `rawRows`/`summaryRows` filtram só ativos quando há filtros aplicados; com `statusFilter='inactive'`, o export Detalhado fica **vazio** (esperado, mas pode confundir). — Sugestão: rótulo no diálogo avisando "Inativos não possuem lançamentos".
4. **Tipos `mixed` no Resumido**: para Seguro Vida etc., uma linha terá `quantity=1` e `amount=500` na mesma célula-resumo. É correto, mas analista pode interpretar como dupla contagem. — Sugestão: nota de rodapé "produtos mistos podem somar unidades e valor monetário simultaneamente".
5. **`amount=0` em produtos `quantity-only`** (Cartão de Crédito, PJ, NPS, Portabilidade): aparece como `R$ 0,00` no Resumido. Tecnicamente correto, mas visualmente poluído. — Sugestão: render condicional ("—" quando produto não tem métrica monetária).

### Simulações executadas
- ✅ Soma `production_entries` por data confere com `entriesAgg` (10 dias × 10 usuários ≈ 60 entries/dia, total R$ 2,26 mi).
- ✅ Aggregator do Resumido bate produto a produto com `SELECT … GROUP BY entry_date, product`.
- ⚠️ Ranking exportado = 0 (confirmado pelo `count(*) ranking_monthly = 0`).

---

## 4) Segurança — findings e o que fazer com cada um

### 🔴 ERROR — corrigir antes de ir ao ar
1. **`PROFILE_AGENCY_SELF_ASSIGN`** — Policy UPDATE de `profiles` não tem `WITH CHECK`. Usuário pode `update profiles set agency_id='<outra-agência>' where id=auth.uid()` e ler tudo daquela agência (campaigns, ranking, contacts).
   **Ação:** recriar a policy com `WITH CHECK (id = auth.uid() AND agency_id = public.get_user_agency_id(auth.uid()))`. (Migration trivial.)
2. **`AUDIT_LOG_AGENCY_INJECTION`** — INSERT em `audit_logs` aceita qualquer `agency_id`. Permite poluir o log de outra agência ou injetar evento global (`NULL`).
   **Ação:** adicionar `agency_id = public.get_user_agency_id(auth.uid())` ao `WITH CHECK`.

### 🟡 WARN — endurecer assim que possível
3. **`admin_route_client_guard`** — `/admin` e `/admin/produtos` só fazem `useEffect`-redirect. UI pisca para não-admin antes de redirecionar. RLS protege os dados, mas o ideal é gate em `beforeLoad`.
   **Ação:** mover a verificação para `beforeLoad` da rota usando `requireSupabaseAuth` + `has_role('admin')`. Esconder antes de montar.
4. **`PRODUCTION_INSERT_NO_AGENCY_PIN` / `DAILY_REPORTS_INSERT_NO_AGENCY_PIN`** — INSERT não fixa `agency_id`. O trigger `fill_production_entry_agency` mitiga, mas se o usuário enviar um `agency_id` explícito, ele passa.
   **Ação:** acrescentar `WITH CHECK (... AND agency_id = public.get_user_agency_id(user_id))` nas duas policies. `daily_reports` é legado, mas ainda tem RLS aberta.
5. **`AGENCIES_FULLY_READABLE`** — Lista de agências (nomes/cidades) visível a qualquer usuário autenticado. Para um SaaS interno de um único banco isso pode ser intencional, mas se planeja multiagência segregada, restringir a `id = get_user_agency_id(auth.uid())`.
   **Ação:** decidir; se segregar, criar policy com filtro.
6. **`MISSING_INVITE_ANON_READ`** — Falso positivo. O fluxo já usa RPC `redeem_invite_code` (`SECURITY DEFINER`), não SELECT direto. **Ignorar** com nota.
7. **Supabase linter — `Public Bucket Allows Listing` (bucket `avatars`)** — listagem pública das chaves do bucket. Avatares são públicos por design, mas listagem expõe quem tem foto/quantas.
   **Ação:** restringir SELECT em `storage.objects` ao bucket `avatars` para `auth.uid()` dono, mantendo o bucket `public` apenas para download por URL.
8. **Supabase linter — `Leaked Password Protection Disabled`** — habilitar HIBP via `configure_auth({ password_hibp_enabled: true })`.
9. **Supabase linter — 4×`anon`/4×`authenticated` SECURITY DEFINER executáveis** — provavelmente `gen_invite_code`, `has_role`, `get_user_agency_id`, `redeem_invite_code`, `calculate_report_points`, `get_level`, `check_badges`, `update_monthly_ranking`, `admin_set_user_role`.
   **Ação:** auditar cada uma:
     - `redeem_invite_code` precisa de `authenticated` → OK manter.
     - `has_role`, `get_user_agency_id` são usadas em policies → manter `authenticated`.
     - `gen_invite_code`, `update_monthly_ranking`, `check_badges`, `calculate_report_points`, `admin_set_user_role` → `REVOKE EXECUTE … FROM anon, authenticated` (são chamadas pelo servidor/triggers, não pelo cliente).

---

## 5) Riscos operacionais quando for ao ar (e mitigação)

| Cenário | Sintoma | Mitigação |
|---|---|---|
| Sessão `getSession` cai durante export PDF longo | Erro de auth no meio do download | O export é client-side puro, não chama Supabase no meio — sem risco |
| Realtime cai (Wi-Fi corporativo) | KPIs do admin ficam estáticos | Já há fallback: F5 refaz fetch; debounce protege de tempestade |
| Volume real (10–20 agências × 50 usuários × 1 ano) | Query `production_entries` no admin pode ficar lenta | Criar index em `(agency_id, entry_date, status)` antes de escalar |
| 2 admins editam o mesmo usuário simultâneo | Última gravação vence | Aceitável p/ MVP; revisitar com `updated_at` optimistic-lock se virar atrito |
| Usuário muda fuso horário | `new Date().toISOString().split('T')[0]` usa UTC; pode "perder" o dia depois das 21h BRT | Trocar por `Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' })` em todas as telas |

---

## 6) Recomendação de ordem de execução (quando autorizar)

1. **Migration #1** (segurança crítica): WITH CHECK em `profiles`, `audit_logs`, `production_entries`, `daily_reports`.
2. **Migration #2**: revogar EXECUTE de funções SECURITY DEFINER não-cliente; habilitar HIBP.
3. **Code #1**: trocar consumo de `ranking_monthly` por agregação client-side no painel admin (corrige "Pontos do mês = 0" no relatório).
4. **Code #2**: `beforeLoad` admin com `has_role('admin')`.
5. **Code #3**: Poppins local + fuso horário BRT em todas as datas.
6. **Polish**: rótulos de export ("—" para produtos sem amount, nota de produtos mistos).

Aguardo seu OK para começar pelo passo 1.
