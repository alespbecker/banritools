BLOCO 0 — Estabilização das animações da Landing

Escopo restrito a `src/features/marketing/Landing.tsx` (+ `src/components/Logo.tsx` se necessário). Sem novas deps, sem mexer em rotas autenticadas/tema/tokens globais/textos além do especificado.

## 1. Plano

### A. Hero — mantém scrub, corrige janela e wordmark

- Aumentar a janela de scrub: seção passa de `h-[115vh]` para `h-[220vh]` (sticky `h-screen` continua, gerando ~120vh úteis).
- Consertar o loop de re-render do `SlotWordmark`:
  - Remover `useMotionValueEvent(explode, "change", setSpinAmount)` (setState por frame).
  - Remover o `setInterval(80ms)` de dígitos aleatórios.
  - Novo `SlotWordmark`: recebe a `MotionValue<number>` (`explode`) diretamente. Cada letra é um `<motion.span>` cujo conteúdo é atualizado via `useMotionValueEvent` **local, condicionado por throttle de tempo (>=80ms)** e escrito no DOM com `ref.current.textContent` — zero re-render React. Fallback: quando `spinAmount <= 0.04`, mostra "banritools".
  - `useReducedMotion`: desativa spin completamente (texto fixo "banritools").
- Passar `spinAmount` como MotionValue (não number) para o novo componente.

### B. 6 seções (Registro, Painel, Metas, Ranking, Conquistas, Relatórios) — trocar sticky+scrub por `whileInView`

Padrão único para as 6:

- Container: `<section className="relative py-24 md:py-32">` (altura natural, sem `h-[108vh]`, sem sticky, sem `h-screen`).
- Wrapper de conteúdo com `initial={{ opacity: 0, y: 24 }}`, `whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true, margin: "-15% 0px" }}`, `transition={{ duration: 0.6, ease: [0.2,0,0,1] }}`.
- Stagger via `staggerChildren: 0.08` no pai + variants nos filhos.
- Substituir cada `useScroll`/`useTransform` pelas animações equivalentes disparadas 1× ao entrar:
  - **Registro**: dígitos do form vão de 0→valor final via `animate` on-mount-in-view (tween 700ms).
  - **Painel**: barras crescem `scaleY 0→v/8400` com stagger por barra.
  - **Metas**: barra de progresso `width 0→pct` (tween 800ms, ease standard). Trocar `"Metas de novembro"` hardcoded por `Metas do mês` (regra: não mudar textos além do especificado — este está listado como bug de diagnóstico).
  - **Ranking**: podium **sem `scaleY**`. Trocar por animação de `height` (0→target) via `motion.div` com `height` inicial 0 e `animate` para o alvo; o número "1º/2º/3º" fica fora do elemento animado (sobreposto absoluto no topo da barra, `pointer-events-none`) para não distorcer.
  - **Conquistas**: entrada com stagger dos badges (`opacity` + `scale` 0.9→1).
  - **Relatórios**: `rotateY` do card fica; dispara via `whileInView` (0→180 → volta a 0 num loop único, ou fica no estado final — manter mesmo comportamento visual final atual, só disparado 1× ao entrar).
- Todos respeitam `useReducedMotion` → sem animação, estado final direto.

### C. Wrapper raiz

- Remover `overflow-hidden` de `<div id="top" className="…overflow-hidden">` (linha ~822). Substituir por `overflow-x-clip` (não vira scroll container, preserva `position: sticky` no iOS).

### D. Micro-ajustes

- Trocar `h-screen` do Hero sticky por `h-[100svh]` (evita pulo da barra do Safari mobile). Idem qualquer outro `h-screen` remanescente após remoção das 6 seções.
- CTA hover: substituir `hover:bg-[#1CD8CA] text-white` por hover que mantém contraste AA — usar `hover:bg-[#0094FF]` (mesmo tom do primário, texto branco 4.5:1 OK) OU manter `#1CD8CA` mas com `text-[#0F172A]` (dark navy). Vou usar a 2ª opção (preserva a cor de marca teal).
- `VideoMock`: cursor animado só renderiza em `md:` → adicionar `hidden md:block` no wrapper do cursor.

## 2. Arquivos/trechos a alterar

- `**src/features/marketing/Landing.tsx**`
  - const `SECTION_H` removida (ou mantida só para o Hero como `HERO_H = "h-[220vh]"`).
  - `SectionHero`: nova altura, `h-[100svh]` no sticky, wordmark passa MotionValue.
  - `SlotWordmark`: reescrito sem setState/setInterval.
  - `SectionRegistro`, `SectionPainel`, `SectionMetas`, `SectionRanking`, `SectionConquistas`, `SectionRelatorios`: remover `useScroll/useTransform/sticky/h-[108vh]`, aplicar padrão `whileInView` + variants.
  - `PodiumBar`: refator para animar `height` e mover número para fora do bloco animado.
  - Wrapper raiz: `overflow-hidden` → `overflow-x-clip`.
  - CTAs: ajustar classes de hover.
  - `VideoMock`: cursor com `hidden md:block`.
  - Trocar `"Metas de novembro"` por `"Metas do mês"`.
- `**src/components/Logo.tsx**`: provavelmente não precisa mudar. Só toco se o `SlotWordmark` for movido para lá — mas ele é interno à landing, fica no próprio arquivo.

## 3. Riscos

- **Ranking sem `scaleY**`: mudar para `height` animado pode reflowar o layout — mitigado usando `motion.div` com altura absoluta dentro de container de altura fixa (`h-[240px]`), então só a barra interna cresce.
- `**overflow-x-clip**`: não suportado em Safari <16. Fallback aceitável (Safari antigo mostra scroll horizontal se algo vazar; hoje nada vaza porque os hexágonos ficam contidos no Hero).
- **Wordmark via `textContent` direto**: precisa de `useRef` em cada `<span>`. Alternativa mais simples: um único `<span>` cujo `textContent` inteiro é reescrito. Vou usar a alternativa simples.
- **Perda de "efeito assinatura" nas 6 seções**: aceito pelo brief — o Hero segura a assinatura.
- **Regressão visual em estados finais**: os finais devem parecer iguais aos atuais (mesmas cores, tamanhos, textos).

## 4. Critérios de aceite (como vou validar)

- Build/typecheck OK (harness roda automaticamente).
- Playwright headless em `http://localhost:8080/`: capturar screenshots do Hero em `scrollY = 0, 400, 800, 1200` e das 6 seções ao entrar no viewport. Conferir:
  - Wordmark do Hero não flickera (comparar frames 400↔500).
  - Sticky do Hero permanece pinado ao longo da janela ampliada.
  - Barras do Ranking crescem sem esticar o número.
  - `"Metas do mês"` presente.
  - Cursor do VideoMock ausente em viewport 375px, presente em 1280px.
- Console limpo (sem warnings novos de framer-motion).
- Testar `prefers-reduced-motion: reduce` via emulação → todas as seções renderizam no estado final sem animar.

## 5. Perguntas antes de implementar

Nenhuma bloqueante. Sigo a estratégia aprovada. Se preferir cor de hover diferente para o CTA (item D), me diga; caso contrário aplico `#1CD8CA` + texto `#0F172A`.

Resposta p pergunta acima:

No item D, use hover:bg-[#0077DB] com texto branco