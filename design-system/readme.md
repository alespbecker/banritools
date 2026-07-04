# Banritools — Design System

Sistema de design interno do **Banritools**, uma plataforma de produtividade
comercial para a rede de agências (lançamento de produção, ranking, metas e
painel administrativo). A identidade visual deriva da marca **Banrisul** —
banco brasileiro — conforme o MIV (Manual de Identidade Visual) e o contrato
de tokens do projeto.

> **Verdade visual:** o alvo estético vem do **MIV + contrato de tokens**, não
> dos prints do app atual. Os screenshots servem apenas como referência de
> estrutura e fluxo (telas que existem), nunca de acabamento. Elevamos o
> visual: SaaS interno moderno, limpo, mobile-first — não institucional pesado,
> não genérico de template.

---

## Fontes (materiais recebidos)

Guardados em `uploads/` (não assuma que o leitor tem acesso; registramos):

- `16040_19151_MIV_Banrisul_3_publicado_22_08_2023_1.pdf` — MIV oficial Banrisul (marca de três hexágonos, paleta, tipografia Exo 2 + Source Sans).
- `contrato-de-tokens-banritools.md` — fonte única de verdade dos tokens.
- `inventario-componentes-banritools.md` — inventário priorizado de componentes.
- `achados-ux-banritools-estado-atual.md` — auditoria de UX do app atual.
- `01-plano-mestre-design-system-banritools.md`, `brief-inicio-claude-design-banritools.md` — plano e brief.
- `tokens.json`, `tokens.css` — export canônico de tokens.
- `Screenshot_*.jpg` — prints do app atual (estrutura/fluxo, não alvo estético).

A marca são três **porcas hexagonais** — hexágonos com furo circular vazado no
centro (funciona em qualquer fundo), o aceno literal a “tools” — representando
**o humano, o coletivo e o presente**. O wordmark “banritools” é sempre em
**Poppins** (`--font-brand`, 600, minúsculas).

---

## Produtos representados

Uma plataforma única, multi-superfície:

1. **App do consultor (mobile-first)** — dashboard pessoal, registrar produção, ranking, metas, perfil.
2. **Painel administrativo (web)** — gestão de agência, produtos, pontuação, usuários.

---

## CONTENT FUNDAMENTALS

Como escrevemos na interface.

- **Idioma:** português do Brasil, sempre.
- **Pessoa:** falamos com **você**. Direto e encorajador, nunca burocrático.
  Ex.: *"Sua central de operações"*, *"Lance suas vendas do dia em segundos"*.
- **Tom:** operacional e motivacional — é uma ferramenta de performance
  comercial. Reconhece progresso (*"+2.550 pts"*, *"Você subiu para 2º"*) sem
  ser infantil.
- **Ações = verbo no comando:** *"Salvar lançamento"*, *"Ver metas"*,
  *"Registrar produção"*, *"Exportar"*. Botão primário diz o que faz.
- **Rótulos de seção:** CAIXA ALTA discreta, curtos, com leve tracking —
  *"RESUMO DE HOJE"*, *"SUA POSIÇÃO"*, *"PRÓXIMA MELHOR AÇÃO"*. O rótulo recua,
  o número domina.
- **Números primeiro:** valores em R$ e pontos são protagonistas; descrições
  são suporte. Sempre `tabular-nums`.
- **Moeda:** formato brasileiro — `R$ 1.250,00` (ponto de milhar, vírgula de
  centavo). Valores positivos em verde `--success`.
- **Sem emoji.** Ícones (Lucide) cumprem o papel de sinalização visual.
- **Casing:** Títulos em *Sentence case* (não Title Case). Frases curtas,
  pontuação mínima.

---

## VISUAL FOUNDATIONS

### Cor
- **Primária — Azul Banrisul `#0094FF` (`--primary-500`).** Cor de
  reconhecimento da marca. **REGRA CRÍTICA:** reprova WCAG em texto normal
  (3.14:1). Use-a **apenas** em acentos, ícones, anel de foco e títulos
  grandes.
- **Texto e links:** `#0061B0` (`--link` / `--primary-700`).
- **Botões sólidos:** fundo `#0077DB` (`--primary-strong`) com rótulo branco.
- **Navy `#000050`** (`--brand-deep`): heros, headers de marca, CTA escuro.
- **Turquesa `#1CD8CA`** e **Roxo `#936FFA`**: acentos e data-viz; versões
  `-700` quando precisam virar texto.
- **Verde `#0E6E3B`** (`--success`): valores positivos em R$, estados de
  sucesso.
- **Neutros:** cinzas frios, levemente puxados ao navy. Texto corpo `gray-900`,
  texto suave `gray-600`, bordas `gray-200`.
- **Nunca hex cru em componentes** — sempre tokens semânticos.
- **Light & Dark mode** completos (`:root` / `.dark`). No escuro a primária
  clareia para `--primary-400` e links para `--primary-300`.

### Tipografia
- **Marca/wordmark “banritools”:** **Poppins** (600, minúsculas) — sempre, via
  `--font-brand`. Só para o wordmark; nunca em UI corrente.
- **Display/títulos:** **Exo 2** (600/700), tracking leve `0.01em` ecoando o
  logotipo. Geométrica, técnica, contemporânea.
- **Corpo/UI/números:** **Source Sans 3** (400/500/600). Legível, neutra.
- **Números e moeda:** Source Sans 3 + `tabular-nums` para alinhar colunas.
- Escala base 16px, ritmo modular (12 → 48px; stats até 64px).

### Espaço, raio, elevação
- **Espaçamento:** base 4px, ritmo 8pt. Padding de card 20–24px, gap entre
  cards 16px.
