import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { Logo, LogoHexes } from "@/components/Logo";
import { useTheme } from "@/hooks/useTheme";
import {
  ArrowRight,
  BarChart3,
  Trophy,
  FileText,
  Sparkles,
  Zap,
  Target,
  Award,
  Flame,
  Star,
  Medal,
  Rocket,
  Sun,
  Moon,
  MousePointer2,
} from "lucide-react";

/**
 * Landing pública estilo "AirPods Pro" — cada seção pinada com sticky.
 *
 * Princípios desta revisão:
 *  - Animações começam IMEDIATAMENTE quando o pin engata (range 0..~0.55)
 *    e terminam ANTES do pin soltar, para evitar elemento parado.
 *  - Seções pinadas usam altura curta (108vh) ⇒ só 8vh úteis de scroll,
 *    encurtando o espaço entre dobras.
 *  - Elementos que entram pela lateral começam com opacity 0 explícito
 *    via `initial`, e seu MotionValue só multiplica depois (evita flash).
 *  - Hero: hexágonos e wordmark amarrados ao PROGRESSO de scroll, não à
 *    velocidade. Avanço = explode/roleta. Recuo = reverte. Parado = mantém.
 */

const STICKY_OFFSET: ["start start", "end end"] = ["start start", "end end"];
const SECTION_H = "h-[108vh]";

/* ============ TOP BAR + tema ============ */
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
      className="h-8 w-8 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/60 border-b border-border/40">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo size={26} />
          <span
            className="lowercase tracking-[0.048em] text-[15px]"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400 }}
          >
            banritools
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition">
            Entrar
          </Link>
          <Link
            to="/login"
            className="text-sm font-medium px-4 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-[#1CD8CA] hover:text-white transition"
          >
            Acessar painel
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SectionEyebrow({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-wider mb-4">
      <Icon className="h-4 w-4" /> {label}
    </div>
  );
}

/* ============ 1. HERO — amarrado ao progresso ============ */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  // O range 0..0.6 garante que a "explosão" total acontece antes da seção sair.
  const { scrollYProgress } = useScroll({ target: ref, offset: STICKY_OFFSET });
  const explode = useTransform(scrollYProgress, [0, 0.6], reduced ? [0, 0] : [0, 1], { clamp: true });

  const topY = useTransform(explode, [0, 1], [0, -120]);
  const leftX = useTransform(explode, [0, 1], [0, -100]);
  const leftY = useTransform(explode, [0, 1], [0, 60]);
  const rightX = useTransform(explode, [0, 1], [0, 100]);
  const rightY = useTransform(explode, [0, 1], [0, 60]);
  const hexRot = useTransform(explode, [0, 1], [0, 180]);
  const hexRotInv = useTransform(hexRot, (r) => -r);

  // Wordmark vira roleta proporcional ao explode (1 = totalmente numérico).
  const [spinAmount, setSpinAmount] = useState(0);
  useMotionValueEvent(explode, "change", (v) => setSpinAmount(v));

  return (
    <section ref={ref} className="relative h-[115vh]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Entrada inicial do logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.25, filter: "blur(12px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Rotação contínua sutil só enquanto não há explosão */}
          <motion.div
            animate={reduced ? undefined : { rotate: 360 }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
            className="will-change-transform"
          >
            <div className="relative" style={{ width: 120, height: 120 }}>
              <motion.div style={{ y: topY, rotate: hexRot }} className="absolute inset-0 will-change-transform">
                <HexOnly color="#0094FF" points="50,17 64.72,25.5 64.72,42.5 50,51 35.28,42.5 35.28,25.5" />
              </motion.div>
              <motion.div style={{ x: leftX, y: leftY, rotate: hexRotInv }} className="absolute inset-0 will-change-transform">
                <HexOnly color="#1CD8CA" points="33.548,45.5 48.268,54 48.268,71 33.548,79.5 18.828,71 18.828,54" />
              </motion.div>
              <motion.div style={{ x: rightX, y: rightY, rotate: hexRot }} className="absolute inset-0 will-change-transform">
                <HexOnly color="#936FFA" points="66.452,45.5 81.172,54 81.172,71 66.452,79.5 51.732,71 51.732,54" />
              </motion.div>
              <Particles intensity={explode} />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="mt-3 flex flex-col items-center text-center px-6 max-w-3xl"
        >
          <SlotWordmark spinAmount={spinAmount} />
          <p className="mt-10 text-sm md:text-base text-muted-foreground font-light max-w-xl">
            Um jogo com cara de gerenciador: veja em tempo real a produção da agência
            e divirta-se enquanto vende.
          </p>
          <div
            className="snake-border mt-10 inline-flex items-center gap-2 text-base text-foreground px-6 py-2.5 rounded-full"
            aria-hidden="true"
          >
            <span>Role para descobrir</span>
            <span className="animate-bounce">↓</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HexOnly({ color, points }: { color: string; points: string }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ strokeLinejoin: "round", strokeLinecap: "round" }}>
      <polygon fill={color} stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}

