import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  ariaLabel?: string;
}

/**
 * Logotipo vetorial do BanriTools — três hexágonos interligados
 * representando colaboração, inovação e resultados.
 */
export function Logo({ className, size = 32, ariaLabel = "BanriTools" }: LogoProps) {
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
    >
      <polygon
        fill="#0094FF"
        points="50,19 64.72,27.5 64.72,44.5 50,53 35.28,44.5 35.28,27.5"
      />
      <polygon
        fill="#1CD8CA"
        points="33,47 47.72,55.5 47.72,72.5 33,81 18.28,72.5 18.28,55.5"
      />
      <polygon
        fill="#936FFA"
        points="67,47 81.72,55.5 81.72,72.5 67,81 52.28,72.5 52.28,55.5"
      />
    </svg>
  );
}
