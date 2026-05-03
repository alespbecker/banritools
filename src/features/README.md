# features/

Cada subpasta agrupa um módulo de domínio: componentes, hooks, server functions
e tipos específicos do módulo ficam aqui. Estrutura sugerida por módulo:

```
features/<modulo>/
  components/
  hooks/
  server/        # createServerFn handlers
  types.ts
  index.ts       # re-exports públicos
```

**Regra**: novos módulos nascem aqui. Código existente em `src/components/`,
`src/hooks/` e `src/routes/` migra de forma incremental nas próximas etapas —
sem refatoração destrutiva nesta fase.

Módulos:

- `auth/` — autenticação e sessão
- `dashboard/` — painel pessoal
- `production/` — registro e histórico de produção (futuro: products + production_entries)
- `contacts/` — CRM leve
- `campaigns/` — campanhas e metas (futuro: goals)
- `ranking/` — gamificação e ranking
- `admin/` — painel administrativo da agência
- `tools/` — ferramentas operacionais
