# Banritools — Guia do Projeto (Design System)

Pacote da frente de **Design, Identidade Visual, UI e UX**. Documentos em formato aberto, agnósticos de ferramenta.

## Ordem de leitura

1. **`01-plano-mestre-design-system-banritools.md`** — visão geral, arquitetura do pipeline, as 6 fases e o plano executivo. Comece por aqui.
2. **`achados-ux-banritools-estado-atual.md`** — auditoria do Banritools atual: inventário de telas, problemas priorizados e oportunidade de DS. O "antes" do pitch.
3. **`contrato-de-tokens-banritools.md`** — a fundação: cores (MIV + variantes acessíveis), tipografia e tabela de contraste WCAG verificada. Fonte única de verdade.
4. **`inventario-componentes-banritools.md`** — a fila da linha de produção: componentes em ordem atômica, por balde e prioridade.
5. **`brief-inicio-claude-design-banritools.md`** — prompts prontos para colar no Claude Design (setup do DS + primeira tela: Ranking).

## tokens/

- **`tokens.css`** — CSS custom properties + mapeamento Tailwind v4, com light e dark. Pronto para o Banritools.
- **`tokens.json`** — os mesmos tokens em formato portável, para qualquer ferramenta.

## Princípio fundador

Toda entrega sobrevive à remoção do andaime de IA: tokens em formatos abertos, componentes em shadcn/ui + TypeScript, documentação estática. Critério de aceite: *"funciona se o Claude desaparecer amanhã?"*

---

*Guia do Projeto Banritools · Frente de Design · v0.1*
