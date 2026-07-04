# Banritools — Achados de UX (Estado Atual)

**Guia do Projeto · Frente de Design/UI/UX**

> Auditoria visual do Banritools mobile a partir de capturas de tela reais (junho/2026).
> Serve a três propósitos: o "antes" do antes/depois para o pitch, a lista de problemas que justifica o redesign, e o mapa para a migração (Fase 5).

---

## 1. Veredito

O Banritools tem **ossatura de produto madura vestida com o estilo padrão do shadcn/ui**. É o melhor cenário possível: a evolução para o novo Design System é **troca de tokens + polimento**, não reescrita. Isso confirma a viabilidade da estratégia *strangler* da Fase 5.

---

## 2. Inventário de telas observadas

| Rota | Tela | Conteúdo-chave |
|---|---|---|
| `/admin` | Painel da Agência | KPIs (Engajamento, Média por Ativo, Top Performer, Gap do Ranking), Top 10, busca de colaborador, Performance por Colaborador, Exportar Relatórios |
| `/dashboard-v3` | Início (central de operações) | Resumo de hoje, saudação personalizada, Produção de hoje, Próxima Melhor Ação, Últimos lançamentos, atalhos Metas/Campanhas |
| `/ranking-v3` | Ranking | Sua posição, progresso vs. líder, Líder do mês |
| `/metas` | Metas | Nova meta, empty state |
| `/admin/produtos` | Produtos | 21 produtos / 97 variantes, busca, base do editor (field_schema) |
| `/registrar-producao` | Lançamento de produção | Cards por produto com Quantidade/Valor, regras de pontos (`pts/unidade` vs `pts/volume_R$`), barra fixa "Salvar lançamentos" |
| `/perfil` | Meu Perfil | Avatar, badge de papel (Admin), formulário (nome, email, telefone) |

**Observações estruturais:**
- Rotas `-v3` confirmam que a consolidação da v3 está em andamento.
- **Light e dark mode já existem** — adianta a Fase 2 (o dark mode tem base para herdar).

---

## 3. O que é bom — e deve ser preservado

- **Empty states** em toda tela, com CTA claro.
- Padrão **"Próxima Melhor Ação"** no dashboard.
- **Gamificação** (ranking, pontos, progresso vs. líder).
- **Saudação personalizada** e linguagem de "central de operações".
- **KPIs** claros e barra de salvar fixa no formulário.
- **Arquitetura de informação** legível e consistente entre telas.

O redesign mantém esses padrões. Troca a pele, não o esqueleto.

---

## 4. Problemas priorizados

### Prioridade Alta

**A1 — FAB sobrepondo conteúdo.**
O botão flutuante `+` cobre elementos em quase toda tela: campo de busca (Produtos), link "Ver ranking" (Dashboard), campo de email (Perfil) e a área de salvar. Função ambígua (qual "adicionar"?). É o defeito de usabilidade mais visível.

**A2 — Contraste insuficiente (WCAG).**
Texto azul em pílulas azul-claras ("6600 pts", "+2550 pts"), botão "Salvar lançamentos" azul-claro sobre azul, valores monetários em verde. Confirma no produto vivo o mesmo problema já mapeado do `#0094FF`. É também o argumento central do pitch: achamos e corrigimos uma falha real de acessibilidade.

### Prioridade Média

**M1 — Tokens de marca não aplicados.**
O azul atual é um cobalto/royal genérico, não o `#0094FF` nem o `#000050` do MIV. A tipografia não é Exo 2. A identidade não está alinhada à marca Banrisul.

**M2 — Afordâncias redundantes.**
"Nova meta" (botão) e o FAB executam a mesma ação.

### Prioridade Baixa (refinamento)

**B1 —** Padronizar espaçamento e hierarquia tipográfica entre telas.
**B2 —** Verificar loading states (só foram observados empty states).

---

## 5. Oportunidade de Design System

| Achado | Implicação no plano |
|---|---|
| Ossatura boa + estilo genérico | Migração = troca de tokens, não rewrite (Fase 5) |
| Dark mode já existe | Herdar e maturar (Fase 2) |
| v3 em andamento | Consolidar o DS sobre a v3 |
| Contraste reprovado | Variante de azul escuro acessível = trabalho #1 da Fase 2 |
| Cores brand-adjacent | Trocar pelos tokens exatos do MIV |

---

## 6. Notas

- **Dados sensíveis:** as capturas contêm nome e email reais. Qualquer artefato de pitch deve usar **dados fictícios** e conta seed.
- Estes achados são o **"antes"** do material de antes/depois para os gestores.

---

*Frente de Design do Guia do Projeto Banritools.*
