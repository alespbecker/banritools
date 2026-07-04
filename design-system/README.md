# Banritools Design System — Referência viva

Este diretório é a **fonte de verdade canônica** do Design System do Banritools,
entregue via handoff do Claude Design (bundle `Banritools_Design_System-handoff.zip`).

## Regras de uso

- **NÃO importe nada daqui em `src/*`.** Nenhum arquivo deste diretório entra
  no bundle Vite. É documentação viva + referência de design.
- Migrações graduais **copiam** tokens/regras para `src/styles.css` (fase 1),
  `src/styles/tokens.css` e componentes shadcn. A cópia é intencional e revisada,
  não um `@import`.
- Ao editar visuais no app, consulte primeiro:
  - `readme.md` — brand voice, content fundamentals, visual foundations
  - `tokens/colors.css` — contrato de acessibilidade WCAG (crítico)
  - `components/**/*.prompt.md` — spec por componente
  - `ui_kits/consultor/` — mockups mobile de referência (dark)
  - `ui_kits/admin/` — mockups do painel admin (light)
  - `guidelines/*.card.html` — specimens de cor, tipografia, spacing, brand

## Estrutura

```
design-system/
├── SKILL.md                # Spec da agent skill (também instalada em .agents/skills/)
├── readme.md               # Brief completo pt-BR (marca, tom, foundations)
├── styles.css              # Entry único que importa tudo (não usar em runtime)
├── base.css                # Reset + defaults de elemento
├── tokens/
│   ├── fonts.css           # Poppins + Exo 2 + Source Sans 3 (Google Fonts)
│   ├── palette.css         # Primitivos crus (não usar direto)
│   ├── colors.css          # Tokens semânticos + tema dark + regras WCAG
│   ├── typography.css      # Escala, pesos, tracking
│   └── spacing.css         # Espaço 8pt, radius, motion, z-index
├── components/             # 21 componentes React (jsx + d.ts + prompt.md)
│   ├── core/               # Button, IconButton, Badge, Card, Avatar, ProgressBar, Icon
│   ├── forms/              # Input, Select, Checkbox, Switch
│   ├── data/               # StatCard, RankRow, ListRow, CurrencyBRL
│   ├── navigation/         # AppBar, BottomNav, Tabs, SegmentedControl
│   └── feedback/           # Banner, Dialog
├── ui_kits/
│   ├── consultor/          # App mobile do consultor (dark)
│   └── admin/              # Painel admin web (light)
├── guidelines/             # 17 specimen cards HTML
├── assets/                 # logo-mark, logo-mark-mono, app-icon (também em src/assets/brand/)
└── uploads/                # Materiais originais: MIV Banrisul (via CDN), briefs, contrato de tokens
```

## Regras críticas para lembrar

- `#0094FF` (`--primary`) **falha WCAG em texto normal** — só ícones/foco/títulos grandes.
- Texto e links: `#0061B0` (`--link`).
- Botões sólidos: `#0077DB` (`--primary-strong`) + label branca.
- Marca: **Poppins** só no wordmark. Display: **Exo 2**. Corpo/números: **Source Sans 3** com `tabular-nums`.
- Moeda pt-BR: `R$ 1.250,00`. Valores positivos em `--success` (#0E6E3B).
- Ícones: **Lucide** stroke 2px. Sem emoji.
- Radius padrão de card: 14px. Sombras tingidas de navy.
- Motion base: 200ms `cubic-bezier(0.2, 0, 0, 1)`.
