# Banritools — Contrato de Tokens (Fundação)

**Guia do Projeto · Frente de Design · v0.1**

> Fonte única de verdade do Design System: cores, tipografia e primitivos base.
> Formato aberto e agnóstico (CSS custom properties + JSON), pronto para Tailwind v4 e independente de qualquer ferramenta de IA.
> **Cores de marca extraídas do MIV Banrisul; variantes acessíveis derivadas e verificadas em WCAG 2.1.**

---

## Como usar este documento no Claude Design

Suba este arquivo (ou o `tokens.css`) como ativo ao configurar o Design System. Ele define a paleta, a tipografia e as regras de uso. Os exemplos gerados no canvas devem **consumir os tokens semânticos** (ex.: `--text`, `--primary`), nunca os hex crus.

---

## 1. Princípio que rege a paleta

As 4 cores de marca do MIV são preservadas exatamente. Mas a primária `#0094FF` **reprova no contraste WCAG para texto normal** (3,14:1 sobre branco; o mínimo é 4,5:1). A solução não é abandonar a cor — é **estender**: usar `#0094FF` onde 3:1 basta (acentos, ícones, títulos grandes, foco, data-viz) e usar variantes mais escuras para texto e botões. Isso preserva o reconhecimento da marca **e** garante acessibilidade.

---

## 2. Primitivos de marca (escalas)

**Primary — Azul Banrisul** (âncora: `500 = #0094FF`)

| Step | Hex | Uso típico |
|---|---|---|
| 50 | `#E8F4FF` | fundos sutis, tints |
| 100 | `#CFE8FF` | hover de superfícies claras |
| 200 | `#9CD2FF` | bordas suaves |
| 300 | `#5CB7FF` | acento em dark mode |
| 400 | `#1F9FFF` | primária em dark mode |
| **500** | **`#0094FF`** | **cor de marca — acentos, ícones, foco, títulos grandes** |
| 600 | `#0077DB` | botão sólido (rótulo branco), links |
| 700 | `#0061B0` | texto interativo, alto contraste |
| 800 | `#00477D` | texto enfático |
| 900 | `#002E52` | — |
| 950 | `#001A30` | — |

**Navy — Azul Escuro de marca** (`800 = #000050`)

| Step | Hex | Uso |
|---|---|---|
| 600 | `#1A1A6E` | superfície dark elevada |
| 700 | `#0D0D5C` | superfície dark |
| **800** | **`#000050`** | **marca — cabeçalhos, heros, botões escuros** |
| 900 | `#00003A` | fundo dark profundo |

**Turquoise** (`#1CD8CA`) e **Purple** (`#936FFA`) — acento e data-viz.

| | 400 | 500 (marca) | 600 | 700 (texto) | 800 |
|---|---|---|---|---|---|
| Turquoise | `#52E3D8` | `#1CD8CA` | `#12A99E` | `#0C857C` | `#085E58` |
| Purple | `#AD93FB` | `#936FFA` | `#7544EE` | `#5B30C4` | `#421F94` |

**Neutros (Gray)** — frios, levemente puxados ao navy.

`0 #FFFFFF` · `50 #F7F8FA` · `100 #EDF0F5` · `200 #DEE3EC` · `300 #C5CCDA` · `400 #98A2B5` · `500 #697387` · `600 #4B5566` · `700 #353D4B` · `800 #1F2530` · `900 #121620` · `950 #0A0D14`

**Semânticas de status**

| | 500 | 600 | 700 (texto) |
|---|---|---|---|
| Success | `#1FB866` | `#138A4A` | `#0E6E3B` |
| Warning | `#E89510` | — | `#8A5808` |
| Error | `#F0463C` | `#D32A20` | `#A81F17` |

---

## 3. Tabela de contraste WCAG (verificada)

Valores calculados por fórmula WCAG 2.1. AA normal = 4,5:1 · AA grande/UI = 3:1.

| Par | Razão | Texto normal | Texto grande | UI |
|---|---|---|---|---|
| `#0094FF` (500) sobre branco | **3,14:1** | ❌ falha | ✅ AA | ✅ |
| `#0077DB` (600) sobre branco | **4,50:1** | ✅ AA | ✅ | ✅ |
| `#0061B0` (700) sobre branco | **6,29:1** | ✅ AA | ✅ | ✅ |
| branco sobre `#0094FF` (botão) | **3,14:1** | ❌ falha | ✅ AA | ✅ |
| branco sobre `#0077DB` (botão) | **4,50:1** | ✅ AA | ✅ | ✅ |
| branco sobre `#000050` (navy) | **18,82:1** | ✅ AAA | ✅ | ✅ |
| turquoise `#1CD8CA` sobre branco | **1,79:1** | ❌ falha | ❌ falha | ❌ (só acento) |
| turquoise `#0C857C` (700) sobre branco | **4,50:1** | ✅ AA | ✅ | ✅ |
| purple `#936FFA` sobre branco | **3,56:1** | ❌ falha | ✅ AA | ✅ |
| purple `#5B30C4` (700) sobre branco | **7,88:1** | ✅ AAA | ✅ | ✅ |
| success `#0E6E3B` (700) sobre branco | **6,34:1** | ✅ AA | ✅ | ✅ |
| warning `#8A5808` (700) sobre branco | **6,03:1** | ✅ AA | ✅ | ✅ |
| error `#D32A20` (600) sobre branco | **5,09:1** | ✅ AA | ✅ | ✅ |
| gray-900 `#121620` sobre branco | **18,08:1** | ✅ AAA | ✅ | ✅ |
| gray-600 `#4B5566` sobre branco | **7,53:1** | ✅ AAA | ✅ | ✅ |
| gray-50 sobre gray-900 (dark) | **17,02:1** | ✅ AAA | ✅ | ✅ |
| gray-300 sobre gray-900 (dark) | **11,21:1** | ✅ AAA | ✅ | ✅ |

