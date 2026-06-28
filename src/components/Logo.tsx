import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  ariaLabel?: string;
}

/**
 * Logotipo BanriTools — três hexágonos em formação honeycomb perfeita.
 * Espaçamento equidistante entre o hexágono superior e os dois inferiores.
 * Cantos suavemente arredondados via stroke-linejoin="round".
 */
export function Logo({ className, size = 32, ariaLabel = "BanriTools" }: LogoProps) {
  // Hex pointy-top: width 29.44, height 34. Honeycomb: dx=14.72, dy=25.5.
  // Centros: topo (50, 36) · esq (35.28, 61.5) · dir (64.72, 61.5)
  const topHex = "50,19 64.72,27.5 64.72,44.5 50,53 35.28,44.5 35.28,27.5";
  const leftHex = "35.28,44.5 50,53 50,70 35.28,78.5 20.56,70 20.56,53";
  const rightHex = "64.72,44.5 79.44,53 79.44,70 64.72,78.5 50,70 50,53";

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
