## 1. Logo maior no topo mobile

Em `src/components/Topbar.tsx`, o logo central mobile usa `<Logo size={28} />`. Aumentar para `size={36}` (≈ +28%), mantendo o centro absoluto e sem alterar a altura do header (h-14 = 56px comporta).

## 2. Hero "desemblocado" (saudação + próxima melhor ação)

Em `src/components/ds/HeroPerformance.tsx`:

- **Container externo**: remover borda, gradient e card visual — trocar `rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/10 p-6 sm:p-7` por algo neutro tipo `p-1 sm:p-2` (sem bg, sem border, sem shadow). Remover o glow `blur-3xl` decorativo (não faz mais sentido sem o card).
- **Saudação maior**: subir `text-2xl sm:text-3xl` para `text-3xl sm:text-4xl` e o número principal de `text-5xl sm:text-6xl` mantém (já é grande), mas com o card removido ele respira mais.
- **Próxima melhor ação**: manter como botão destacado (mantém border + bg tonal — esse é o foco visual agora). Subir levemente o padding interno e o título de `text-base` para `text-lg`. Como é o único elemento "embloca­do" da seção, ganha protagonismo automaticamente.
- **Grid**: reduzir gap entre coluna de texto e cartão de ação (`gap-6` → `gap-5`) e remover paddings duplicados.

Resultado: saudação + KPI flutuam diretamente sobre o fundo da página; o único bloco visível é o botão da próxima ação, que vira o destaque natural.

## 3. Fonte mais sóbria nos números dos KPIs

Hoje os números (ex.: "Produção de hoje", cards de Produção/Valor/Pontos/Ranking) renderizam em **Source Sans 3** (font-body padrão), que tem ar humanista/informal.

**Proposta**: adicionar um novo token `--font-numeric` em `src/styles/tokens.css` apontando para **IBM Plex Sans** (com fallback para Source Sans 3) — uma sans corporativa, geométrica e sóbria, muito usada em fintech/dashboards bancários. Carregar via `<link>` no `src/routes/__root.tsx` (Google Fonts: pesos 500/600/700).

Aplicar a fonte:
- No `AnimatedNumber` / `AnimatedText` (componente que renderiza todos os números): adicionar `font-[var(--font-numeric)]` no wrapper.
- Como consequência, todo número grande (hero, KpiCard, badges com pts) passa a usar a nova fonte automaticamente — sem precisar tocar em cada componente.

Se preferir outra direção sóbria, alternativas válidas: **JetBrains Mono** (mais técnica/monoespaçada, ar de terminal), **Roboto Mono** (neutra), **Manrope** (sans elegante proporcional). IBM Plex Sans é a recomendação default por equilíbrio entre sobriedade bancária e legibilidade em dashboards densos.

## Arquivos a alterar

- `src/components/Topbar.tsx` — `size={28}` → `size={36}`
- `src/components/ds/HeroPerformance.tsx` — remoção do card wrapper, ajuste tipográfico
- `src/styles/tokens.css` — novo token `--font-numeric`
- `src/routes/__root.tsx` — `<link>` Google Fonts do IBM Plex Sans
- `src/components/AnimatedNumber.tsx` — aplicar `font-[var(--font-numeric)]` no Digit + AnimatedText

Nenhuma mudança de lógica/dados.
