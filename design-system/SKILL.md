---
name: banritools-design
description: Use this skill to generate well-branded interfaces and assets for Banritools (plataforma interna de produtividade comercial do Banrisul), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

# Banritools Design System

Read `readme.md` first — it holds the brand context, content fundamentals,
visual foundations, iconography and the file index. Then explore the rest.

## What's here
- `styles.css` — single entry point. Link this; it `@import`s all tokens,
  fonts, base layer and component styles.
- `tokens/` — color (palette + semantic + dark), type, spacing/radius/motion, fonts.
- `components/` — React primitives (`core/`, `forms/`, `data/`, `navigation/`,
  `feedback/`), each with `.jsx` + `.d.ts` + `.prompt.md`.
- `ui_kits/consultor/` — mobile consultant app (dark). `ui_kits/admin/` — web admin panel (light).
- `guidelines/` — foundation specimen cards.
- `assets/` — logo (three hexagons), app icon.

## Critical rules (do not break)
- **Accessibility:** `#0094FF` (`--primary`) is for accents, icons, focus and
  large titles ONLY — it fails WCAG on normal text. Body text & links use
  `--link` (#0061B0); solid buttons use `--primary-strong` (#0077DB) + white
  label; positive R$ values use `--success` (#0E6E3B).
- **Always semantic tokens, never raw hex** in components.
- **Light + dark** both supported (`:root` / `.dark`).
- **Numbers & currency** use `tabular-nums`; money in pt-BR (`R$ 1.250,00`).
- **Type:** Exo 2 (titles), Source Sans 3 (body/numbers). **Icons:** Lucide,
  2px stroke. **No emoji.**
- **Voice:** pt-BR, fala com "você", direto e encorajador; rótulos de seção em
  CAIXA ALTA discreta; títulos em Sentence case.

## How to use
- **Visual artifacts** (slides, mocks, throwaway prototypes): copy the assets
  you need out of `assets/`, link `styles.css`, and write static HTML. Mount
  React components from `_ds_bundle.js` via
  `const { Button } = window.BanritoolsDesignSystem_38adfd` (in this project;
  in a download the namespace is printed by the bundle — read `_ds_manifest.json`).
- **Production code:** read the `.prompt.md` files and tokens to design as a
  brand expert; copy assets and token CSS into your codebase.

If invoked with no guidance, ask what the user wants to build, ask a few
focused questions, and act as an expert designer — output HTML artifacts or
production code as the need dictates.
