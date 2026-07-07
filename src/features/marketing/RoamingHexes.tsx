import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Camada decorativa: 3 hexágonos wireframe grandes passeando pela viewport
 * (DVD-style). Movimento por rAF escrevendo transform direto no DOM.
 * Fica atrás do conteúdo (z=1) e na frente do background/ambient-glow (z=0).
 */

type HexDef = {
  size: number;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
};

const HEX_POINTS = "50,4 91.57,27 91.57,73 50,96 8.43,73 8.43,27";

function makeInitial(): HexDef[] {
  return [
    { size: 360, color: "#0094FF", x: 80,  y: 120, vx:  22, vy:  18, rot:   0, vRot:  4 },
    { size: 420, color: "#1CD8CA", x: 900, y: 320, vx: -26, vy:  24, rot:  30, vRot: -3 },
    { size: 300, color: "#936FFA", x: 500, y: 700, vx:  20, vy: -28, rot:  60, vRot:  5 },
  ];
}

export function RoamingHexes() {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const state = useRef<HexDef[]>(makeInitial());

  useEffect(() => {
    if (reduced) {
      // Estáticos em posições decorativas
      state.current.forEach((h, i) => {
        const el = refs.current[i];
        if (el) el.style.transform = `translate3d(${h.x}px, ${h.y}px, 0) rotate(${h.rot}deg)`;
      });
      return;
    }

    let raf = 0;
    let last = performance.now();
    let paused = false;

    const getBounds = () => ({
      w: window.innerWidth,
      h: window.innerHeight,
    });

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!paused) {
        const { w, h } = getBounds();
        for (let i = 0; i < state.current.length; i++) {
          const s = state.current[i];
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.rot += s.vRot * dt;
          if (s.x < 0) { s.x = 0; s.vx = Math.abs(s.vx); }
          else if (s.x + s.size > w) { s.x = w - s.size; s.vx = -Math.abs(s.vx); }
          if (s.y < 0) { s.y = 0; s.vy = Math.abs(s.vy); }
          else if (s.y + s.size > h) { s.y = h - s.size; s.vy = -Math.abs(s.vy); }
          const el = refs.current[i];
          if (el) el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) rotate(${s.rot}deg)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const onVis = () => { paused = document.hidden; last = performance.now(); };
    const onResize = () => {
      const { w, h } = getBounds();
      for (const s of state.current) {
        if (s.x + s.size > w) s.x = Math.max(0, w - s.size);
        if (s.y + s.size > h) s.y = Math.max(0, h - s.size);
      }
    };

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
    };
  }, [reduced]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1, overflow: "hidden" }}
    >
      {state.current.map((h, i) => (
        <div
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          className="absolute top-0 left-0 will-change-transform"
          style={{
            width: h.size,
            height: h.size,
            opacity: 0.3,
            filter: `drop-shadow(0 0 10px ${h.color}) drop-shadow(0 0 28px ${h.color}66)`,
            transform: `translate3d(${h.x}px, ${h.y}px, 0) rotate(${h.rot}deg)`,
          }}
        >
          <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ strokeLinejoin: "round", strokeLinecap: "round" }}>
            <polygon
              points={HEX_POINTS}
              fill="none"
              stroke={h.color}
              strokeWidth={1.25}
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
