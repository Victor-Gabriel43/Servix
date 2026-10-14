import { computeMarkFrame, fitMarkCamera, shadeToGray } from "./brand-mark-geometry";
import type { Projected } from "./stack-geometry";

const SIZE = 600;

const points = (list: Projected[]) => list.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

/**
 * Versão estática (SVG) da marca 3D, gerada no servidor com a mesma geometria.
 * O pulso ciano do contorno é animado só com CSS (funciona sem JavaScript).
 */
export function BrandMarkFallback({ id = "mark" }: { id?: string }) {
  const frame = computeMarkFrame(fitMarkCamera(SIZE, SIZE));
  const cap = points(frame.cap.points);
  const s = frame.sheen;

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-cap`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#25252a" />
          <stop offset={Math.max(0, s - 0.18)} stopColor="#111113" />
          <stop offset={s} stopColor="#4a4a50" />
          <stop offset={Math.min(1, s + 0.18)} stopColor="#111113" />
          <stop offset="1" stopColor="#09090a" />
        </linearGradient>
        <radialGradient id={`${id}-floor`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.07" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={SIZE / 2} cy={SIZE * 0.85} rx={SIZE * 0.36} ry={SIZE * 0.05} fill={`url(#${id}-floor)`} />
      {frame.sides.map((side, i) => {
        const color = shadeToGray(side.shade);
        return <polygon key={i} points={points(side.points)} fill={color} stroke={color} strokeWidth="0.75" />;
      })}
      <polygon points={cap} fill={`url(#${id}-cap)`} stroke="rgb(255 255 255 / 0.5)" strokeWidth="1" strokeLinejoin="round" />
      <polygon
        points={cap}
        pathLength={100}
        fill="none"
        stroke="rgb(150 236 255 / 0.95)"
        strokeWidth="1.5"
        strokeDasharray="14 86"
        className="mark-trace"
      />
    </svg>
  );
}
