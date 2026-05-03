# Design System v1.5 — Componentes base

Blocos reutilizáveis para as próximas telas v3. **Não dependem de telas antigas**
e usam apenas tokens semânticos definidos em `src/styles.css`.

Importação canônica:
```ts
import {
  PageContainer, PageHeader, DashboardGrid,
  KpiCard, ActionCard, InfoCard, AlertCard,
  ProgressWithLabel,
} from "@/components/ds";
```

- **PageContainer / PageHeader / DashboardGrid** — layout padrão de páginas v3.
- **KpiCard** — número grande para métricas (com tendência e ícone).
- **ActionCard** — call-to-action com ícone + descrição + botão/`onClick`.
- **InfoCard** — card genérico para conteúdo (header opcional + corpo).
- **AlertCard** — status (info / success / warning / danger).
- **ProgressWithLabel** — barra de progresso com rótulo e %.

Variantes adicionais já disponíveis em `@/components/ui`:

- `Badge`: `success`, `warning`, `danger`, `neutral`, `info`.
- `Progress`: props `size` (`sm|md|lg`) e `tone` (`primary|success|warning|danger|muted`).
- `Button`: variantes `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`.
