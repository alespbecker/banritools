import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  ariaLabel?: string;
}

/**
 * Logotipo BanriTools — três hexágonos em formação honeycomb com 2px de
 * espaçamento entre eles. Cada hexágono é deslocado a partir do centro do
 * honeycomb (50, 53) no eixo radial: o de cima sobe 2, os de baixo afastam-se
 * 2 unidades nos eixos (-120°/-60°). Cantos arredondados via stroke-linejoin.
 */
export function Logo({ className, size = 32, ariaLabel = "BanriTools" }: LogoProps) {
  // Deltas radiais (2 unidades no viewBox 100):
  //  top   → (0, -2)
  //  left  → (-1.732, +1)
  //  right → (+1.732, +1)
  // Base honeycomb pointy-top, lado ~17, dx=14.72, dy=25.5.
  const topHex = "50,17 64.72,25.5 64.72,42.5 50,51 35.28,42.5 35.28,25.5";
  const leftHex = "33.548,45.5 48.268,54 48.268,71 33.548,79.5 18.828,71 18.828,54";
  const rightHex = "66.452,45.5 81.172,54 81.172,71 66.452,79.5 51.732,71 51.732,54";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label={ariaLabel}
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      style={{ strokeLinejoin: "round", strokeLinecap: "round" }}
    >
      <polygon fill="#0094FF" stroke="#0094FF" strokeWidth="2" points={topHex} />
      <polygon fill="#1CD8CA" stroke="#1CD8CA" strokeWidth="2" points={leftHex} />
      <polygon fill="#936FFA" stroke="#936FFA" strokeWidth="2" points={rightHex} />
    </svg>
  );
}

/**
 * Logo "explodível" — renderiza os três hexágonos como elementos separados,
 * cada um com sua própria transform. Usado na hero da landing para o efeito
 * de explosão controlado por scroll velocity.
 */
export function LogoHexes({ size = 120, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <HexPiece color="#0094FF" points="50,17 64.72,25.5 64.72,42.5 50,51 35.28,42.5 35.28,25.5" size={size} dataDir="top" />
      <HexPiece color="#1CD8CA" points="33.548,45.5 48.268,54 48.268,71 33.548,79.5 18.828,71 18.828,54" size={size} dataDir="left" />
      <HexPiece color="#936FFA" points="66.452,45.5 81.172,54 81.172,71 66.452,79.5 51.732,71 51.732,54" size={size} dataDir="right" />
    </div>
  );
}

function HexPiece({
  color,
  points,
  size,
  dataDir,
}: {
  color: string;
  points: string;
  size: number;
  dataDir: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      width={size}
      height={size}
      className="absolute inset-0 will-change-transform"
      data-hex={dataDir}
      style={{ strokeLinejoin: "round", strokeLinecap: "round" }}
    >
      <polygon fill={color} stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}