- **Raio:** `lg` 14px é o raio padrão de card; `full` para pílulas e avatares.
- **Sombras:** **tingidas de navy** (`rgba(0,0,80,…)`), curtas e suaves. Cards
  usam `sm`; popovers `md`; modais `lg`. Nada de sombra dura ou preta pura.
- **Cards:** superfície branca (light) / `gray-900` (dark), borda sutil
  `1px`, raio 14px, sombra curta. Variantes: `inverse` (navy hero), `accent`
  (verde, "próxima melhor ação").

### Fundo, movimento, estados
- **Fundos:** lisos. `--bg` (gray-50 light / gray-950 dark). Sem gradientes
  decorativos pesados; gradiente só como acento pontual (azul→turquesa em
  barras de progresso / heros). Sem texturas, sem ilustrações hand-drawn.
- **Animação:** discreta. `200ms` base, easing `cubic-bezier(0.2,0,0,1)`.
  Fades e lifts curtos (translateY -2px em cards interativos). Sem bounce, sem
  loops decorativos.
- **Hover:** superfícies clareiam/escurecem um passo; botões primários escurecem
  (`--primary-strong-hover`). Cards interativos sobem 2px + sombra `md`.
- **Press:** botões afundam 1px (`translateY(1px)`); FAB encolhe (`scale .95`).
- **Foco:** anel `--shadow-focus` (3px, primária a 35%) — sempre visível.
- **Bordas:** `1px` neutras; nunca borda colorida só à esquerda como ornamento.
- **Transparência/blur:** overlays de modal usam `--overlay` (navy translúcido);
  blur reservado para overlays, não decorativo.

---

## ICONOGRAPHY

- **Sistema:** **Lucide** (ícones de linha, traço 2px) — combina com a leveza
  geométrica do Exo 2. Carregado via CDN UMD (`window.lucide`); o componente
  `<Icon name="…" />` resolve por nome (kebab ou PascalCase).
- **Cor:** herda `currentColor`. Em tiles de KPI/lista, fica sobre um
  `bt-icontile` (fundo soft tonal + ícone na cor forte).
- **Acento `#0094FF` é permitido em ícones** (uso de UI ≥ 3:1), diferente de
  texto.
- **Sem emoji.** Sem PNG de ícone. Não desenhamos SVGs próprios de ícone —
  usamos o set Lucide.
- **Marca:** os SVGs do logo (três porcas hexagonais) vivem em `assets/` e são a única
  arte vetorial própria do sistema.
- **Substituição sinalizada:** o app real pode usar outro set; padronizamos em
  Lucide por ser CDN-disponível e visualmente próximo. Troque se o time
  fornecer o set oficial.

---

## Fonts — substituição sinalizada

**Exo 2**, **Source Sans 3** e **Poppins** (wordmark) são open-source (OFL) e
carregam do **Google
Fonts** (`tokens/fonts.css`). O MIV cita "Source Sans Pro"; usamos **Source
Sans 3**, sua continuação oficial idêntica em métricas. Se o time tiver os
binários oficiais, troque o `@import` por `@font-face` locais apontando para
`assets/fonts/`.

---

## Index — manifesto da raiz

**Entrada global**
- `styles.css` — único arquivo que o consumidor linka. Só `@import`s.

**Tokens** (`tokens/`)
- `fonts.css` — webfonts (Poppins, Exo 2, Source Sans 3).
- `palette.css` — primitivos de cor (escalas cruas; não usar direto).
- `colors.css` — tokens semânticos + tema dark + contrato de acessibilidade.
- `typography.css` — famílias, escala, pesos, tracking.
- `spacing.css` — espaço, raio, motion, z-index, breakpoints, sizing.
- `../base.css` — reset + defaults de elemento ligados aos tokens.
- `../components/components.css` — classes `.bt-*` dos componentes.

**Componentes** (`components/`)
- `core/` — `Button`, `IconButton`, `Badge`, `Card`, `Avatar`, `ProgressBar`, `Icon`.
- `forms/` — `Input`, `Select`, `Checkbox`, `Switch`.
- `data/` — `StatCard`, `RankRow`, `ListRow`, `CurrencyBRL`.
- `navigation/` — `AppBar`, `BottomNav`, `Tabs`, `SegmentedControl`.
- `feedback/` — `Banner`, `Dialog`.

**UI Kits** (`ui_kits/`)
- `consultor/` — app mobile do consultor (dark): login, início, registrar, ranking, metas, perfil.
- `admin/` — painel admin web (light): painel da agência, produtos, editor de produto.

**Guidelines** (`guidelines/`) — cards de specimen da aba Design System
(Cores, Type, Spacing, Brand).

**Assets** (`assets/`) — `logo-mark.svg`, `logo-mark-mono.svg`, `app-icon.svg`.

**Skill** — `SKILL.md` (compatível com Agent Skills / Claude Code).

**Aba Design System** — renderiza todo `.html` com `<!-- @dsCard … -->`.

> **Namespace de runtime:** `window.BanritoolsDesignSystem_38adfd`
> (ex.: `const { Button } = window.BanritoolsDesignSystem_38adfd`).

---

## Status

Concluído: fundação de tokens (cores, type, spacing, light/dark), logo,
cards de specimen, componentes (`core/`, `forms/`, `data/`, `navigation/`,
`feedback/` — 21 exports), dois UI kits (consultor mobile + painel admin web)
e `SKILL.md`.

**Substituições sinalizadas:** fontes (Exo 2 / Source Sans 3) e ícones
(Lucide) carregam via CDN — veja as seções acima. Forneça os binários
oficiais para self-host se desejar uso offline.
