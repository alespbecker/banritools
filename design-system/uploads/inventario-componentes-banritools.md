# Banritools — Inventário Priorizado de Componentes

**Guia do Projeto · Frente de Design · v0.1**

> Fonte única de verdade da camada de componentes (o "contrato" que o component-agent consome).
> Derivado das telas auditadas. Cada item é etiquetado por **balde** e **prioridade**, definindo a ordem de build, a ordem de criação no Claude Design e a ordem da migração.

---

## Os três baldes

- 🟢 **shadcn padrão** — usa como vem; só herda os tokens. Estados (hover/foco/disabled) já vêm do Radix. Não re-especificar.
- 🟡 **override de marca** — shadcn + ajuste de token, estado ou variante. Trabalho leve.
- 🔵 **custom bancário** — precisa de design real. É aqui que o pitch ganha ou perde. **Os estados destes são definidos dentro do próprio componente.**

---

## Inventário por nível atômico

### Átomos

| Componente | Balde | Prioridade | Nota |
|---|---|---|---|
| Button (primary / outline / ghost) | 🟡 | P0 | sólido usa `primary-strong`+`on-primary`; foco em `primary-500` |
| Input / text field | 🟡 | P0 | anel de foco `primary-500`; estados de erro com `error` |
| Badge / Pill | 🟡 | P0 | **corrige A2**: pontos, papéis (Admin/TIME), "1 un", pts/unidade — todos com contraste ok |
| Card (shell) | 🟡 | P0 | superfície + borda + raio `lg` + elevação `sm` |
| Icon system (Lucide) | 🟡 | P0 | padroniza Lucide + SVGs custom de marca (hexágono, "flor" Pix) |
| Avatar | 🟢 | P0 | iniciais / foto (visto em Perfil e top bar) |
| Link inline ("Abrir →") | 🟡 | P0 | `link` (700 claro / 300 dark) |
| Progress bar | 🟡 | P1 | **corrige A2**: barra de ranking acessível |
| Checkbox / Switch | 🟢 | P1 | "Utilizar Biometria", toggles |
| Select / Dropdown | 🟢 | P1 | filtro "Mês Atual" |
| Tooltip | 🟢 | P2 | — |

### Moléculas

| Componente | Balde | Prioridade | Nota |
|---|---|---|---|
| **KPI / Stat card** | 🔵 | P1 | tile de ícone + rótulo + número grande + sub-rótulo (Engajamento, Produtos 21…) |
| **Currency display (R$)** | 🔵 | P1 | `tabular-nums`; positivo em `success-700`. Átomo bancário reusadíssimo |
| Form field (label+input+helper/erro) | 🟡 | P1 | com ícone à esquerda (visto no Perfil) |
| Empty state | 🟡 | P1 | já bom; só herdar tokens (ícone + título + CTA) |
| Sticky save bar | 🔵 | P1 | **corrige A2**: "Salvar lançamentos" com contraste |
| Search + filtros bar | 🟢 | P2 | "Buscar…" + "Filtros avançados" |
| Toast (Sonner) | 🟢 | P2 | feedback de ação |
| Nav item | 🟡 | P1 | item da bottom nav / drawer |

### Organismos

| Componente | Balde | Prioridade | Nota |
|---|---|---|---|
| **Top app bar** | 🔵 | P1 | hambúrguer, busca, refresh, sino, avatar |
| **Bottom navigation** | 🔵 | P1 | Início / Pagamentos(Produção) / Produtos / Menu |
| **Ranking card** | 🔵 | P1 | "Sua Posição" + progresso vs. líder + "Líder do Mês" — **tela-bandeira do pitch** |
| **Próxima Melhor Ação card** | 🔵 | P1 | padrão forte que já existe; elevar |
| **Production entry form** | 🔵 | P2 | núcleo operacional: cards por produto, Quantidade/Valor, regra de pontos |
| Últimos lançamentos (lista) | 🔵 | P2 | item: produto + data + categoria + un + R$ |
| Performance table + export | 🔵 | P2 | tabela densa "Performance por Colaborador" |
| Product editor (field_schema) | 🔵 | P3 | o mais complexo; depende do field_schema |
| Profile form | 🟡 | P3 | composição de form fields |
| Charts (Recharts) | 🔵 | P3 | séries em `primary`/`turquoise`/`purple`; data-viz acessível |
| Side drawer / menu | 🔵 | P3 | navegação completa |

---

## Decisão pendente que trava P1: o FAB

O botão flutuante `+` sobrepõe conteúdo em quase toda tela (A1) e tem função ambígua. Antes de construir os organismos, **resolver**: (a) é uma ação global de "novo lançamento"? (b) recolhe ao rolar? (c) vira ação contextual por tela? Recomendação inicial: FAB único e contextual ("novo lançamento" no fluxo de produção), removido das telas onde só duplica um botão já visível (ex.: Metas).

---

## Ordem de produção (a fila)

- **P0 — Fundação reutilizável:** Button, Input, Badge, Card, Icon, Avatar, Link. *Sem eles nada se monta.*
- **P1 — Telas-bandeira do pitch:** KPI card, Currency, Ranking card, Próxima Melhor Ação, Top bar, Bottom nav, Empty state, Sticky save bar + **decisão do FAB**.
- **P2 — Fluxos operacionais:** Production entry form, Últimos lançamentos, Performance table.
- **P3 — Profundidade e polimento:** Product editor, Charts, Profile, Drawer.

---

## Regra de ouro: validar com um vertical slice

Não especificar tudo no vácuo. Assim que P0 + os componentes P1 do **Ranking** estiverem prontos, montar **uma tela real completa** (o Ranking) no Claude Design e validar contra a marca **antes** de produzir o resto. Os estados dos componentes custom se fecham aí, no contexto real.

---

*v0.1 — Inventário inicial. Próximo: resolver o FAB e produzir P0 no canvas.*
