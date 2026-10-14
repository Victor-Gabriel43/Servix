import { buildScene, fitCamera, project, tileCorners, tilePose, type Projected } from "./stack-geometry";

/**
 * Versão estática (SVG) do elemento visual, renderizada no servidor.
 * Aparece imediatamente, funciona sem JavaScript e serve de fallback quando
 * o canvas não está disponível.
 */

const SIZE = 600;
const SLAB = 0.07;

function points(list: Projected[]) {
  return list.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

export function SystemStackFallback() {
  const scene = buildScene();
  const cam = fitCamera(SIZE, SIZE);

  const tiles = scene.tiles
    .map((tile) => {
      const pose = tilePose(tile, 1, 0);
      const top = tileCorners(pose.center, scene.tileHalf, 0, cam);
      const bottom = tileCorners({ ...pose.center, y: pose.center.y - SLAB }, scene.tileHalf, 0, cam);
      const depth = project(pose.center, cam).depth;
      return { tile, top, bottom, depth };
    })
    .sort((a, b) => a.tile.layer - b.tile.layer || b.depth - a.depth);

  const centers = scene.tiles.map((t) => project(t.target, cam));

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full" aria-hidden="true" focusable="false">
      {[0, 1, 2].map((layer) => (
        <g key={layer}>
          {scene.links
            .filter((l) => scene.tiles[l.from]!.layer === layer - 1)
            .map((l) => (
              <line
                key={`${l.from}-${l.to}`}
                x1={centers[l.from]!.x}
                y1={centers[l.from]!.y}
                x2={centers[l.to]!.x}
                y2={centers[l.to]!.y}
                stroke="rgb(66 217 255 / 0.32)"
                strokeWidth="1"
              />
            ))}
          {tiles
            .filter((t) => t.tile.layer === layer)
            .map(({ tile, top, bottom }) => (
              <g key={tile.id}>
                <polygon points={points(bottom)} fill="rgb(6 9 15 / 0.9)" />
                <polygon
                  points={points(top)}
                  fill={tile.accent ? "rgb(66 217 255 / 0.16)" : "rgb(20 28 42 / 0.82)"}
                  stroke={tile.accent ? "rgb(66 217 255 / 0.95)" : "rgb(160 168 184 / 0.3)"}
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </g>
            ))}
          {(() => {
            const corners = tiles.filter((t) => t.tile.layer === layer).flatMap((t) => t.top);
            const left = corners.reduce((a, b) => (b.x < a.x ? b : a));
            return (
              <g fill="rgb(160 168 184 / 0.85)" stroke="rgb(160 168 184 / 0.35)">
                <line x1={left.x - 10} y1={left.y} x2={left.x - 34} y2={left.y} />
                <text
                  x={left.x - 40}
                  y={left.y}
                  stroke="none"
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontFamily="var(--font-mono), monospace"
                  fontSize="12"
                >
                  {scene.layers[layer]!.label}
                </text>
              </g>
            );
          })()}
        </g>
      ))}
    </svg>
  );
}
