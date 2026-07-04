# Banritools — Design System Banrisul

**Guia do Projeto · Página 01 — Plano Mestre**

> Documento-base do eixo de Design, Identidade Visual, UI e UX.
> Objetivo: criar um Design System maduro, omnichannel e documentado em formato de hub/wiki, a partir do MIV público do Banrisul, para uso no Banritools e como proposta para a equipe de Design e Tecnologia do banco.

---

## 1. Decisões travadas

| Decisão | Definição |
|---|---|
| Forma de entrega | Tokens + código + biblioteca visual + documentação (para dev **e** design) |
| Escopo | Omnichannel completo (web, app, e base de marca para impresso) |
| Ativos | MIV em PDF (em mãos) + prints de web e app (a capturar) |
| Posicionamento | Proposta a ser oferecida ao banco; a marca permanece IP do Banrisul |

---

## 2. Lógica central: MIV → Design System digital

O MIV é um manual de marca com foco institucional/impresso. Ele fornece os **primitivos de marca** (logo, paleta, tipografia, regras de aplicação). Um Design System digital exige o que o MIV não tem: estados de interação, variantes de cor ajustadas a contraste, comportamento responsivo, dark mode e padrões de componentes.

A primeira metade do projeto é, portanto, **traduzir e estender**: extrair tokens do PDF e dos prints, e ampliar com camadas digitais nativas.

---

## 3. Arquitetura do pipeline (três peças)

O Claude Design extrai e aplica a marca automaticamente, mas o "design system" interno dele é um **UI kit da ferramenta** — não, sozinho, o pacote completo de tokens em código + wiki versionada. Por isso, três peças em sequência:

1. **Claude Design** (`claude.ai/design`) — extrai a marca do MIV/prints, monta a biblioteca visual, prototipa telas e constrói o microsite do hub. *Research preview; só navegador; exige plano Pro/Max/Team/Enterprise.*
2. **Claude Code** (handoff) — converte o resultado em tokens reais (JSON/CSS), biblioteca de componentes em código e integração no Banritools.
3. **Hub/Wiki** — microsite interativo de documentação, construído no Claude Design e "produzido" via Claude Code.

---

## 4. Plano em 6 fases

### Fase 0 — Pré-requisitos e coleta
- Confirmar plano Pro+ com Claude Design habilitado.
- Organizar os ativos do MIV.
- Capturar os prints com método (ver checklist na seção 5).

### Fase 1 — Setup + extração no Claude Design
- Abrir `claude.ai/design`, fazer onboarding, escolher papel **Design**.
- Nome da organização (canto inferior esquerdo) → configurações → design systems → onboarding.
- Upload do **MIV (PDF) + todos os prints**.
- O Claude extrai paleta, tipografia, padrões de layout (espaçamento, grid) e componentes.
- Dica de ouro: incluir **exemplos reais finalizados**, não só especificações.

### Fase 2 — Maturação dos tokens *(o salto de qualidade)*
- Cores **semânticas**: sucesso / erro / aviso / info, superfícies, texto.
- **Estados de interação**: hover, foco, pressionado, disabled.
- **Contraste WCAG AA** (inegociável para banco — e forte argumento de venda).
- **Dark mode** e escala tipográfica responsiva.
- Validar com um projeto-teste para conferir aderência à marca.

### Fase 3 — Componentes (visual + código)
- Ordem atômica: átomos → moléculas → organismos.
- Componentes específicos de banco: cartão de conta, lista de transações, exibição de valores, blocos PIX, padrões de autenticação.
- Refino incremental e específico ("espaçamento entre campos = 8px").
- Handoff para o **Claude Code** gerar a biblioteca em código.

### Fase 4 — Hub/Wiki documentado
Estrutura do microsite:
- Introdução → Princípios → Fundamentos → Componentes (exemplo vivo + código + do/don't + nota de acessibilidade) → Padrões → Recursos/Downloads → Changelog.
- Este é o principal **artefato de convencimento** para o banco.

### Fase 5 — Migração do Banritools *(depende do stack atual)*
- Estratégia *strangler*: auditar UI atual → mapear para os novos tokens → camada de tema/adapter → substituir componentes incrementalmente (não big-bang).
- Linkar o repositório do Banritools para o Claude entender componentes e padrões existentes.

### Fase 6 — Governança
- Versionamento semver, changelog, convenção de nomes, guia de contribuição.
- Atualizações do DS feitas dentro do Claude Design; publicar (toggle "Published") só quando aprovado.

---

## 5. Checklist de captura de prints

**Web:** home · login · dashboard/conta · extrato · transferência/PIX · formulários · tabelas · modais · menus/navegação · footer · estados de erro e vazio.

**App:** onboarding · login/biometria · home/saldo · extrato · PIX · cartões · notificações · configurações · estados de carregando/erro/vazio.

**Como capturar:** alta resolução; light e dark (se houver); anotar cores/fontes identificáveis.

---

## 6. Pendências

- [ ] **Stack do Banritools** (framework, abordagem de CSS, componentes próprios) — necessário para detalhar a Fase 5.
- [ ] Definir camada de automação com agentes (ver Página 02 do guia).
- [ ] Capturar os prints de web e app.

---

*Página 01 do Guia do Projeto Banritools.*