function Particles({ intensity }: { intensity: MotionValue<number> }) {
  // 10 sparks (menos que antes — mais performático). Hooks fora do callback.
  const sparks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const colors = ["#0094FF", "#1CD8CA", "#936FFA", "#B794FF"];
  return (
    <>
      {sparks.map((i) => (
        <Spark key={i} index={i} total={sparks.length} color={colors[i % colors.length]} intensity={intensity} />
      ))}
    </>
  );
}

function Spark({ index, total, color, intensity }: { index: number; total: number; color: string; intensity: MotionValue<number> }) {
  const angle = (index / total) * Math.PI * 2;
  const baseDist = 55 + (index % 4) * 14;
  const x = useTransform(intensity, [0, 1], [0, Math.cos(angle) * baseDist]);
  const y = useTransform(intensity, [0, 1], [0, Math.sin(angle) * baseDist]);
  const op = useTransform(intensity, [0, 0.1, 1], [0, 0.85, 0]);
  const scale = useTransform(intensity, [0, 1], [0.4, 1.4]);
  return (
    <motion.span
      style={{ x, y, opacity: op, scale, background: color, boxShadow: `0 0 8px ${color}` }}
      className="absolute left-1/2 top-1/2 w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full will-change-transform"
    />
  );
}

/** Wordmark "roleta": mesma tipografia em qualquer estado; só o conteúdo de
 *  cada letra alterna para dígitos quando spinAmount > 0. Mantém exatamente
 *  o estilo do Wordmark original (Poppins 350, tracking 0.048em). */
function SlotWordmark({ spinAmount }: { spinAmount: number }) {
  const letters = "banritools".split("");
  const spinning = spinAmount > 0.04;
  const [digits, setDigits] = useState<number[]>(() => letters.map(() => 0));
  useEffect(() => {
    if (!spinning) return;
    const id = window.setInterval(() => {
      setDigits(letters.map(() => Math.floor(Math.random() * 10)));
    }, 80);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning]);

  return (
    <span
      className="lowercase tracking-[0.048em]"
      style={{
        fontFamily: "Poppins, sans-serif",
        fontWeight: 350,
        fontSize: 48,
        lineHeight: 1,
        WebkitFontSmoothing: "antialiased",
        textRendering: "geometricPrecision",
      }}
    >
      {spinning
        ? letters.map((_, i) => <span key={i}>{digits[i]}</span>)
        : "banritools"}
    </span>
  );
}

/* ============ 2. VIDEO MOCK do Painel da Agência ============ */
/**
 * "Vídeo" do app rodando — animação CSS/Framer determinística (não loopa).
 * Acionada por IntersectionObserver. Cursor anda e "clica" em elementos.
 * Máscara fade-out na base via mask-image.
 */
