import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  motion,
  useReducedMotion,
  useInView,
} from "framer-motion";
import { RoamingHexes } from "@/features/marketing/RoamingHexes";
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
 * Landing pública — Hero pinado com scrub (assinatura da página) e demais
 * seções com animações `whileInView` (disparam 1× ao entrar). Sem sticky
 * curto que causava "estalos". Respeita `useReducedMotion` em tudo.
 */

const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const IN_VIEW = { once: true, margin: "-15% 0px" } as const;

/* ============ TOP BAR + tema ============ */
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bt_theme_nudge");
      const parsed = raw ? JSON.parse(raw) as { shows?: number; done?: boolean } : {};
      if (parsed.done) return;
      const shows = (parsed.shows ?? 0) + 1;
      if (shows > 2) {
        localStorage.setItem("bt_theme_nudge", JSON.stringify({ shows, done: true }));
        return;
      }
      localStorage.setItem("bt_theme_nudge", JSON.stringify({ shows, done: false }));
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 12000);
      return () => clearTimeout(t);
    } catch { /* ignore */ }
  }, []);

  const handleClick = () => {
    try {
      localStorage.setItem("bt_theme_nudge", JSON.stringify({ shows: 99, done: true }));
    } catch { /* ignore */ }
    setPulse(false);
    toggleTheme();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
      className={`h-8 w-8 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition ${pulse ? "fab-radar" : ""}`}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-background/60 border-b border-border/40">
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
            to="/primeiro-acesso"
            className="text-sm font-medium px-4 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-[#0077DB] hover:text-white transition"
          >
            Primeiro acesso
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

/* ============ 1. HERO — logotipo rota, wordmark em roleta ============ */
function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center justify-center w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.25, filter: "blur(12px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <motion.div
            animate={reduced ? undefined : { rotate: 360 }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
            className="will-change-transform"
          >
            <div className="relative" style={{ width: 120, height: 120 }}>
              <HexOnly color="#0094FF" points="50,17 64.72,25.5 64.72,42.5 50,51 35.28,42.5 35.28,25.5" />
              <div className="absolute inset-0">
                <HexOnly color="#1CD8CA" points="33.548,45.5 48.268,54 48.268,71 33.548,79.5 18.828,71 18.828,54" />
              </div>
              <div className="absolute inset-0">
                <HexOnly color="#936FFA" points="66.452,45.5 81.172,54 81.172,71 66.452,79.5 51.732,71 51.732,54" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="mt-3 flex flex-col items-center text-center px-6 max-w-3xl"
        >
          <SlotWordmark />
          <p className="mt-10 text-sm md:text-base font-light max-w-xl" style={{ color: "#C5CCDA" }}>
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
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      style={{
        strokeLinejoin: "round",
        strokeLinecap: "round",
      }}
    >
      <polygon fill={color} stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}

/** Wordmark estático "banritools" em Poppins. */
function SlotWordmark() {
  return (
    <span
      className="inline-block lowercase"
      style={{
        fontFamily: "Poppins, sans-serif",
        fontWeight: 500,
        fontSize: 48,
        lineHeight: 1,
        letterSpacing: "0.048em",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      banritools
    </span>
  );
}


/* ============ 2. VIDEO MOCK do Painel da Agência ============ */
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

  const cursorPath = reduced
    ? [{ x: 50, y: 50, t: 0 }]
    : [
        { x: 8, y: 18, t: 0 },
        { x: 22, y: 38, t: 1.2 },
        { x: 46, y: 38, t: 2.4 },
        { x: 70, y: 38, t: 3.6 },
        { x: 60, y: 72, t: 5.0 },
        { x: 30, y: 80, t: 6.2 },
      ];

  return (
    <section ref={ref} className="relative">
      <div className="mx-auto max-w-6xl px-6 -mt-8 md:-mt-12 mb-8">
        <div
          className="relative rounded-2xl border border-border bg-card/70 backdrop-blur-sm overflow-hidden shadow-2xl shadow-primary/10"
          style={{
            aspectRatio: "16/9",
            WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 70%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, #000 0%, #000 70%, transparent 100%)",
          }}
        >
          <div className="absolute inset-x-0 top-0 h-9 bg-background/80 border-b border-border/50 flex items-center gap-2 px-4">
            <Logo size={14} />
            <span className="text-[11px] lowercase tracking-[0.048em] text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>
              banritools — painel da agência
            </span>
          </div>

          <div className="absolute inset-0 pt-12 px-6 pb-8 grid grid-rows-[auto_1fr] gap-4">
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
              className="absolute will-change-transform z-20 hidden md:block"
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

/* ============ Section wrapper (whileInView + stagger) ============ */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_STANDARD } },
};

function InViewSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      className={`relative py-24 md:py-32 ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={IN_VIEW}
    >
      {children}
    </motion.section>
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
  return (
    <InViewSection>
      <div className="mx-auto max-w-6xl w-full px-6 grid md:grid-cols-2 gap-12 items-center">
        <motion.div variants={itemVariants}>
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
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.18 } } }}
          className="relative h-[420px]"
        >
          {MOCK_PRODUCTS.map((p, i) => (
            <RegistroCard key={p.name} product={p} index={i} />
          ))}
        </motion.div>
      </div>
    </InViewSection>
  );
}

function RegistroCard({ product, index }: { product: (typeof MOCK_PRODUCTS)[number]; index: number }) {
  const reduced = useReducedMotion();
  const top = 30 + index * 18;
  const z = MOCK_PRODUCTS.length - index;
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: reduced ? 0 : 96 },
        visible: { opacity: 1, x: 0, transition: { duration: reduced ? 0 : 0.55, ease: EASE_STANDARD } },
      }}
      style={{ top: `${top}px`, zIndex: z }}
      className="absolute left-0 right-0 will-change-transform"
    >
      <MockRegistro product={product} />
    </motion.div>
  );
}

function MockRegistro({ product }: { product: (typeof MOCK_PRODUCTS)[number] }) {
  return (
    <div
      className="rounded-2xl border bg-card/80 backdrop-blur-sm shadow-2xl p-5 max-w-md mx-auto"
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
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduced = useReducedMotion();

  return (
    <motion.section
      ref={ref}
      className="relative py-24 md:py-32"
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={IN_VIEW}
    >
      <div className="mx-auto max-w-6xl w-full px-6">
        <motion.div variants={itemVariants} className="text-center mb-10">
          <SectionEyebrow icon={BarChart3} label="Painel da agência" />
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Tudo o que o gerente precisa,
            <br />
            <span className="text-muted-foreground font-light">em uma única tela.</span>
          </h2>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KpiInView active={inView} reduced={!!reduced} label="Produtos vendidos" target={847} fmt={(n) => n.toLocaleString("pt-BR")} />
          <KpiInView active={inView} reduced={!!reduced} label="Volume contratado" target={2_341_900} fmt={(n) => `R$ ${(n / 1000).toFixed(0)}k`} />
          <KpiInView active={inView} reduced={!!reduced} label="Funcionários ativos" target={12} fmt={(n) => n.toLocaleString("pt-BR")} />
          <KpiInView active={inView} reduced={!!reduced} label="Pontos do mês" target={36_540} fmt={(n) => n.toLocaleString("pt-BR")} />
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6">
          <div className="text-sm font-medium mb-4">Top 10 — Produção (pts)</div>
          <svg viewBox="0 0 600 180" className="w-full h-44">
            {[8400, 7200, 6850, 5900, 5400, 4900, 4200, 3700, 3100, 2600].map((v, i) => {
              const h = (v / 8400) * 140;
              return (
                <motion.rect
                  key={i}
                  x={20 + i * 58}
                  y={160 - h}
                  width={40}
                  height={h}
                  rx={4}
                  fill="url(#g)"
                  initial={{ scaleY: reduced ? 1 : 0 }}
                  animate={inView ? { scaleY: 1 } : { scaleY: reduced ? 1 : 0 }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.05, ease: EASE_STANDARD }}
                  style={{ originY: "160px", transformBox: "fill-box" as never }}
                />
              );
            })}
            <defs>
              <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#0094FF" />
                <stop offset="100%" stopColor="#1CD8CA" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </div>
    </motion.section>
  );
}

function KpiInView({ active, reduced, label, target, fmt }: { active: boolean; reduced: boolean; label: string; target: number; fmt: (n: number) => string }) {
  const [value, setValue] = useState(reduced ? target : 0);
  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const dur = 900;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced, target]);
  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4">
      <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
      <div className="text-2xl font-semibold tabular-nums">{fmt(Math.round(value))}</div>
    </div>
  );
}

/* ============ 5. METAS ============ */
function SectionMetas() {
  const reduced = useReducedMotion();
  const goals = [
    { label: "Seguro Vida", pct: 92, color: "#0094FF" },
    { label: "Consignado", pct: 68, color: "#1CD8CA" },
    { label: "Cartão Premium", pct: 47, color: "#936FFA" },
    { label: "Previdência", pct: 81, color: "#B794FF" },
  ];

  return (
    <InViewSection>
      <div className="mx-auto max-w-6xl w-full px-6 grid md:grid-cols-2 gap-12 items-center">
        <motion.div variants={itemVariants} className="order-2 md:order-1">
          <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 space-y-5">
            <div className="text-sm font-medium">Metas do mês</div>
            {goals.map((g, i) => (
              <Goal key={g.label} g={g} index={i} reduced={!!reduced} />
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="order-1 md:order-2">
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
        </motion.div>
      </div>
    </InViewSection>
  );
}

function Goal({ g, index, reduced }: { g: { label: string; pct: number; color: string }; index: number; reduced: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-muted-foreground">{g.label}</span>
        <span className="tabular-nums font-medium">{g.pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: reduced ? `${g.pct}%` : 0 }}
          whileInView={{ width: `${g.pct}%` }}
          viewport={IN_VIEW}
          transition={{ duration: 0.8, delay: 0.1 + index * 0.08, ease: EASE_STANDARD }}
          style={{ background: g.color }}
          className="h-full rounded-full"
        />
      </div>
    </div>
  );
}

/* ============ 6. RANKING ============ */
function SectionRanking() {
  const reduced = useReducedMotion();
  return (
    <InViewSection>
      <div className="mx-auto max-w-6xl w-full px-6 grid md:grid-cols-2 gap-12 items-center">
        <motion.div variants={itemVariants}>
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
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-end justify-center gap-3 h-[280px]">
          <PodiumBar height={180} place={2} name="Marina" pts={4820} color="#1CD8CA" delay={0.1} reduced={!!reduced} />
          <PodiumBar height={240} place={1} name="Ricardo" pts={5340} color="#0094FF" delay={0.25} reduced={!!reduced} />
          <PodiumBar height={140} place={3} name="João" pts={4210} color="#936FFA" delay={0} reduced={!!reduced} />
        </motion.div>
      </div>
    </InViewSection>
  );
}

function PodiumBar({ height, place, name, pts, color, delay, reduced }: { height: number; place: number; name: string; pts: number; color: string; delay: number; reduced: boolean }) {
  return (
    <div className="flex flex-col items-center w-24">
      <div className="text-sm font-medium mb-1">{name}</div>
      <div className="text-xs text-muted-foreground mb-2 tabular-nums">{pts.toLocaleString("pt-BR")} pts</div>
      {/* Container de altura fixa; a barra interna cresce por `height`. Número
          fica sobreposto e absoluto, imune à animação (não distorce). */}
      <div className="relative w-full" style={{ height }}>
        <motion.div
          initial={{ height: reduced ? height : 0 }}
          whileInView={{ height }}
          viewport={IN_VIEW}
          transition={{ duration: 0.8, delay, ease: EASE_STANDARD }}
          style={{ background: color }}
          className="absolute bottom-0 left-0 right-0 rounded-t-lg will-change-[height]"
        />
        <span className="absolute top-2 left-0 right-0 text-center text-white font-semibold text-lg pointer-events-none">
          {place}º
        </span>
      </div>
    </div>
  );
}

/* ============ 7. CONQUISTAS / BADGES ============ */
function SectionConquistas() {
  const badges = [
    { Icon: Flame,   label: "Sequência 7 dias",     color: "#1CD8CA" },
    { Icon: Trophy,  label: "Top 3 do mês",          color: "#0094FF" },
    { Icon: Star,    label: "Melhor vendedor",       color: "#936FFA" },
    { Icon: Target,  label: "Meta alcançada",        color: "#0094FF" },
    { Icon: Medal,   label: "100 contratos",         color: "#1CD8CA" },
    { Icon: Rocket,  label: "Tu é bah!",             color: "#936FFA" },
  ];

  return (
    <InViewSection>
      <div className="mx-auto max-w-6xl w-full px-6">
        <motion.div variants={itemVariants} className="text-center mb-10 max-w-2xl mx-auto">
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
        </motion.div>

        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-3 md:grid-cols-6 gap-5 max-w-4xl mx-auto"
        >
          {badges.map((b) => (
            <Badge key={b.label} b={b} />
          ))}
        </motion.div>
      </div>
    </InViewSection>
  );
}

function Badge({ b }: { b: { Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string; color: string } }) {
  const Icon = b.Icon;
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.85 },
        show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE_STANDARD } },
      }}
      className="flex flex-col items-center text-center will-change-transform"
    >
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
  const reduced = useReducedMotion();
  return (
    <InViewSection>
      <div className="mx-auto max-w-6xl w-full px-6 grid md:grid-cols-2 gap-12 items-center">
        <motion.div variants={itemVariants} className="relative h-[380px] [perspective:1400px]">
          <motion.div
            initial={{ rotateY: reduced ? 0 : 12 }}
            whileInView={{ rotateY: reduced ? 0 : -6 }}
            viewport={IN_VIEW}
            transition={{ duration: 1.1, ease: EASE_STANDARD }}
            className="absolute inset-0 rounded-xl border border-border bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/20 overflow-hidden [transform-style:preserve-3d]"
          >
            <div className="h-9 bg-[#0a1a2f] flex items-center px-4 gap-2">
              <Logo size={16} />
              <span className="text-white text-xs lowercase tracking-[0.048em]" style={{ fontFamily: "Poppins, sans-serif" }}>
                banritools — relatório de produção
              </span>
            </div>
            <div className="p-5 space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <ReportRow key={i} index={i} reduced={!!reduced} />
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
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
        </motion.div>
      </div>
    </InViewSection>
  );
}

function ReportRow({ index, reduced }: { index: number; reduced: boolean }) {
  const targetPct = (60 + (index * 7) % 35);
  return (
    <div className="grid grid-cols-5 gap-2 text-[11px]">
      <motion.div
        className="h-3 bg-muted rounded col-span-2"
        initial={{ width: reduced ? `${targetPct}%` : 0 }}
        whileInView={{ width: `${targetPct}%` }}
        viewport={IN_VIEW}
        transition={{ duration: 0.6, delay: 0.1 + index * 0.04, ease: EASE_STANDARD }}
      />
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
          <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-[#0077DB] hover:text-white transition">
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
    <div id="top" className="relative bg-background text-foreground min-h-screen overflow-x-clip">
      <div className="ambient-glow" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <RoamingHexes />
      <div className="landing-noise" aria-hidden="true" />
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
