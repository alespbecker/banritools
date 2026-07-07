# Ajustes finais — Atmosfera + Hero da Landing

Escopo: `src/features/marketing/Landing.tsx`, novo `src/features/marketing/RoamingHexes.tsx`, `src/hooks/useTheme.ts`, e utilitários em `src/styles.css`. Sem novas dependências.

## A1 — SlotWordmark com inércia (ease-in/out)

Substituir o modelo atual (throttle fixo 80ms atrelado a `explode`) por um baseado em energia real do scroll:

- Dentro de `SlotWordmark`, criar `scrollY` via `useScroll()` global e derivar `vel = useVelocity(scrollY)`.
- `energy = useSpring(useTransform(vel, v => Math.min(1, Math.abs(v) / 1600)), { stiffness: 110, damping: 28 })` (K calibrado empiricamente).
- Loop em `useAnimationFrame((t) => …)`: guardar `lastTick` e `interval = lerp(220, 50, energy.get())`; quando `energy < 0.05` por >120ms, escrever `BASE` ("banritools") e pausar. Escrita continua via `textContent` (zero setState).
- Prop `spinAmount` deixa de ser necessária, mas mantida por compat (ignora). `aria-label="banritools"` no `<span>` para leitores de tela; visualmente segue mostrando dígitos aleatórios.
- Reduced motion: nunca gira; textContent = BASE.

## A2 — Explosão 3D (CSS 3D via framer, sem lib)

No `Hero`:

- Contêiner de 120×120 que envolve os 3 hexágonos ganha `style={{ perspective: 1100, transformStyle: "preserve-3d" }}`. Cada `motion.div` filho recebe `transform-style: preserve-3d`.
- Novos `useTransform(explode, …)`:
  - Topo: `z: 0→90`, `rotateY: 0→160`, `filter: brightness(1→1.15)`.
  - Esquerdo: `z: 0→-70`, `rotateX: 0→-140`, `filter: brightness(1→0.85) blur(0→1.5px)`.
  - Direito: `z: 0→40`, `rotateY: 0→-120`.
- Substituir `rotate` 2D atual por esses `rotateX/rotateY` por hex (mantém `x`/`y` existentes). Adiciona `drop-shadow` proporcional ao |z| (`0 8px 18px rgba(cor,0.35)` no hex mais próximo; hex afastado sem sombra).
- Reduced motion: todos os transforms Z/rotateX/rotateY em `[0,0]` (comportamento estático mantido).

## A3 — `RoamingHexes` (3 hexágonos wireframe passeando)

Novo arquivo `src/features/marketing/RoamingHexes.tsx`:

- Componente client-only (guard `typeof window`). Retorna `<div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>` com 3 `<svg>` absolutos.
- Cada hex: `viewBox="0 0 100 100"`, polígono pointy-top, `fill="none"`, `stroke={cor}`, `strokeWidth={1.25}`, `strokeLinejoin="round"`. Tamanhos 360/420/300px. Cores `#0094FF`/`#1CD8CA`/`#936FFA`. Wrapper style: `filter: drop-shadow(0 0 10px cor) drop-shadow(0 0 28px cor66)`, `opacity: 0.3`.
- Estado (via refs, sem React state): `{x, y, vx, vy, rot, vRot}` por hex, velocidades 18–30 px/s, rotação 4°/s. `requestAnimationFrame` escreve `el.style.transform = translate3d(x,y,0) rotate(rot)` diretamente. Inverter vx/vy ao tocar bordas (DVD-style). Recalcular limites em `resize`.
- Pausar quando `document.hidden` (visibilitychange). Cleanup no unmount.
- Reduced motion: renderiza posições fixas decorativas espalhadas, sem rAF.
- Inserido em `Landing()` como irmão de `.ambient-glow`, fora do wrapper `z-10` (fica atrás do conteúdo, na frente do fundo).

## A4 — Tema: light default + nudge

`src/hooks/useTheme.ts`: mudar init para default `light` quando `localStorage.getItem("banritools-theme")` for `null`; qualquer valor salvo é respeitado.

Novo estado no `ThemeToggle` da landing:

- Ler/escrever `localStorage["bt_theme_nudge"] = { shows: number, done: boolean }`.
- Ao montar: se `done`, não faz nada. Senão, se `shows < 2`, ativa `pulse=true` e incrementa `shows` (persistido). Auto-desativa após 12s.
- `onClick`: seta `done=true`, para pulse imediatamente.
- Visual: mesmo `.fab-radar` do RegisterFAB (já existe em `styles.css`) aplicado condicionalmente ao botão (`className={pulse ? "... fab-radar" : "..."}`). Sem tooltip.
- Reduced motion: sem animação (`.fab-radar` já respeita).

## A5 — Ruído + menos blur

- Novo utilitário CSS em `src/styles.css`: `.landing-noise` — `position: fixed; inset:0; pointer-events:none; z-index:2; opacity:.03; mix-blend-mode:soft-light; background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");`. Reduced-motion irrelevante (estático).
- Inserir `<div className="landing-noise" aria-hidden />` em `Landing()`.
- Downgrade de blur na landing (SOMENTE `Landing.tsx`): substituir todas ocorrências `backdrop-blur-md` → `backdrop-blur-sm`; `bg-card/90` → `bg-card/80` mantendo `border-border` p/ contraste. Ocorrências identificadas: linhas 59 (TopBar), 278, 467, 530, 585, 606, 786.

## Arquivos

- `src/features/marketing/Landing.tsx` — refatorar Hero (A2) + SlotWordmark (A1) + ThemeToggle nudge (A4) + inserir `<RoamingHexes/>` e `.landing-noise` (A3/A5) + swap dos blurs (A5).
- `src/features/marketing/RoamingHexes.tsx` — novo.
- `src/hooks/useTheme.ts` — default `light`.
- `src/styles.css` — adicionar `.landing-noise` e (se necessário) manter `.fab-radar` já existente.

## Riscos

- Perspective 3D em Safari iOS: `preserve-3d` no filho às vezes é ignorado se o pai tem `overflow-hidden`. O wrapper sticky do Hero tem `overflow-hidden`; testar em 390px — se cortar, mover o perspective para dentro do sticky (após overflow) mantendo o efeito.
- `useVelocity` do `scrollYProgress` local pode ficar zerado quando o Hero sai da tela — por isso usar `useScroll()` global (`window`).
- Nudge no primeiro acesso pode conflitar com SSR: inicializar `pulse=false`, ativar em `useEffect` (client-only).
- RoamingHexes atrás do conteúdo: `z-index:1` fica abaixo de `.relative z-10`. Confirmar que `.ambient-glow` continua em `z:0` (é `position: fixed; z-index:0` no CSS atual).

## Validação

- `tsgo --noEmit`.
- Playwright 1280×1800 e 390×844: screenshot do Hero em `scrollY=0`, `400`, `800`, `1400`; verificar profundidade visível dos hexágonos, wordmark girando com aceleração/desaceleração ao dar scroll pulsado, roaming hexes visíveis discretos, ruído perceptível apenas em zoom.
- Limpar `localStorage` e recarregar 2×: pulse aparece nas 2 primeiras visitas; após clicar, nunca mais.
- Testar com DevTools `Rendering → prefers-reduced-motion: reduce`: sem animações; hexes estáticos; wordmark "banritools".
- Console limpo.
