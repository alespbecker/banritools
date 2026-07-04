## O que vieram nos zips

**Os dois zips carregam o mesmo Design System.** DS2 (`-handoff.zip`) é a versão canônica limpa, com README + `uploads/` (briefs, MIV oficial, screenshots, contrato de tokens). DS1 tem uma cópia flat + uma cópia aninhada duplicada em `design_handoff_banritools_ds/` e um subprojeto `ui_kits/consultor/`. Trato **DS2 como fonte de verdade** e uso do DS1 só o `ui_kits/consultor/` (mobile), que o DS2 não traz.

Conteúdo consolidado:
- `SKILL.md` (agent skill formal), `readme.md` (brief completo pt-BR)
- `styles.css` (entry único) → importa `tokens/{fonts,palette,colors,typography,spacing}.css` + `base.css` + `components/components.css`
- 21 componentes React em `components/{core,forms,data,navigation,feedback}` — cada um com `.jsx`, `.d.ts` e `.prompt.md`
- 2 UI kits (`ui_kits/consultor` mobile dark, `ui_kits/admin` web light)
- Assets: `logo-mark.svg`, `logo-mark-mono.svg`, `app-icon.svg` (as **três porcas hexagonais**)
- 17 cards de guidelines (cores, tipografia, spacing, brand, motion, elevation)
- `uploads/`: MIV Banrisul PDF, contrato de tokens, inventário de componentes, achados de UX, brief mestre, `tokens.json`