function VideoMock() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(true);
      },
      { threshold: 0.35 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  // Pontos do mouse (em % do container) e "clicks" no caminho.
  const cursorPath = reduced
    ? [{ x: 50, y: 50, t: 0 }]
    : [
        { x: 8, y: 18, t: 0 },
        { x: 22, y: 38, t: 1.2 },     // hover KPI 1
        { x: 46, y: 38, t: 2.4 },     // hover KPI 2 (click)
        { x: 70, y: 38, t: 3.6 },
        { x: 60, y: 72, t: 5.0 },     // ranking
        { x: 30, y: 80, t: 6.2 },
      ];

  return (
    <section ref={ref} className="relative">
      <div className="mx-auto max-w-6xl px-6 -mt-8 md:-mt-12 mb-8">
        <div
          className="relative rounded-2xl border border-border bg-card/70 backdrop-blur-md overflow-hidden shadow-2xl shadow-primary/10"
          style={{
            aspectRatio: "16/9",
            WebkitMaskImage:
              "linear-gradient(to bottom, #000 0%, #000 70%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, #000 0%, #000 70%, transparent 100%)",
          }}
        >
          {/* "App chrome" */}
          <div className="absolute inset-x-0 top-0 h-9 bg-background/80 border-b border-border/50 flex items-center gap-2 px-4">
            <Logo size={14} />
            <span className="text-[11px] lowercase tracking-[0.048em] text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>
              banritools — painel da agência
            </span>
          </div>

          <div className="absolute inset-0 pt-12 px-6 pb-8 grid grid-rows-[auto_1fr] gap-4">
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { l: "Produtos", v: "847", c: "#0094FF" },
                { l: "Volume", v: "R$ 2.341k", c: "#1CD8CA" },
                { l: "Ativos", v: "12", c: "#936FFA" },
                { l: "Pontos", v: "36.540", c: "#B794FF" },
              ].map((k, i) => (
                <MockKpi key={i} {...k} active={active} delay={0.6 + i * 0.15} highlight={active && i === 1} />
              ))}
            </div>

            {/* Ranking bars */}
            <div className="rounded-xl border border-border/60 bg-background/40 p-4">
              <div className="text-[11px] text-muted-foreground mb-3">Top 10 — Produção (pts)</div>
              <div className="flex items-end gap-2 h-[80%]">
                {[8400, 7200, 6850, 5900, 5400, 4900, 4200, 3700, 3100, 2600].map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ scaleY: 0 }}
                    animate={active ? { scaleY: v / 8400 } : { scaleY: 0 }}
                    transition={{ duration: 0.9, delay: 1.4 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      originY: 1,
                      background: "linear-gradient(180deg, #0094FF 0%, #1CD8CA 100%)",
                    }}
                    className="flex-1 rounded-t-md will-change-transform"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Cursor animado */}
          {!reduced && (
            <motion.div
              initial={{ opacity: 0, left: `${cursorPath[0].x}%`, top: `${cursorPath[0].y}%` }}
              animate={
                active
                  ? {
                      opacity: [0, 1, 1, 1, 1, 1, 1, 0],
                      left: cursorPath.map((p) => `${p.x}%`),
                      top: cursorPath.map((p) => `${p.y}%`),
                    }
                  : { opacity: 0 }
              }
              transition={{ duration: 7, ease: "easeInOut", times: [0, 0.05, 0.2, 0.4, 0.55, 0.75, 0.95, 1] }}
              className="absolute will-change-transform z-20"
              style={{ transform: "translate(-4px,-4px)" }}
            >
              <MousePointer2 className="h-5 w-5 text-foreground drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]" />
            </motion.div>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Demonstração do painel — em tempo real, sem espera.
        </p>
      </div>
    </section>
  );
}

function MockKpi({ l, v, c, active, delay, highlight }: { l: string; v: string; c: string; active: boolean; delay: number; highlight: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-lg border bg-background/60 p-3 relative overflow-hidden"
      style={{ borderColor: highlight ? `${c}66` : undefined }}
    >
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{l}</div>
      <div className="text-base font-semibold mt-0.5 tabular-nums" style={{ color: highlight ? c : undefined }}>
        {v}
      </div>
      {highlight && (
        <motion.span
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: 0.8, delay: delay + 1.4 }}
          className="absolute left-1/2 top-1/2 w-8 h-8 -ml-4 -mt-4 rounded-full"
          style={{ background: `${c}44` }}
        />
      )}
    </motion.div>
  );
}

