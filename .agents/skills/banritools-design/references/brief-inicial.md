# Banritools — Brief de Início no Claude Design

**Guia do Projeto · Frente de Design · v0.1**

> Documento autossuficiente para arrancar no Claude Design. Os blocos em código são **prontos para colar**. Os valores essenciais estão embutidos aqui — então os prompts funcionam mesmo que o upload dos arquivos falhe.

---

## Como usar (3 minutos)

1. Abra **claude.ai/design** (navegador desktop).
2. Suba como ativos: **MIV (PDF)**, **`contrato-de-tokens-banritools.md`**, **`tokens.css`**.
3. Ao configurar o Design System, cole o **Bloco 1**.
4. Crie um projeto de teste e cole o **Bloco 2** para gerar a tela do Ranking.
5. Refine com os **snippets** da seção 5. Confira os **critérios de aceite** da seção 7.

> Regra de ouro: nesta primeira rodada, **só o Ranking**. Tração vem de uma tela impecável, não de dez mais ou menos.

---

## 1. Contexto do projeto (para sua referência)

Banritools é uma plataforma interna de produtividade comercial para o contexto bancário (Banrisul): produção, ranking, metas, contatos e campanhas. O objetivo é transformar caos operacional (WhatsApp, planilhas) em um sistema simples, rápido, bonito e seguro. Alvo estético: **SaaS interno moderno, limpo, mobile-first**, com **light e dark mode**. A entrega é **agnóstica de ferramenta** — o Claude Design é andaime, não fundação.

---

## 2. BLOCO 1 — Setup do Design System

```
Esta é a identidade visual do Banrisul (banco brasileiro do Rio Grande do Sul).
Vou construir um Design System interno moderno a partir dela.

A VERDADE VISUAL vem de dois lugares, nesta ordem de autoridade:
1. O MIV (manual de marca): logo de três hexágonos, identidade, tom.
2. O contrato de tokens: paleta exata, tipografia e regras de acessibilidade.

PALETA DE MARCA (exata, do MIV):
- Azul primário #0094FF  (cor de reconhecimento)
- Azul escuro  #000050  (corporativo, heros, botões escuros)
- Turquesa     #1CD8CA  (acento, data-viz)
- Roxo         #936FFA  (acento, data-viz)

REGRA DE ACESSIBILIDADE (crítica, não negociável):
#0094FF reprova no contraste WCAG para texto normal (3,14:1). Então:
- #0094FF é só para ACENTOS, ÍCONES, ANEL DE FOCO e TÍTULOS GRANDES.
- TEXTO e LINKS usam #0061B0 (azul 700).
- BOTÃO SÓLIDO usa fundo #0077DB (azul 600) com rótulo branco.
- Em fundo escuro, o acento clareia para #1F9FFF / #5CB7FF.
- Valores positivos em R$ usam verde #0E6E3B (não verde claro).
Sempre prefira tokens semânticos (texto, superfície, primário) — nunca hex crus.

TIPOGRAFIA (ambas open source):
- Títulos: Exo 2 (peso 600/700).
- Corpo: Source Sans 3 (peso 400/500/600).
- Números e valores monetários: tabular-nums (alinhamento de R$).

SEMÂNTICA — tema claro:
fundo #F7F8FA · superfície #FFFFFF · borda #DEE3EC ·
texto #121620 · texto suave #4B5566 · primário(acento) #0094FF ·
primário forte(botão/link) #0077DB · link #0061B0 · marca profunda #000050.

SEMÂNTICA — tema escuro:
fundo #0A0D14 · superfície #121620 · borda #353D4B ·
texto #F7F8FA · texto suave #C5CCDA · acento #1F9FFF · link #5CB7FF ·
heros de marca #000050.

PRIMITIVOS:
raio: sm 6 / md 10 / lg 14 / xl 20.
espaçamento: ritmo de 8px (4, 8, 12, 16, 24, 32).
elevação: sombras suaves e curtas.
movimento: 200ms, easing cubic-bezier(0.2, 0, 0, 1).

ALVO ESTÉTICO: SaaS interno moderno, limpo, respirado, mobile-first,
com light e dark mode. Profissional, confiável, rápido. NÃO institucional
pesado, NÃO genérico de template.
```

---

## 3. Referência de tokens embutida (caso precise consultar)

| Papel | Claro | Escuro |
|---|---|---|
| Fundo | `#F7F8FA` | `#0A0D14` |
| Superfície (card) | `#FFFFFF` | `#121620` |
| Borda | `#DEE3EC` | `#353D4B` |
| Texto | `#121620` | `#F7F8FA` |
| Texto suave | `#4B5566` | `#C5CCDA` |
| Primário (acento/foco) | `#0094FF` | `#1F9FFF` |
| Primário forte (botão/link) | `#0077DB` | `#5CB7FF` |
| Link | `#0061B0` | `#5CB7FF` |
| Sucesso (texto) | `#0E6E3B` | `#1FB866` |
| Aviso (texto) | `#8A5808` | `#F6B43C` |
| Erro | `#D32A20` | `#F0463C` |
| Marca profunda (hero) | `#000050` | `#000050` |

