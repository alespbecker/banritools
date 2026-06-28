
# Parte 1 — Landing page de apresentação

Hoje `/` apenas redireciona para `/login` ou `/dashboard-v3`. Vou transformar `/` em uma landing pública (estilo AirPods) e mover o redirect para um gate condicional: usuários autenticados continuam indo direto para o dashboard; visitantes veem a landing.

### Estrutura da página (scroll-driven)

Inspirada na página dos AirPods: cada seção "pina" enquanto o usuário rola e o produto (no nosso caso, o **hexágono do logo + dashboards mockados**) anima em resposta ao scroll. Implementado com Motion (`framer-motion`) usando `useScroll` + `useTransform` — já está no projeto, sem dependências novas.

```
┌──────────────────────────────────────────┐
│ 1. HERO                                  │
│    Logo gigante animado (hexágonos       │
│    girando/montando) + headline:         │
│    "banritools — sua produção,           │
│    em tempo real."                       │
├──────────────────────────────────────────┤
│ 2. PIN: REGISTRO RÁPIDO                  │
│    Mockup do card de produto cresce      │
│    da direita conforme rola; números     │
│    do odômetro sobem.                    │
├──────────────────────────────────────────┤
│ 3. PIN: PAINEL DA AGÊNCIA                │
│    KPIs aparecem em sequência (stagger), │
│    gráfico desenha de 0→100% no scroll.  │
├──────────────────────────────────────────┤
│ 4. PIN: RANKING & GAMIFICAÇÃO            │
│    Pódio 3D sobe; badges entram em órbita│
├──────────────────────────────────────────┤
│ 5. RELATÓRIOS                            │
│    PDF "folheia" páginas conforme rola.  │
├──────────────────────────────────────────┤
│ 6. CTA FINAL                             │
│    "Entrar" / "Tenho um convite"         │
└──────────────────────────────────────────┘
```

### Detalhes técnicos
- Nova rota `src/routes/_marketing.tsx` (layout sem sidebar) + `src/routes/_marketing.index.tsx` (a landing).
- `src/routes/index.tsx` vira: `if (isAuthenticated) <Navigate to="/dashboard-v3" />; else <Navigate to="/apresentacao" />` — ou mais simples, monta a landing inline.
- Componentes em `src/features/marketing/`: `Hero.tsx`, `ScrollScene.tsx` (wrapper com `position: sticky` + `useScroll`), `SectionRegistro.tsx`, `SectionPainel.tsx`, `SectionRanking.tsx`, `SectionRelatorios.tsx`, `CtaFinal.tsx`.
- Sem imagens novas — reutilizo `Logo.tsx` e desenho os mockups em SVG/HTML com os tokens do DS v2.
- `prefers-reduced-motion`: substituo animações por fade simples.
- SEO: `head()` próprio com title/description/og.

---

# Parte 2 — Sistema de pontos coerente

### Diagnóstico

Fórmula atual: `pts = (quantity + amount) × points_per_unit`. Isso é matematicamente incorreto para produtos por valor:
- **Consignado** com `points_per_unit = 1` e amount de R$ 770.600 → **770.600 pontos** em um único lançamento.
- **Cartão de Crédito** (5 unidades × 30) → 150 pontos.
- Resultado: gaps de milhões; ranking dominado por quem registra valor; quantidade vira ruído.

Os produtos `metric_type='amount'` já têm `points_per_unit` arbitrariamente baixo (0,002 nos legados, 1–2 nos novos) tentando "compensar" — solução frágil.

### Proposta: pontos por "lote" + separação de quantidade e valor

Adicionar duas colunas explícitas em `products`:

| coluna                | tipo    | significado                                              |
|-----------------------|---------|----------------------------------------------------------|
| `points_per_quantity` | numeric | pontos por **1 unidade** vendida                         |
| `points_per_amount`   | numeric | pontos por **R$ 1.000** contratados (lote configurável)  |
| `amount_bucket`       | integer | tamanho do lote em R$ (default 1000)                     |