/* ============ 3. REGISTRO RÁPIDO ============ */
const MOCK_PRODUCTS = [
  { name: "Seguro Vida", cat: "Seguros", rate: "50 pts/unidade", color: "#0094FF", qty: 27, pts: 1350 },
  { name: "Consignado", cat: "Crédito", rate: "3 pts a cada R$ 1.000", color: "#1CD8CA", qty: 14, pts: 980 },
  { name: "Crédito Minuto", cat: "Crédito", rate: "25 pts/unidade", color: "#936FFA", qty: 22, pts: 550 },
  { name: "Cartão de Crédito", cat: "Cartões", rate: "40 pts/unidade", color: "#B794FF", qty: 18, pts: 720 },
];

function SectionRegistro() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: STICKY_OFFSET });

  return (
    <section ref={ref} className={`relative ${SECTION_H}`}>
      <div className="sticky top-0 h-screen flex items-center">
        <div className="mx-auto max-w-6xl w-full px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <SectionEyebrow icon={Zap} label="Registro rápido" />
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
              Lance a venda no
              <br />
              <span className="bg-gradient-to-r from-[#0094FF] via-[#1CD8CA] to-[#936FFA] bg-clip-text text-transparent">
                tempo que ela acontece.
              </span>
            </h2>
            <p className="text-lg text-muted-foreground font-light">
              Cards por produto, quantidade e valor. Variantes só aparecem quando
              precisam. Sem planilha, sem fricção.
            </p>
          </div>

          <div className="relative h-[420px]">
            {MOCK_PRODUCTS.map((p, i) => (
              <RegistroCard key={p.name} product={p} index={i} progress={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RegistroCard({ product, index, progress }: { product: (typeof MOCK_PRODUCTS)[number]; index: number; progress: MotionValue<number> }) {
  const reduced = useReducedMotion();
  const start = index * 0.10;
  const end = start + 0.20;
  const x = useTransform(progress, [start, end], reduced ? [0, 0] : [220, 0]);
  const op = useTransform(progress, [start, end], [0, 1]);
  const top = 30 + index * 18;
  const z = MOCK_PRODUCTS.length - index;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      style={{ x, opacity: op, top: `${top}px`, zIndex: z }}
      className="absolute left-0 right-0 will-change-transform"
    >
      <MockRegistro product={product} />
    </motion.div>
  );
}

function MockRegistro({ product }: { product: (typeof MOCK_PRODUCTS)[number] }) {
  return (
    <div
      className="rounded-2xl border bg-card/90 backdrop-blur-sm shadow-2xl p-5 max-w-md mx-auto"
      style={{ borderColor: `${product.color}55`, boxShadow: `0 20px 50px -20px ${product.color}55` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-medium">{product.name}</div>
          <div className="text-xs text-muted-foreground">{product.cat} · {product.rate}</div>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: `${product.color}22`, color: product.color }}>
          +{product.pts.toLocaleString("pt-BR")} pts
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Quantidade</div>
          <div className="h-10 rounded-md border flex items-center px-3 font-medium tabular-nums" style={{ borderColor: `${product.color}66`, background: `${product.color}0F` }}>
            {product.qty}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Valor (R$)</div>
          <div className="h-10 rounded-md border border-border bg-background/60 flex items-center px-3 text-muted-foreground">—</div>
        </div>
      </div>
      <button className="mt-4 w-full h-10 rounded-md text-white font-medium text-sm" style={{ background: product.color }}>
        Salvar produção
      </button>
    </div>
  );
}

/* ============ 4. PAINEL DA AGÊNCIA ============ */
function SectionPainel() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: STICKY_OFFSET });
  const reduced = useReducedMotion();

  const k1 = useTransform(scrollYProgress, [0, 0.45], [0, 847]);
  const k2 = useTransform(scrollYProgress, [0, 0.5], [0, 2_341_900]);
  const k3 = useTransform(scrollYProgress, [0, 0.55], [0, 12]);
  const k4 = useTransform(scrollYProgress, [0, 0.6], [0, 36_540]);
  const draw = useTransform(scrollYProgress, [0.05, 0.55], reduced ? [1, 1] : [0, 1]);
  const wrapOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);

  return (
    <section ref={ref} className={`relative ${SECTION_H}`}>
      <div className="sticky top-0 h-screen flex items-center">
        <motion.div style={{ opacity: wrapOpacity }} className="mx-auto max-w-6xl w-full px-6">
          <div className="text-center mb-10">
            <SectionEyebrow icon={BarChart3} label="Painel da agência" />
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Tudo o que o gerente precisa,
              <br />
              <span className="text-muted-foreground font-light">em uma única tela.</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Kpi label="Produtos vendidos" value={k1} fmt={(n) => n.toLocaleString("pt-BR")} />
            <Kpi label="Volume contratado" value={k2} fmt={(n) => `R$ ${(n / 1000).toFixed(0)}k`} />
            <Kpi label="Funcionários ativos" value={k3} fmt={(n) => n.toLocaleString("pt-BR")} />
            <Kpi label="Pontos do mês" value={k4} fmt={(n) => n.toLocaleString("pt-BR")} />
          </div>

          <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6">
            <div className="text-sm font-medium mb-4">Top 10 — Produção (pts)</div>
            <svg viewBox="0 0 600 180" className="w-full h-44">
              {[8400, 7200, 6850, 5900, 5400, 4900, 4200, 3700, 3100, 2600].map((v, i) => {
                const h = (v / 8400) * 140;
                return (
                  <motion.rect key={i} x={20 + i * 58} y={160 - h} width={40} height={h} rx={4} fill="url(#g)" style={{ scaleY: draw, originY: "160px" }} />
                );
              })}
              <defs>
                <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#0094FF" />
                  <stop offset="100%" stopColor="#1CD8CA" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Kpi({ label, value, fmt }: { label: string; value: MotionValue<number>; fmt: (n: number) => string }) {
  const display = useTransform(value, (v) => fmt(Math.round(v)));
  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4">
      <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
      <motion.div className="text-2xl font-semibold tabular-nums">{display}</motion.div>
    </div>
  );
}

/* ============ 5. METAS ============ */
function SectionMetas() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: STICKY_OFFSET });
  const reduced = useReducedMotion();
  const goals = [
    { label: "Seguro Vida", pct: 92, color: "#0094FF" },
    { label: "Consignado", pct: 68, color: "#1CD8CA" },
    { label: "Cartão Premium", pct: 47, color: "#936FFA" },
    { label: "Previdência", pct: 81, color: "#B794FF" },
  ];

  return (
    <section ref={ref} className={`relative ${SECTION_H}`}>
      <div className="sticky top-0 h-screen flex items-center">
        <div className="mx-auto max-w-6xl w-full px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 space-y-5">
              <div className="text-sm font-medium">Metas de novembro</div>
              {goals.map((g, i) => (
                <Goal key={g.label} g={g} index={i} progress={scrollYProgress} reduced={!!reduced} />
              ))}
            </div>
          </div>

          <div className="order-1 md:order-2">
            <SectionEyebrow icon={Target} label="Metas & progresso" />
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
              Cada produto,
              <br />
              <span className="bg-gradient-to-r from-[#1CD8CA] to-[#0094FF] bg-clip-text text-transparent">
                seu próprio alvo.
              </span>
            </h2>
            <p className="text-lg text-muted-foreground font-light">
              Defina metas por funcionário, agência ou time. A barra avança em
              tempo real conforme a produção é registrada.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Goal({ g, index, progress, reduced }: { g: { label: string; pct: number; color: string }; index: number; progress: MotionValue<number>; reduced: boolean }) {
  const start = index * 0.06;
  const end = 0.4 + index * 0.04;
  const pct = useTransform(progress, [start, end], reduced ? [g.pct, g.pct] : [0, g.pct]);
  const width = useTransform(pct, (v) => `${v}%`);
  const label = useTransform(pct, (v) => `${Math.round(v)}%`);
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-muted-foreground">{g.label}</span>
        <motion.span className="tabular-nums font-medium">{label}</motion.span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div style={{ width, background: g.color }} className="h-full rounded-full" />
      </div>
    </div>
  );
}

