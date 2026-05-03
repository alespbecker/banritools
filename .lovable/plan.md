# BanriTools — Etapa 1.5 (Completar Modelagem) + Etapa 2 (Funcionalidades)

## Princípio

Sistema antigo (`daily_reports`, dashboard atual, ranking atual) **permanece intacto**. Tudo que for novo nasce em paralelo, em rotas dedicadas, marcadas como "(Novo)".

Priorizar lógica e estrutura, não UI. As telas podem ser simples.

---

## PARTE A — Completar Modelagem (Etapa 1.5)

### Migração SQL (uma única migration)

**1. `products` — adicionar:**

- `metric_type text not null default 'quantity'` — valores válidos: `quantity`, `amount`, `mixed` (validado por trigger, não CHECK)
- `display_order integer not null default 0` — ordenação na UI

**2. `production_entries` — adicionar:**

- `status text not null default 'confirmed'` — valores válidos: `draft`, `confirmed`, `cancelled` (validado por trigger)
- Índice em `(user_id, entry_date)` e `(agency_id, entry_date)` para dashboard

**3. `goals` — adicionar:**

- `period_type text not null default 'monthly'` — valores: `daily`, `weekly`, `monthly`, `quarterly`, `yearly` (trigger)
- `scope text not null default 'individual'` — valores: `individual`, `agency` (trigger)

**4. Seed inicial de `products**` (insert tool, não migration): popular com as 10 métricas atuais de `daily_reports` (seguro_vida, seguro_ap_smart, capitalizacao, credito_minuto_aumento, pj_conta_empresarial, pj_maquina_vero, consignado_volume, credito_fidelidade_volume, recuperacao_estagio_2, recuperacao_estagio_3) com `points_per_unit` espelhando `calculate_report_points` e `metric_type` apropriado.

`daily_reports` **não é tocada**. Triggers de pontos antigos continuam ativos.

---

## PARTE B — Etapa 2: Funcionalidades

Cada feature vive em `src/features/<modulo>/` (componentes, hooks, server functions). Rotas em `src/routes/_authenticated.<rota>.tsx` apontando para os módulos.

### 1. Registro de Produção (Novo)

- Rota: `/registrar-producao-v2`
- Form dinâmico baseado em `products` ativos (ordenados por `display_order`)
- Cada produto renderiza inputs conforme `metric_type` (quantidade, valor, ou ambos)
- Server fn cria `production_entries` com `status='confirmed'`
- Item no menu: "Registrar Produção (Novo)"

### 2. Dashboard (Novo, híbrido)

- Rota: `/dashboard-v2`
- KPIs agregados de `production_entries` (do mês corrente)
- Ranking pessoal, evolução semanal, distribuição por categoria de produto
- Toggle no topbar para alternar entre antigo/novo (preferência salva em localStorage)

### 3. Admin de Produtos

- Rota: `/admin/produtos` (admin-only)
- CRUD: nome, categoria, unidade, `metric_type`, `points_per_unit`, `display_order`, `active`
- Drag-to-reorder atualiza `display_order`

### 4. CRM — melhorias incrementais

- Mantém tela `/contacts` atual
- Adiciona: filtro por status, busca por nome/telefone, badge de "follow-up atrasado"
- Sem alterar schema de `contacts`

### 5. Interações de Contato (Nova tabela)

- Migration cria `contact_interactions` (id, contact_id FK, user_id, type [`call`,`message`,`meeting`,`note`], notes, occurred_at)
- RLS: dono do contato vê/insere; admin vê da agência
- UI: drawer no card do contato com timeline de interações + form de nova

### 6. Campanhas (Novas tabelas)

- Migration cria:
  - `campaigns` (id, agency_id, name, description, product_id?, target_quantity, period_start, period_end, status, created_by)
  - `campaign_contacts` (id, campaign_id, contact_id, status [`pending`,`contacted`,`converted`,`lost`], updated_at)
- RLS: agency-scoped; admin/gerente cria; funcionario lê e atualiza status
- Rota: `/campanhas` — listar, criar, ver detalhe com kanban de contatos

### 7. Metas (Novo sistema)

- Rota: `/metas`
- Admin/gerente: cria metas usando `goals` (produto, período, target_quantity, target_amount, scope, period_type)
- Funcionário: vê suas metas + agregação de `production_entries` para % de progresso

### 8. Ranking (Novo)

- Rota: `/ranking-v2`
- Calcula pontos a partir de `production_entries` × `products.points_per_unit`
- View materializável depois; nesta etapa, server fn agrega sob demanda
- Mantém `/ranking` antigo funcionando

---

## Estrutura de arquivos

```text
src/features/
  production/{components,server,hooks}/  → registrar-producao-v2
  dashboard/{components,server}/          → dashboard-v2
  admin/products/                         → admin/produtos
  contacts/{interactions,components}/     → drawer + timeline
  campaigns/{components,server}/          → /campanhas
  goals/{components,server}/              → /metas
  ranking/{components,server}/            → /ranking-v2
src/routes/
  _authenticated.registrar-producao-v2.tsx
  _authenticated.dashboard-v2.tsx
  _authenticated.admin.produtos.tsx
  _authenticated.campanhas.tsx
  _authenticated.metas.tsx
  _authenticated.ranking-v2.tsx
```

Sidebar ganha seção "Novo (beta)" agrupando rotas v2, sem remover as antigas.

---

## Ordem de execução

1. Migration: campos novos em `products`/`production_entries`/`goals` + tabelas `contact_interactions`, `campaigns`, `campaign_contacts` + índices + triggers de validação
2. Seed de `products` (insert tool)
3. Server functions por módulo (createServerFn com requireSupabaseAuth)
4. Rotas + componentes na ordem: produtos admin → registrar-producao-v2 → dashboard-v2 → metas → ranking-v2 → contact_interactions → campanhas
5. Sidebar atualizado por último

---

## Fallback se créditos acabarem

Ao final, se interromper, entrego lista clara: **feito** (com rotas funcionais) vs **não feito** (com próximo passo concreto). Prioridade decrescente: migration → produtos → registrar-v2 → dashboard-v2 → metas → ranking-v2 → interactions → campanhas.

---

## Não fazer

- Não remover/alterar `daily_reports`, `/dashboard`, `/registrar-producao`, `/ranking` antigos
- Não mover arquivos legados
- Não usar CHECK constraints (usar triggers para validação de enums em texto)
- Não tocar em `auth`, `storage`, schemas reservados