**Escala primária:** 50 `#E8F4FF` · 100 `#CFE8FF` · 200 `#9CD2FF` · 300 `#5CB7FF` · 400 `#1F9FFF` · **500 `#0094FF`** · 600 `#0077DB` · 700 `#0061B0` · 800 `#00477D` · 900 `#002E52` · 950 `#001A30`.

---

## 4. BLOCO 2 — Primeira tela: Ranking (vertical slice)

```
Gere a tela "Ranking" do Banritools. Mobile-first, com versão light e dark.
Use os tokens semânticos do design system — nunca hex crus.

ESTRUTURA (de cima para baixo):
1. TOP APP BAR: ícone de menu (hambúrguer) à esquerda; logo/título ao
   centro; à direita ícones de busca, atualizar, notificações (com ponto)
   e avatar com iniciais.
2. CABEÇALHO: título "Ranking" com ícone de troféu; subtítulo
   "Sua evolução em junho".
3. CARD "SUA POSIÇÃO" (destaque):
   - rótulo "SUA POSIÇÃO".
   - posição em número MUITO grande: "1º" seguido de "de 1" menor.
   - frase de incentivo: "Você está liderando o mês. Continue no ritmo!".
   - pílula de pontos "6.600 pts" (contraste acessível — não texto azul
     claro sobre azul claro).
   - barra de progresso "Sua evolução vs. líder" com "6.600 / 6.600 pts".
   - texto de apoio: "Cada lançamento de produção soma pontos."
4. CARD "LÍDER DO MÊS":
   - rótulo "LÍDER DO MÊS" + ícone de troféu.
   - nome do líder em destaque (use "Fulano de Tal" — dado fictício).
   - pontos "6.600 pts".
5. BOTTOM NAVIGATION: Início, Produção, Produtos, Menu (com ícones).

REQUISITOS:
- Pontos e valores com tabular-nums.
- Cards: superfície branca (clara) / superfície escura (dark), raio lg (14px),
  borda sutil, sombra curta, respiro interno generoso (16–24px).
- Barra de progresso preenchida em cor acessível (não verde claro fino).
- Avatar e foco usando o azul de marca; texto e elementos pequenos nas
  variantes acessíveis.
- DADOS FICTÍCIOS sempre. Nada de nome/conta/email reais.
- NÃO copie um visual genérico de template — eleve para SaaS moderno.
```

---

## 5. Snippets de refino (use conforme itera)

**Contraste:**
```
Verifique o contraste de todos os textos. Nada de texto azul claro sobre
fundo azul claro. Pílulas e botões devem passar WCAG AA (4,5:1 para texto
normal). Use #0061B0/#0077DB para texto e botões, não #0094FF.
```

**Espaçamento / hierarquia:**
```
Aumente o respiro: padding interno dos cards em 20–24px, espaço entre cards
em 16px. O número da posição deve dominar visualmente; rótulos menores e em
texto suave (#4B5566).
```

**Dark mode:**
```
Gere a versão dark: fundo #0A0D14, cards #121620, texto #F7F8FA, acento
clareado para #1F9FFF. O hero/cabeçalho de marca pode usar o navy #000050.
```

**Tipografia:**
```
Títulos em Exo 2 (peso 700); corpo em Source Sans 3. Aplique um leve
letter-spacing (0.01em) só nos títulos grandes, para ecoar o logotipo.
```

---

## 6. Guardrails — o que NÃO fazer

- ❌ Não usar `#0094FF` em texto normal ou rótulo de botão.
- ❌ Não usar hex crus nos componentes — sempre tokens semânticos.
- ❌ Não reproduzir o visual genérico do app atual (as screenshots são
  referência de estrutura, não alvo estético).
- ❌ Não usar dados reais (nome, conta, email) — só fictícios.
- ❌ Não gerar dez telas de uma vez. Só o Ranking nesta rodada.

---

## 7. Critérios de aceite da primeira tela

- [ ] Identidade Banrisul reconhecível (cor, logo, tom), mas moderna.
- [ ] Todos os textos passam contraste AA.
- [ ] Light e dark mode coerentes.
- [ ] Pontos/valores com tabular-nums.
- [ ] Hierarquia clara: a posição domina; rótulos discretos.
- [ ] Mobile-first, respirado, com cara de SaaS interno — não de planilha.
- [ ] Zero dado sensível.

Se os 7 passam, o DS está bem calibrado e você pode seguir para a próxima tela.

---

*v0.1 — Brief de início. Volte aqui com o resultado do canvas para refinar.*
