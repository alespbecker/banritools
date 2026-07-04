---
name: banritools-design
description: Use this skill to generate well-branded interfaces and assets for Banritools (plataforma interna de produtividade comercial do Banrisul), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
---

# Banritools Design System

Read `references/brand.md` first — brand context, content fundamentals, visual
foundations, iconography, file index. The full canonical bundle (tokens, CSS,
components, ui_kits, guidelines, assets, MIV Banrisul PDF) lives in the
project at **`design-system/`** — treat it as read-only reference.

## What's in this skill
- `references/brand.md` — brief completo pt-BR (marca, tom, foundations).
- `references/contrato-de-tokens.md` — fonte de verdade dos tokens.
- `references/inventario-componentes.md` — inventário priorizado.
- `references/achados-ux.md` — auditoria de UX do app atual.
- `references/plano-mestre.md`, `references/brief-inicial.md` — plano e brief.
- `references/tokens.json` — export canônico dos tokens.

## What's in the project bundle (`design-system/`)
- `styles.css` — entry único (importa fonts → palette → colors → typography → spacing → base → components).
- `tokens/` — cores (palette + semantic + dark), tipografia, spacing, fonts.
- `components/` — 21 React primitives em `core/`, `forms/`, `data/`, `navigation/`, `feedback/` (cada um com `.jsx` + `.d.ts` + `.prompt.md`).
- `ui_kits/consultor/` — app mobile do consultor (dark).
- `ui_kits/admin/` — painel admin web (light).
- `guidelines/` — 17 specimen cards HTML.
- `assets/` — `logo-mark.svg`, `logo-mark-mono.svg`, `app-icon.svg` (três porcas hexagonais). Também disponíveis em `src/assets/brand/`.

## Critical rules (do not break)
- **Accessibility:** `#0094FF` (`--primary`) é para acentos, ícones, focus ring
  e títulos grandes APENAS — falha WCAG em texto normal. Body/links usam
  `--link` (#0061B0); botões sólidos usam `--primary-strong` (#0077DB) + label
  branca; valores positivos em R$ usam `--success` (#0E6E3B).
- **Sempre tokens semânticos, nunca hex cru** em componentes.
- **Light + dark** ambos suportados (`:root` / `.dark`).
- **Números e moeda** usam `tabular-nums`; dinheiro em pt-BR (`R$ 1.250,00`).
- **Type:** Exo 2 (títulos), Source Sans 3 (corpo/números), Poppins (só wordmark). **Icons:** Lucide, 2px stroke. **No emoji.**
- **Voice:** pt-BR, fala com "você", direto e encorajador; rótulos de seção em
  CAIXA ALTA discreta; títulos em Sentence case.

## How to use
- **Produção (código no app):** leia os `.prompt.md` de cada componente em
  `design-system/components/**/` e os tokens em `design-system/tokens/**/`.
  Copie tokens para `src/styles.css` e implemente componentes usando a base
  shadcn existente + os tokens semânticos do Banritools.
- **Artefatos visuais (mocks, slides):** linke `design-system/styles.css` em
  HTML estático e use os componentes prontos.

Se invocado sem orientação, pergunte o que o usuário quer construir, faça
algumas perguntas focadas, e atue como designer expert da marca — HTML
artifact ou código de produção conforme necessário.
