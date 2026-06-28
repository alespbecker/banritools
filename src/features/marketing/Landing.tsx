import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { Logo } from "@/components/Logo";
import { ArrowRight, BarChart3, Trophy, FileText, Sparkles, Zap } from "lucide-react";

/**
 * Landing pública estilo "AirPods Pro" — cada seção pinada com sticky,
 * animando elementos conforme o scroll. Sem dependências novas: usa
 * framer-motion (já no projeto) e respeita `prefers-reduced-motion`.
 */

function Wordmark({ size = 64, weight = 350 }: { size?: number; weight?: number }) {
  return (
    <span
      className="lowercase tracking-[0.048em]"
      style={{
        fontFamily: "Poppins, sans-serif",
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1,
        // Suaviza levemente os cantos da tipografia
        WebkitFontSmoothing: "antialiased",
        textRendering: "geometricPrecision",
      }}
    >
      banritools
    </span>
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
        <nav className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
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

/* ---------- 1. HERO ---------- */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const reduced = useReducedMotion();

  const scale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1, 1.8]);
  const rotate = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 60]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-[180vh]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        <motion.div
          style={{ scale, rotate, opacity }}
          className="will-change-transform"
        >
          <Logo size={120} />
        </motion.div>
        <motion.div
          style={{ opacity }}
          className="mt-3 flex flex-col items-center text-center px-6 max-w-3xl"
        >
          <Wordmark size={48} weight={350} />
          <p className="mt-16 text-xl md:text-2xl text-muted-foreground font-light">
            Sua produção, em tempo real.
            <br />
            <span className="text-foreground">A agência inteira, no mesmo painel.</span>
          </p>
          <div
            className="snake-border mt-12 inline-flex items-center gap-2 text-sm text-muted-foreground px-5 py-2 rounded-full"
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

/* ---------- 2. REGISTRO RÁPIDO ---------- */
function SectionRegistro() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const reduced = useReducedMotion();

  const x = useTransform(scrollYProgress, [0.2, 0.7], reduced ? [0, 0] : [120, 0]);
  const op = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  const qty = useTransform(scrollYProgress, [0.3, 0.9], [0, 27]);
  const pts = useTransform(scrollYProgress, [0.3, 0.9], [0, 1350]);

  return (
    <section ref={ref} className="relative h-[160vh] bg-gradient-to-b from-background to-muted/30">
      <div className="sticky top-0 h-screen flex items-center">
        <div className="mx-auto max-w-6xl w-full px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div style={{ opacity: op }}>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-wider mb-4">
              <Zap className="h-4 w-4" /> Registro rápido
            </div>
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

          <motion.div style={{ x }} className="will-change-transform">
            <MockRegistro qty={qty} pts={pts} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function MockRegistro({ qty, pts }: { qty: MotionValue<number>; pts: MotionValue<number> }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10 p-5 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-medium">Seguro Vida</div>
          <div className="text-xs text-muted-foreground">Seguros · 50 pts/unidade</div>
        </div>
        <span className="text-xs font-medium text-success">+<MotionInt value={pts} /> pts</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Quantidade</div>
          <div className="h-10 rounded-md border border-primary/40 bg-primary/5 flex items-center px-3 font-medium tabular-nums">
            <MotionInt value={qty} />
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Valor (R$)</div>
          <div className="h-10 rounded-md border border-border bg-background flex items-center px-3 text-muted-foreground">—</div>
        </div>
      </div>
      <button className="mt-4 w-full h-10 rounded-md bg-primary text-primary-foreground font-medium text-sm">
        Salvar produção
      </button>
    </div>
  );
}

function MotionInt({ value }: { value: MotionValue<number> }) {
  const display = useTransform(value, (v) => Math.round(v).toLocaleString("pt-BR"));
  return <motion.span>{display}</motion.span>;
}

/* ---------- 3. PAINEL DA AGÊNCIA ---------- */
function SectionPainel() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const reduced = useReducedMotion();

  const k1 = useTransform(scrollYProgress, [0.2, 0.5], [0, 847]);
  const k2 = useTransform(scrollYProgress, [0.25, 0.55], [0, 2_341_900]);
  const k3 = useTransform(scrollYProgress, [0.3, 0.6], [0, 12]);
  const k4 = useTransform(scrollYProgress, [0.35, 0.65], [0, 36_540]);
  const draw = useTransform(scrollYProgress, [0.3, 0.8], reduced ? [1, 1] : [0, 1]);

  return (
    <section ref={ref} className="relative h-[180vh]">
      <div className="sticky top-0 h-screen flex items-center">
        <div className="mx-auto max-w-6xl w-full px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-wider mb-3">
              <BarChart3 className="h-4 w-4" /> Painel da agência
            </div>
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

          <div className="rounded-2xl border border-border bg-card p-6">
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
                    style={{ scaleY: draw, originY: "160px" }}
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
          </div>
        </div>
      </div>
    </section>
  );
}