**Nova fórmula única:**
```
pts(entry) = quantity   * product.points_per_quantity
           + (amount / product.amount_bucket) * product.points_per_amount
```
Ambos os termos são aditivos. Produtos só-quantidade têm `points_per_amount = 0`; só-valor têm `points_per_quantity = 0`; mistos têm os dois. `metric_type` continua existindo apenas para definir quais campos o formulário mostra.

### Calibração sugerida (alvo: top performer ~3.000–6.000 pts/mês; gap entre 1º e 10º ~ centenas)

| Produto                          | qty pts | R$/lote | pts/lote |
|----------------------------------|--------:|--------:|---------:|
| Seguro Vida                      | 50      | —       | —        |
| Seguro AP Smart                  | 30      | —       | —        |
| Capitalização                    | 20      | —       | —        |
| Previdência                      | 15      | 1.000   | 1        |
| Conta Empresarial PJ             | 60      | —       | —        |
| Máquina Vero                     | 50      | —       | —        |
| Portabilidade de Salário         | 40      | —       | —        |
| Cartão de Crédito                | 30      | —       | —        |
| Banricompras                     | 5       | —       | —        |
| Crédito Minuto (cada)            | 10      | 1.000   | 2        |
| Cheque Especial                  | 5       | 1.000   | 1        |
| Pacotes / Serviços               | 15      | —       | —        |
| Investimentos / CDB Auto         | 5       | 10.000  | 2        |
| **Consignado**                   | —       | 1.000   | 3        |
| **Crédito Fidelidade**           | —       | 1.000   | 2        |
| Recuperação (E2 e E3 unificados) | —       | 1.000   | 4        |
| NPS                              | 5       | —       | —        |

Resultado prático: o consignado de R$ 770.600 acima passa de 770k → **2.312 pts** (770,6 × 3). Cartões e seguros voltam a competir.

Valores ficam **editáveis em `/admin/produtos`** — a tabela acima é o seed inicial.

### Migração / compatibilidade

1. **Migration SQL**:
   - `ALTER TABLE products ADD COLUMN points_per_quantity numeric NOT NULL DEFAULT 0`
   - `ALTER TABLE products ADD COLUMN points_per_amount   numeric NOT NULL DEFAULT 0`
   - `ALTER TABLE products ADD COLUMN amount_bucket       integer NOT NULL DEFAULT 1000`
   - `UPDATE products SET …` com os valores da tabela acima (por slug).
   - Manter `points_per_unit` por enquanto (deprecated; remover em segunda passada).

2. **Front-end**: substituir a fórmula em **3 lugares** (`_authenticated.admin.tsx`, `_authenticated.dashboard-v3.tsx`, `_authenticated.ranking-v3.tsx`) por um helper único `calcEntryPoints(entry, product)` em `src/features/production/points.ts`. Single source of truth, fácil migrar.

3. **Admin / Produtos**: adicionar dois inputs (pts/unidade, pts por R$ X) + display do `amount_bucket`.

4. **Exibição para o gestor**: no card de produto e no relatório, mostrar a regra em texto curto: *"Seguro Vida — 50 pts por unidade"* / *"Consignado — 3 pts a cada R$ 1.000"*. Transparente e explicável.

5. **Gamificação legada** (`points_log`, `user_points`, `ranking_monthly`, `daily_reports`, `calculate_report_points`): permanecem intactos. O dashboard novo já calcula client-side a partir de `production_entries`, então a mudança é puramente cosmética para o usuário final.

### Não vou mexer (escopo)
- Tabela `daily_reports` e suas triggers de pontos (legado, sem leitura no UI ativo).
- Badges / níveis / `get_level()` — podem ser reavaliados depois quando virmos a nova escala em produção.

---

# Ordem de execução proposta

1. Pontos (migration + helper + 3 substituições + UI admin) — base sólida primeiro.
2. Landing page (rota + seções + scroll animations).
3. Smoke test em mobile e desktop; conferir números do `/admin` antes/depois.

Confirma? Posso ajustar a tabela de pontos antes de aplicar se quiser calibrar outro alvo (ex.: top ~10.000 pts/mês).
