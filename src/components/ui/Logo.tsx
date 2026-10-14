import {
  MONOGRAM_VIEWBOX,
  S_POINTS,
  WORDMARK_LETTERS,
  WORDMARK_LETTERS_TRANSFORM,
  WORDMARK_S_TRANSFORM,
  WORDMARK_VIEWBOX,
  X_POINTS,
} from "@/components/brand/geometry";

/** Monograma "SX" — usado em espaços reduzidos e no favicon. */
export function LogoSymbol({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox={MONOGRAM_VIEWBOX}
      fill="currentColor"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <polygon points={S_POINTS} />
      <polygon points={X_POINTS} />
    </svg>
  );
}

/** Logotipo "SERVIX". A cor segue `currentColor`. */
export function Logo({ className = "h-6 w-auto text-fg" }: { className?: string }) {
  return (
    <svg viewBox={WORDMARK_VIEWBOX} fill="currentColor" className={className} role="img" aria-label="Servix">
      <polygon points={S_POINTS} transform={WORDMARK_S_TRANSFORM} />
      <path d={WORDMARK_LETTERS} transform={WORDMARK_LETTERS_TRANSFORM} fillRule="evenodd" />
    </svg>
  );
}