function Kpi({ label, value, fmt }: { label: string; value: MotionValue<number>; fmt: (n: number) => string }) {
  const display = useTransform(value, (v) => fmt(Math.round(v)));
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
      <motion.div className="text-2xl font-semibold tabular-nums">{display}</motion.div>
    </div>
  );
}

/* ---------- 4. RANKING ---------- */
function SectionRanking() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const reduced = useReducedMotion();

  const p1 = useTransform(scrollYProgress, [0.30, 0.70], reduced ? [1, 1] : [0, 1]);
  const p2 = useTransform(scrollYProgress, [0.25, 0.65], reduced ? [1, 1] : [0, 1]);
  const p3 = useTransform(scrollYProgress, [0.20, 0.60], reduced ? [1, 1] : [0, 1]);

  return (
    <section ref={ref} className="relative h-[160vh] bg-gradient-to-b from-muted/30 to-background">
      <div className="sticky top-0 h-screen flex items-center">
        <div className="mx-auto max-w-6xl w-full px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-wider mb-4">
              <Trophy className="h-4 w-4" /> Ranking & gamificação
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
              Competição saudável,
              <br />
              <span className="bg-gradient-to-r from-[#936FFA] to-[#0094FF] bg-clip-text text-transparent">
                resultado coletivo.
              </span>
            </h2>
            <p className="text-lg text-muted-foreground font-light">
              Pontos por produto calibrados de forma transparente, badges por conquistas
              e ranking mensal atualizado em tempo real.
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

function PodiumBar({
  height, place, name, pts, color, scaleY,
}: { height: number; place: number; name: string; pts: number; color: string; scaleY: MotionValue<number> }) {
  return (
    <div className="flex flex-col items-center w-24">
      <div className="text-sm font-medium mb-1">{name}</div>
      <div className="text-xs text-muted-foreground mb-2 tabular-nums">{pts.toLocaleString("pt-BR")} pts</div>
      <motion.div
        style={{ height, background: color, scaleY, originY: 1 }}
        className="w-full rounded-t-lg flex items-start justify-center pt-2 will-change-transform"
      >
        <span className="text-white font-semibold text-lg">{place}º</span>
      </motion.div>
    </div>
  );
}

/* ---------- 5. RELATÓRIOS ---------- */
function SectionRelatorios() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const reduced = useReducedMotion();
  const flip = useTransform(scrollYProgress, [0.2, 0.8], reduced ? [0, 0] : [0, -25]);

  return (
    <section ref={ref} className="relative h-[140vh]">
      <div className="sticky top-0 h-screen flex items-center">
        <div className="mx-auto max-w-6xl w-full px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div className="relative h-[360px] [perspective:1200px]">
            <motion.div
              style={{ rotateY: flip }}
              className="absolute inset-0 rounded-xl border border-border bg-card shadow-2xl overflow-hidden [transform-style:preserve-3d]"
            >
              <div className="h-9 bg-[#0a1a2f] flex items-center px-4 gap-2">
                <Logo size={16} />
                <span className="text-white text-xs lowercase tracking-[0.048em]" style={{ fontFamily: "Poppins, sans-serif" }}>
                  banritools — relatório de produção
                </span>
              </div>
              <div className="p-5 space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-5 gap-2 text-[11px]">
                    <div className="h-3 bg-muted rounded col-span-2" style={{ width: `${60 + (i * 7) % 35}%` }} />
                    <div className="h-3 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded" />
                    <div className="h-3 bg-primary/40 rounded" />
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-wider mb-4">
              <FileText className="h-4 w-4" /> Relatórios
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
              Exporta detalhado
              <br />
              ou resumido.
              <br />
              <span className="text-muted-foreground font-light">PDF e Excel.</span>
            </h2>
            <p className="text-lg text-muted-foreground font-light">
              Cabeçalho com a marca, números formatados em pt-BR e totais já calculados.
              Pronto para reunião.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 6. CTA ---------- */
function CtaFinal() {
  return (
    <section className="py-24 md:py-32 text-center">
      <div className="mx-auto max-w-3xl px-6">
        <Sparkles className="h-8 w-8 mx-auto text-primary mb-6" />
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
          Bora começar?
        </h2>
        <p className="text-lg text-muted-foreground font-light mb-10">
          Acesse com seu e-mail corporativo ou use um convite recebido do seu gerente.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-[#1CD8CA] hover:text-white transition"
          >
            Entrar no painel <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#top"
            className="inline-flex items-center px-6 py-3 rounded-full border border-border hover:bg-muted transition text-sm"
          >
            Voltar ao topo
          </a>
        </div>
      </div>
      <footer className="mt-24 text-xs text-muted-foreground">
        © {new Date().getFullYear()} banritools — Ferramentas internas Banrisul.
      </footer>
    </section>
  );
}

export function Landing() {
  return (
    <div id="top" className="bg-background text-foreground min-h-screen">
      <TopBar />
      <Hero />
      <SectionRegistro />
      <SectionPainel />
      <SectionRanking />
      <SectionRelatorios />
      <CtaFinal />
    </div>
  );
}
