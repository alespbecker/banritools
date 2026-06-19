
## Diagnóstico rápido

Hoje convivem **dois sistemas de tokens** no projeto:

1. `src/styles.css` — tokens shadcn (`--background`, `--card`, `--primary`, `--accent`, `--border`…). **Todas** as telas, componentes shadcn e rotas v2/v3 usam estas variáveis via classes `bg-card`, `text-foreground`, `bg-primary`, etc.
2. `src/styles/tokens.css` — primitivos do novo Design System (Primary `#0094FF`, Navy `#000050`, Turquesa, Roxo, escala neutra própria, raios, sombras, motion) + semânticos próprios (`--bg`, `--surface`, `--text`, `--primary`, `--primary-strong`).

Os dois arquivos declaram `@theme inline` com `--color-primary`, `--color-border` etc. **conflitando**. Hoje o `tokens.css` é importado *antes* do bloco `@theme` do `styles.css`, então o shadcn ganha e o novo DS fica "morto" — só os primitivos (`--primary-500`, `--navy-800`) e as fontes (`Exo 2` / `Source Sans 3` aplicadas via seletor global em `body, p, h1…`) estão de fato em uso.

Aplicar o DS "de uma vez" trocando classes em todos os componentes para `bg-surface`, `text-text`, `bg-primary-strong` etc. é o caminho arriscado — são centenas de pontos.

## Estratégia: re-mapear, não reescrever

O atalho seguro é **manter os nomes shadcn** (`--background`, `--card`, `--primary`, `--accent`, `--border`, `--ring`, `--success`, `--warning`, `--destructive`…) e fazer com que apontem para a paleta nova do PDF. Assim, **zero componente precisa mudar de classe** e o look-and-feel migra inteiro.

Regra de ouro do PDF (acessibilidade): `#0094FF` (primary-500) é só acento/ícone/foco/títulos grandes. Botão sólido = `#0077DB` (600). Texto/links = `#0061B0` (700). Vou refletir isso no mapeamento:

| Token shadcn          | Dark (novo)                     | Light (novo)                  |
| --------------------- | ------------------------------- | ----------------------------- |
| `--background`        | `--gray-950` #0A0D14            | `--gray-50` #F7F8FA           |
| `--card` / `--popover`| `--gray-900` #121620            | `--gray-0` #FFFFFF            |
| `--secondary`/`--muted`| `--gray-800` #1F2530           | `--gray-100` #EDF0F5          |
| `--foreground`        | `--gray-50`                     | `--gray-900`                  |
| `--muted-foreground`  | `--gray-400`                    | `--gray-500/600`              |
| `--border` / `--input`| `--gray-700`                    | `--gray-200`                  |
| `--primary` (botão)   | `--primary-600` #0077DB         | `--primary-600` #0077DB       |
| `--accent` (foco/ícone)| `--primary-500` #0094FF        | `--primary-500` #0094FF       |
| `--ring`              | `--primary-500`                 | `--primary-500`               |
| `--destructive`       | `--error-500`                   | `--error-600`                 |
| `--success`           | `--success-500`                 | `--success-700`               |
| `--warning`           | `--warning-400`                 | `--warning-700`               |
| `--sidebar`           | `--navy-900` / `--gray-900`     | `--gray-0`                    |
| `--brand-deep`        | `--navy-800` #000050            | `--navy-800`                  |
| `--brand-teal/violet` | turquoise-500 / purple-500      | turquoise-600 / purple-600    |

Tipografia já está correta (logo Poppins, display Exo 2, corpo Source Sans 3) — não mexo.

## Como reduzir o risco a quase zero

1. **Página de preview do DS** — criar `/_authenticated/design-system` que renderiza, lado a lado, todos os primitivos shadcn em uso real: Buttons (default/secondary/destructive/outline/ghost), Badges, Inputs, Cards, Tabs, Alerts, Dialog, Toast, Skeleton, Progress, Chart de exemplo, ranking row, FAB. Serve de "olhômetro" antes/depois.
2. **Feature flag por classe** — encapsular o novo mapeamento em `.ds-v2` aplicado no `<html>`, com toggle persistido em `localStorage` (`ds:v2`). Default: **off**. Ligando, o novo mapping vence; desligando, volta ao atual instantaneamente. Permite alternar in-place na própria página de preview.
3. **Auditoria visual rápida** das telas críticas com a flag ligada: `/dashboard`, `/dashboard-v2`, `/dashboard-v3`, `/registrar-producao-v2`, `/ranking-v2`, `/metas`, `/campanhas`, `/admin/produtos`, sidebar, AppLoading, login. Marcar qualquer regressão visível.
4. **Limpeza dos conflitos** — remover/ajustar o `@theme inline` duplicado em `tokens.css` para evitar que mapeamentos não-shadcn (ex.: `--color-border` apontando para a borda nova) interfiram fora do bloco de override.
5. **Promoção** — quando a auditoria estiver verde, virar o default (`.ds-v2` aplicado por padrão no `__root.tsx`) e manter a flag por mais alguns dias para rollback fácil.
6. **Pós-migração (opcional, depois)** — só então considerar substituir classes shadcn por tokens semânticos do DS novo (`bg-surface`, `text-text-muted`) onde fizer sentido. Isso é cosmético e pode ser incremental por feature.

## Entregáveis desta fase

- `src/styles/ds-v2.css` com os blocos `.ds-v2:root, .ds-v2.dark { … }` e `.ds-v2.light { … }` redefinindo os tokens shadcn conforme a tabela acima.
- Import desse arquivo no fim de `src/styles.css` (depois do bloco `@theme inline`, para garantir precedência via classe `.ds-v2`).
- Ajuste no `@theme inline` de `tokens.css` removendo mapeamentos que colidem com shadcn (`--color-primary`, `--color-border`) — manter só os exclusivos do DS novo (`--color-bg`, `--color-surface`, `--color-text`, `--color-brand-deep`, fontes, raios).
- Novo arquivo `src/routes/_authenticated/design-system.tsx` (preview + toggle da flag) e link discreto no rodapé da sidebar **só para admins**.
- Hook minúsculo `useDsV2()` que aplica/remove a classe em `document.documentElement` e persiste em `localStorage`.

## Como você valida

1. Abre `/design-system`, alterna o toggle "DS v2" → vê tudo recolorir em tempo real, dark e light.
2. Navega pelas rotas críticas com a flag ligada e me reporta qualquer regressão pontual.
3. Quando aprovar, peço pra eu "tornar DS v2 o padrão" — viro um booleano no `__root.tsx` e pronto. Rollback = remover a classe.

Sem migração big-bang, sem mexer em componentes, sem risco de derrubar tela.

## Detalhes técnicos

- Precedência CSS: a classe `.ds-v2` no `<html>` torna os seletores `.ds-v2:root.dark { … }` / `.ds-v2.light { … }` mais específicos que `:root, .dark` / `.light` atuais — sem `!important`.
- `--color-border` no `@theme inline` do `styles.css` continua apontando para `var(--border)`; a regra `* { border-color: var(--color-border) }` segue funcionando.
- A fonte do logo continua inline (`Poppins`) nos componentes `AppLoading` e `DashboardSidebar` — fora do escopo do DS.
- Não toco em `src/integrations/supabase/*`, rotas existentes, nem em lógica de negócio.