> **Correções diretas no Banritools atual:** o valor monetário em verde (achado A2) passa a usar `success-700`; as pílulas de pontos e o botão "Salvar lançamentos" passam a usar `primary-600/700` ou navy. `gray-400` só é permitido em estado **desabilitado** (isento de contraste).

---

## 4. Tokens semânticos

**Tema claro**

| Token | Valor | Papel |
|---|---|---|
| `--bg` | gray-50 | fundo da aplicação |
| `--surface` | white | cards |
| `--surface-2` | gray-100 | superfície secundária |
| `--border` | gray-200 | bordas |
| `--text` | gray-900 | texto principal |
| `--text-muted` | gray-600 | texto secundário |
| `--text-disabled` | gray-400 | desabilitado |
| `--primary` | primary-500 | acento de marca, foco, ícones |
| `--primary-strong` | primary-600 | botão sólido, texto interativo |
| `--on-primary` | white | rótulo sobre primary-strong |
| `--link` | primary-700 | links em texto |
| `--success` | success-700 · `--warning` | warning-700 · `--error` | error-600 |
| `--focus-ring` | primary-500 | anel de foco |

**Tema escuro** (já existe no Banritools — herdar e maturar)

| Token | Valor |
|---|---|
| `--bg` | gray-950 |
| `--surface` | gray-900 |
| `--surface-2` | gray-800 |
| `--border` | gray-700 |
| `--text` | gray-50 |
| `--text-muted` | gray-300 |
| `--primary` | primary-400 |
| `--primary-strong` | primary-500 |
| `--link` | primary-300 |
| hero/cabeçalho de marca | navy-800 `#000050` |

---

## 5. Tipografia

**Famílias** (ambas open source / OFL — zero trava de licença):
- **Display / títulos:** Exo 2
- **Texto / corpo:** Source Sans 3
- **Números / moeda:** Source Sans 3 com `font-variant-numeric: tabular-nums` (alinha valores em R$)

**Escala** (base 16px):

| Token | Tamanho | Line-height | Família | Peso |
|---|---|---|---|---|
| `display` | 3rem / 48px | 1.1 | Exo 2 | 700 |
| `h1` | 2.25rem / 36px | 1.2 | Exo 2 | 700 |
| `h2` | 1.875rem / 30px | 1.25 | Exo 2 | 600 |
| `h3` | 1.5rem / 24px | 1.33 | Exo 2 | 600 |
| `xl` | 1.25rem / 20px | 1.4 | Source Sans 3 | 600 |
| `lg` | 1.125rem / 18px | 1.55 | Source Sans 3 | 500 |
| `base` | 1rem / 16px | 1.6 | Source Sans 3 | 400 |
| `sm` | 0.875rem / 14px | 1.5 | Source Sans 3 | 400 |
| `xs` | 0.75rem / 12px | 1.5 | Source Sans 3 | 500 |

**Tracking:** `--tracking-display: 0.01em` (leve, para ecoar o espaçamento aumentado do logotipo — calibrar no olho contra o logo). Corpo: `0`.

---

## 6. Demais primitivos

**Espaçamento** (base 4px, ritmo 8pt): `1=4 · 2=8 · 3=12 · 4=16 · 5=20 · 6=24 · 8=32 · 10=40 · 12=48 · 16=64`

**Raio:** `sm 6px · md 10px · lg 14px · xl 20px · 2xl 28px · full 9999px`

**Elevação:** `sm` (0 1px 2px rgba(0,0,80,.06)) · `md` (0 4px 12px rgba(0,0,80,.08)) · `lg` (0 12px 32px rgba(0,0,80,.12))

**Motion:** durações `fast 120ms · base 200ms · slow 320ms` · easing `cubic-bezier(0.2, 0, 0, 1)`

**Breakpoints:** `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`

---

## 7. Versionamento

`v0.1` — fundação inicial. Cores e tipografia travadas e verificadas. Próximo: estados de componente e validação no canvas (Fase 2 → 3).

*Contrato de Tokens · Guia do Projeto Banritools.*