Regras críticas identificadas (importantes para a migração futura):
- `#0094FF` (`--primary`) **falha WCAG em texto normal** — só ícones/foco/títulos grandes. Texto/links usam `--link` (#0061B0), botões sólidos `--primary-strong` (#0077DB).
- Marca: **Poppins** só no wordmark. Display: **Exo 2**. Corpo/números: **Source Sans 3** com `tabular-nums`.
- Ícones: **Lucide** stroke 2px. Sem emoji.
- Sombras tingidas de navy, radius padrão 14px, motion 200ms `cubic-bezier(0.2,0,0,1)`.

---

## O que vou fazer nesta rodada (organizar, não editar visualmente)

### 1. Instalar a skill oficial no Lovable
- Copio `SKILL.md` + `readme.md` (renomeado como `references/brand.md`) para `.agents/skills/banritools-design/`.
- Adiciono `references/` com os docs de `uploads/` que valem para consulta (contrato de tokens, achados de UX, inventário, tokens.json).
- Rodo `skills--apply_draft .agents/skills/banritools-design` — a skill fica ativa e é retrievada sempre que o usuário pedir algo visual do Banritools.

### 2. Guardar o bundle completo como referência viva (não entra em runtime)
- Extraio DS2 inteiro em `design-system/` na raiz do projeto (fora de `src/`, não é compilado).
- Estrutura:
  ```
  design-system/
    readme.md            (brief completo)
    styles.css           (entry de referência)
    tokens/              (fontes de verdade dos tokens)
    components/          (React primitives + .prompt.md por componente)
    guidelines/          (17 cards HTML)
    ui_kits/consultor/   (mobile mockups)
    assets/              (logo SVGs oficiais)
    uploads/             (MIV, contrato, briefs — inclusive PDF)
  ```
- Adiciono `design-system/README.md` explicando: "isto é referência canônica; NÃO importe nada daqui em `src/*`. Migrações graduais copiam tokens para `src/styles.css`."
- `design-system/**` no `.gitignore`? **Não** — quero versionado, é a fonte de verdade viva.
- **Arquivo grande:** o `MIV_Banrisul.pdf` (2.5MB) sobe via `lovable-assets` e vira `.asset.json` para não inflar o repo.

### 3. Consolidar as fontes oficiais dos logos
- Copio `logo-mark.svg`, `logo-mark-mono.svg`, `app-icon.svg` para `src/assets/brand/`.
- **Não** troco o `src/components/Logo.tsx` agora — apenas deixo os SVGs disponíveis para quando começarmos a fase visual.
- `public/favicon.svg` fica intacto até você decidir trocar.

### 4. Nada de mudança visual ainda
- **Não** toco em `src/styles.css`, `src/styles/tokens.css`, `src/styles/ds-v2.css`, componentes shadcn, ou Landing.
- Não atualizo Tailwind theme.
- Motivo: sua instrução foi "garanta que estará organizado **para quando começarmos** as edições visuais". Migração de tokens é decisão de outra rodada — quero seu OK antes de tocar em cor/tipografia globais.

---

## Avaliação geral do projeto

### Onde está bem
- **Arquitetura sólida:** TanStack Start + file-based routes, `_authenticated/` layout, Supabase com RLS + `has_role` + `get_user_agency_id`, RPC `get_agency_ranking` centralizada.
- **Domínio maduro:** produtos, entries, metas, campanhas, ranking v3, convites, primeiro acesso — tudo modelado.
- **Auth robusto:** roles em tabela separada, security definer, novo fluxo `invite_requests` com triagem.
- **UI atual funcional** e em pt-BR, com dark/light mode já ligado.

### Gaps que o Design System vai resolver
- **Visual inconsistente:** hoje há `ds/` (v1) + `ds-v2/` convivendo — sem uma paleta canônica. O DS traz o contrato definitivo.
- **Cor primária hoje** (`#3B82F6` no memory) **≠** primária Banrisul (`#0094FF`). Vai mudar.
- **Fonte:** hoje Inter/Poppins misturado — o DS diz Exo 2 (títulos) + Source Sans 3 (corpo) + Poppins só no wordmark.
- **Acessibilidade:** o DS impõe regras WCAG que hoje provavelmente não estão sendo respeitadas (uso de azul primário em texto pequeno).
- **Componentes:** shadcn atual é ótima base, mas as classes `.bt-*` do DS têm decisões específicas (radius 14px, sombras navy) que valem herdar.

### Próximas melhores ações (ordem sugerida)

1. **Rodar esta rodada de organização** (instalar skill + bundle como referência). Sem risco visual.
2. **Migração de tokens (fase 1 — foundation):** copiar `tokens/palette.css` + `tokens/colors.css` + `tokens/spacing.css` para `src/styles.css` usando `@theme inline`, com bridge para os tokens shadcn existentes (`--background`, `--foreground`, etc.). Isso muda a paleta globalmente — pede aprovação visual sua antes de rodar.
3. **Migração de tipografia (fase 2):** substituir Inter por Exo 2 + Source Sans 3 via `@fontsource-variable/*` packages. Poppins fica só no wordmark do Logo.
4. **Auditoria de acessibilidade:** varrer usos de `text-primary` em texto pequeno e trocar por `text-link` (novo token). Provavelmente pega Landing, dashboards, badges.
5. **Componentes-âncora primeiro:** aplicar DS em Button, Card, Badge, Input, Select — o resto herda. Nada de refactor big-bang.
6. **Landing + Login + Primeiro Acesso** ganham o novo visual (essas são as telas públicas — impacto de marca maior).
7. **Painel do consultor (mobile-first)** usando `ui_kits/consultor/` como referência pixel-a-pixel.
8. **Painel admin** com `ui_kits/admin/` como referência.

### Riscos que vou pedir sua confirmação antes de tocar
- Trocar paleta primária (visual do app inteiro muda).
- Trocar fonte global.
- Refatorar `src/components/ds/*` (afeta v1) ou `src/components/ds-v2/*`.
- Substituir logo em massa (5 pontos de uso).

---

## Arquivos que serão criados/alterados nesta rodada

**Criados:**
- `.agents/skills/banritools-design/SKILL.md`
- `.agents/skills/banritools-design/references/brand.md`
- `.agents/skills/banritools-design/references/contrato-de-tokens.md`
- `.agents/skills/banritools-design/references/achados-ux.md`
- `.agents/skills/banritools-design/references/inventario-componentes.md`
- `.agents/skills/banritools-design/references/tokens.json`
- `design-system/**` (bundle inteiro DS2 + `ui_kits/consultor` de DS1)
- `design-system/README.md` (explica "referência viva, não importar")
- `design-system/uploads/MIV_Banrisul.pdf.asset.json` (via lovable-assets, PDF externalizado)
- `src/assets/brand/logo-mark.svg`
- `src/assets/brand/logo-mark-mono.svg`
- `src/assets/brand/app-icon.svg`

**Alterados:** nenhum arquivo `src/*` de runtime, nenhum estilo, nenhum componente.

**Comando final:** `skills--apply_draft .agents/skills/banritools-design` para ativar a skill.