/* ============ 6. RANKING ============ */
function SectionRanking() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: STICKY_OFFSET });
  const reduced = useReducedMotion();
  const p1 = useTransform(scrollYProgress, [0.10, 0.55], reduced ? [1, 1] : [0, 1]);
  const p2 = useTransform(scrollYProgress, [0.05, 0.50], reduced ? [1, 1] : [0, 1]);
  const p3 = useTransform(scrollYProgress, [0.00, 0.45], reduced ? [1, 1] : [0, 1]);

  return (
    <section ref={ref} className={`relative ${SECTION_H}`}>
      <div className="sticky top-0 h-screen flex items-center">
        <div className="mx-auto max-w-6xl w-full px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <SectionEyebrow icon={Trophy} label="Ranking & gamificação" />
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
              Competição saudável,
              <br />
              <span className="bg-gradient-to-r from-[#936FFA] to-[#0094FF] bg-clip-text text-transparent">
                resultado coletivo.
              </span>
            </h2>
            <p className="text-lg text-muted-foreground font-light">
              Pontos calibrados de forma transparente, badges por conquistas e
              ranking mensal atualizado em tempo real.
            </p>
          </div>

          <div className="flex items-end justify-center gap-3 h-[280px]">
            <PodiumBar height={180} place={2} name="Marina" pts={4820} color="#1CD8CA" scaleY={p2} />
            <PodiumBar height={240} place={1} name="Ricardo" pts={5340} color="#0094FF" scaleY={p1} />
            <PodiumBar height={140} place={3} name="João" pts={4210} color="#936FFA" scaleY={p3} />
          </div>
        </div>
      </div>
    </section>
  );
}

