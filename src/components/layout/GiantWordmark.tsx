import {
  S_POINTS,
  WORDMARK_LETTERS,
  WORDMARK_LETTERS_TRANSFORM,
  WORDMARK_S_TRANSFORM,
  WORDMARK_VIEWBOX,
} from "@/components/brand/geometry";

function Shapes() {
  return (
    <>
      <polygon points={S_POINTS} transform={WORDMARK_S_TRANSFORM} />
      <path d={WORDMARK_LETTERS} transform={WORDMARK_LETTERS_TRANSFORM} fillRule="evenodd" />
    </>
  );
}

/**
 * Logotipo SERVIX gigante, só em contorno, cortado pela borda inferior.
 * Uma luz acompanha o cursor (variáveis --mx/--my do PointerSpotlight) e,
 * sem cursor, uma varredura lenta em CSS ilumina o contorno.
 */
export function GiantWordmark() {
  return (
    <div aria-hidden="true" className="spotlight wordmark relative -mb-[9%] select-none overflow-hidden">
      <svg viewBox={WORDMARK_VIEWBOX} className="block w-full" fill="none">
        <g stroke="rgb(255 255 255 / 0.14)" strokeWidth="1.2" fill="rgb(255 255 255 / 0.02)">
          <Shapes />
        </g>
      </svg>
      <svg viewBox={WORDMARK_VIEWBOX} className="wordmark-sweep absolute inset-0 block w-full" fill="none">
        <g stroke="rgb(255 255 255 / 0.35)" strokeWidth="1.2">
          <Shapes />
        </g>
      </svg>
      <svg viewBox={WORDMARK_VIEWBOX} className="wordmark-glow absolute inset-0 block w-full" fill="none">
        <g stroke="rgb(66 217 255 / 0.25)" strokeWidth="5">
          <Shapes />
        </g>
        <g stroke="rgb(255 255 255 / 0.9)" strokeWidth="1.2" fill="rgb(255 255 255 / 0.03)">
          <Shapes />
        </g>
      </svg>
    </div>
  );
}
