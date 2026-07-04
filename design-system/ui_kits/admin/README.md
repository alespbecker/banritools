# UI Kit — Painel Admin (web)

Recreação interativa do painel administrativo web Banritools, em **light mode**.
Layout de produto SaaS: sidebar + topbar + conteúdo.

## Arquivos
- `index.html` — shell de layout (sidebar, topbar, conteúdo); monta o app inline (`text/babel`). Tag `@dsCard`.
- Telas e roteamento (Painel, Produtos, Editor) vivem inline em `index.html`.

## Telas
- **Painel da Agência** — KPIs (engajamento, média, top performer, gap),
  Top 10 de pontuação, total da agência vs. meta, comissão prevista.
- **Produtos** — tabela do catálogo (categoria, pts/unidade, métrica, ativo).
  Clique numa linha para editar.
- **Editar Produto** — abas Informações / Variantes / Esquema de campos;
  bloco de "Comissão prevista do vendedor" (verde).

## Componentes consumidos
`StatCard`, `RankRow`, `ListRow`, `Tabs`, `SegmentedControl`, `Badge`,
`Button`, `IconButton`, `Avatar`, `Card`, `ProgressBar`, `CurrencyBRL`,
`Input`, `Select`, `Banner`, `Checkbox`, `Icon` — todos do `_ds_bundle.js`.

## Interação
Navegue pela **sidebar**. Em **Produtos**, clique numa linha para abrir o
editor com abas. **Voltar para Produtos** retorna à lista.