function PodiumBar({ height, place, name, pts, color, scaleY }: { height: number; place: number; name: string; pts: number; color: string; scaleY: MotionValue<number> }) {
  return (
    <div className="flex flex-col items-center w-24">
      <div className="text-sm font-medium mb-1">{name}</div>
      <div className="text-xs text-muted-foreground mb-2 tabular-nums">{pts.toLocaleString("pt-BR")} pts</div>
      <motion.div style={{ height, background: color, scaleY, originY: 1 }} className="w-full rounded-t-lg flex items-start justify-center pt-2 will-change-transform">
        <span className="text-white font-semibold text-lg">{place}º</span>
      </motion.div>
    </div>
  );
}

/* ============ 7. CONQUISTAS / BADGES (refinado) ============ */
function SectionConquistas() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: STICKY_OFFSET });
  const reduced = useReducedMotion();

  const badges = [
    { Icon: Flame,   label: "Sequência 7 dias",     color: "#1CD8CA" },
    { Icon: Trophy,  label: "Top 3 do mês",          color: "#0094FF" },
    { Icon: Star,    label: "Melhor vendedor",       color: "#936FFA" },
    { Icon: Target,  label: "Meta alcançada",        color: "#0094FF" },
    { Icon: Medal,   label: "100 contratos",         color: "#1CD8CA" },
    { Icon: Rocket,  label: "Tu é bah!",             color: "#936FFA" },
  ];

  return (
    <section ref={ref} className={`relative ${SECTION_H}`}>
      <div className="sticky top-0 h-screen flex items-center">
        <div className="mx-auto max-w-6xl w-full px-6">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <SectionEyebrow icon={Award} label="Conquistas" />
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
              Cada marca,
              <br />
              <span className="bg-gradient-to-r from-[#936FFA] via-[#0094FF] to-[#1CD8CA] bg-clip-text text-transparent">
                um motivo a mais.
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground font-light">
              Badges automáticas que reconhecem consistência, volume e superação.
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-5 max-w-4xl mx-auto">
            {badges.map((b, i) => (
              <Badge key={b.label} b={b} index={i} progress={scrollYProgress} reduced={!!reduced} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Badge({ b, index, progress, reduced }: { b: { Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string; color: string }; index: number; progress: MotionValue<number>; reduced: boolean }) {
  const start = index * 0.06;
  const end = start + 0.18;
  const scale = useTransform(progress, [start, end], reduced ? [1, 1] : [0.5, 1]);
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const Icon = b.Icon;
  return (
    <motion.div initial={{ opacity: 0 }} style={{ scale, opacity }} className="flex flex-col items-center text-center will-change-transform">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-2"
        style={{
          background: "#0047AB",
          boxShadow: `0 10px 26px -8px ${b.color}66, inset 0 1px 0 rgba(255,255,255,0.14)`,
        }}
      >
        <Icon className="h-8 w-8" style={{ color: b.color }} />
      </div>
      <div className="text-xs text-muted-foreground leading-tight">{b.label}</div>
    </motion.div>
  );
}

/* ============ 8. RELATÓRIOS ============ */
function SectionRelatorios() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: STICKY_OFFSET });
  const reduced = useReducedMotion();
  const flip = useTransform(scrollYProgress, [0, 0.6], reduced ? [0, 0] : [12, -16]);
  const reveal = useTransform(scrollYProgress, [0.02, 0.55], reduced ? [1, 1] : [0, 1]);

  return (
    <section ref={ref} className={`relative ${SECTION_H}`}>
      <div className="sticky top-0 h-screen flex items-center">
        <div className="mx-auto max-w-6xl w-full px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div className="relative h-[380px] [perspective:1400px]">
            <motion.div style={{ rotateY: flip }} className="absolute inset-0 rounded-xl border border-border bg-card/90 backdrop-blur-sm shadow-2xl shadow-primary/20 overflow-hidden [transform-style:preserve-3d]">
              <div className="h-9 bg-[#0a1a2f] flex items-center px-4 gap-2">
                <Logo size={16} />
                <span className="text-white text-xs lowercase tracking-[0.048em]" style={{ fontFamily: "Poppins, sans-serif" }}>
                  banritools — relatório de produção
                </span>
              </div>
              <div className="p-5 space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <ReportRow key={i} index={i} reveal={reveal} />
                ))}
              </div>
            </motion.div>
          </motion.div>

          <div>
            <SectionEyebrow icon={FileText} label="Relatórios" />
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
              Exporta detalhado
              <br />
              ou resumido.
              <br />
              <span className="text-muted-foreground font-light">PDF e Excel.</span>
            </h2>
            <p className="text-lg text-muted-foreground font-light">
              Cabeçalho com a marca, números formatados em pt-BR e totais já calculados. Pronto para reunião.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReportRow({ index, reveal }: { index: number; reveal: MotionValue<number> }) {
  const w = useTransform(reveal, (v) => `${Math.min(100, v * 100) * ((60 + (index * 7) % 35) / 100)}%`);
  return (
    <div className="grid grid-cols-5 gap-2 text-[11px]">
      <motion.div className="h-3 bg-muted rounded col-span-2" style={{ width: w }} />
      <div className="h-3 bg-muted rounded" />
      <div className="h-3 bg-muted rounded" />
      <div className="h-3 bg-primary/40 rounded" />
    </div>
  );
}

