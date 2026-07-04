# UI Kit — App do Consultor (mobile)

Recreação interativa do app mobile do consultor Banritools, em **dark mode**
(o app real é escuro). Mostra o fluxo real: login → dashboard → registrar
produção → ranking → metas → perfil.

## Arquivos
- `index.html` — moldura de telefone (390×760); monta o app inline (`text/babel`). Tag `@dsCard`.
- `index.standalone.html` — fonte para o export self-contained (com thumbnail + meta de assets).
- As telas e o shell vivem inline em `index.html` (login, AppBar, BottomNav, FAB, save bar, toast).

## Telas
- **Login** — matrícula + senha, biometria, CTA primário.
- **Início** — hero de marca (navy + acento azul→turquesa), "Resumo de hoje",
  "Próxima melhor ação" (verde), KPIs, últimos lançamentos.
- **Registrar Produção** — seções por categoria (Seguros, Crédito), cards de
  produto com quantidade/valor, save bar fixa "Salvar lançamento".
- **Ranking** — "Sua posição" (1º), evolução vs. líder, classificação.
- **Metas** — progresso por categoria com banner de contexto.
- **Perfil** — identidade, preferências, sair.

## Componentes consumidos
`AppBar`, `BottomNav`, `IconButton`, `Avatar`, `Card`, `Badge`, `Button`,
`StatCard`, `RankRow`, `ListRow`, `ProgressBar`, `CurrencyBRL`, `Input`,
`Select`, `Banner`, `Checkbox`, `Icon` — todos do `_ds_bundle.js`.

## Interação
Clique **Entrar** para abrir o app. Navegue pela barra inferior. Na tela
Registrar, **Salvar lançamento** dispara um toast. O **FAB +** (Início/Ranking)
leva a Registrar.
