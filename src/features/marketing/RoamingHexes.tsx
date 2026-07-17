import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Camada decorativa: 3 hexágonos wireframe passeando pela viewport
 * (DVD-style). Cantos arredondados (~5px viewBox), stroke fino, glow
 * suave. No mobile o tamanho é 1/3 do desktop.
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

// Hexágono com cantos arredondados via cubic-bezier em cada vértice.
// Gerado a partir dos 6 vértices originais com raio ≈ 5 (em unidades viewBox 0..100).
function roundedHexPath(pts: Array<[number, number]>, r: number): string {
  const n = pts.length;
  let d = "";
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const curr = pts[i];
    const next = pts[(i + 1) % n];
    const v1x = prev[0] - curr[0], v1y = prev[1] - curr[1];
    const v2x = next[0] - curr[0], v2y = next[1] - curr[1];
    const l1 = Math.hypot(v1x, v1y);
    const l2 = Math.hypot(v2x, v2y);
    const p1x = curr[0] + (v1x / l1) * r, p1y = curr[1] + (v1y / l1) * r;
    const p2x = curr[0] + (v2x / l2) * r, p2y = curr[1] + (v2y / l2) * r;
    d += i === 0 ? `M${p1x},${p1y}` : ` L${p1x},${p1y}`;
    d += ` Q${curr[0]},${curr[1]} ${p2x},${p2y}`;
  }
  return d + " Z";
}

const HEX_VERTS: Array<[number, number]> = [
  [50, 4], [91.57, 27], [91.57, 73], [50, 96], [8.43, 73], [8.43, 27],
];
const HEX_PATH = roundedHexPath(HEX_VERTS, 5);

function makeInitial(scale: number): HexDef[] {
  return [
    { size: 360 * scale, color: "#0094FF", x: 80,  y: 120, vx:  22, vy:  18, rot:   0, vRot:  4 },
    { size: 420 * scale, color: "#1CD8CA", x: 900, y: 320, vx: -26, vy:  24, rot:  30, vRot: -3 },
    { size: 300 * scale, color: "#936FFA", x: 500, y: 700, vx:  20, vy: -28, rot:  60, vRot:  5 },
  ];
}

export function RoamingHexes() {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const [isMobile, setIsMobile] = useState(false);
  const state = useRef<HexDef[]>(makeInitial(1));

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      const mob = mq.matches;
      setIsMobile(mob);
      state.current = makeInitial(mob ? 1 / 3 : 1);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduced) {
      state.current.forEach((h, i) => {
        const el = refs.current[i];
        if (el) el.style.transform = `translate3d(${h.x}px, ${h.y}px, 0) rotate(${h.rot}deg)`;
      });
      return;
    }

    let raf = 0;
    let last = performance.now();
    let paused = false;

    const getBounds = () => ({ w: window.innerWidth, h: window.innerHeight });

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
  }, [reduced, isMobile]);

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
            filter: `drop-shadow(0 0 6px ${h.color}) drop-shadow(0 0 18px ${h.color}88)`,
            transform: `translate3d(${h.x}px, ${h.y}px, 0) rotate(${h.rot}deg)`,
          }}
        >
          <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ strokeLinejoin: "round", strokeLinecap: "round" }}>
            <path d={HEX_PATH} fill="none" stroke={h.color} strokeWidth={0.42} />
          </svg>
        </div>
      ))}
    </div>
  );
}