/* ============ 9. CTA ============ */
function CtaFinal() {
  return (
    <section className="py-20 md:py-24 text-center">
      <div className="mx-auto max-w-3xl px-6">
        <Sparkles className="h-8 w-8 mx-auto text-primary mb-6" />
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">Bora começar?</h2>
        <p className="text-lg text-muted-foreground font-light mb-10">
          Acesse com seu e-mail corporativo ou use um convite recebido do seu gerente.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-[#1CD8CA] hover:text-white transition">
            Entrar no painel <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#top" className="inline-flex items-center px-6 py-3 rounded-full border border-border hover:bg-muted transition text-sm">
            Voltar ao topo
          </a>
        </div>
      </div>
      <footer className="mt-16 text-xs text-muted-foreground">
        © {new Date().getFullYear()} banritools — Ferramentas internas Banrisul.
      </footer>
    </section>
  );
}

export function Landing() {
  void LogoHexes;
  return (
    <div id="top" className="relative bg-background text-foreground min-h-screen overflow-hidden">
      <div className="ambient-glow" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="relative z-10">
        <TopBar />
        <Hero />
        <VideoMock />
        <SectionRegistro />
        <SectionPainel />
        <SectionMetas />
        <SectionRanking />
        <SectionConquistas />
        <SectionRelatorios />
        <CtaFinal />
      </div>
    </div>
  );
}
