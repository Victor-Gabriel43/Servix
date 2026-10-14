/**
 * Geometria do elemento visual da Servix: "camadas de um sistema".
 *
 * Três planos modulares — dados, processos e interface — representam como
 * informações dispersas de um negócio são organizadas em um sistema.
 * Módulos chegam dispersos e se encaixam; conexões verticais levam pulsos
 * de dados de uma camada para a outra.
 *
 * Este arquivo é puro (sem DOM): usado pelo canvas animado no navegador e
 * pelo SVG estático renderizado no servidor, garantindo a mesma composição.
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Tile {
  id: number;
  layer: number;
  /** Posição final (encaixada). */
  target: Vec3;
  /** Deslocamento de origem, antes de encaixar. */
  scatter: Vec3;
  /** Rotação inicial do módulo no plano (radianos). */
  spin: number;
  /** Atraso relativo de entrada, 0–1. */
  delay: number;
  /** Módulo de destaque (realçado em ciano). */
  accent: boolean;
}

export interface Link {
  from: number;
  to: number;
  /** Fase do pulso, 0–1. */
  phase: number;
}

export interface Layer {
  y: number;
  label: string;
}

export interface Scene {
  tiles: Tile[];
  links: Link[];
  layers: Layer[];
  tileHalf: number;
}

export const LAYERS: Layer[] = [
  { y: -1.6, label: "dados" },
  { y: 0, label: "processos" },
  { y: 1.6, label: "interface" },
];

/* Máscaras 4×4 de cada camada (1 = módulo presente, 2 = módulo de destaque). */
const MASKS: number[][][] = [
  [
    [1, 1, 1, 1],
    [1, 1, 2, 1],
    [1, 1, 1, 1],
    [0, 1, 1, 1],
  ],
  [
    [0, 1, 1, 0],
    [1, 2, 1, 1],
    [1, 1, 0, 1],
    [0, 1, 1, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 1, 2, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
];

/** PRNG determinístico (mulberry32), para SSR e cliente gerarem a mesma cena. */
function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildScene(seed = 7): Scene {
  const rand = random(seed);
  const tiles: Tile[] = [];
  const grid = new Map<string, number>();
  const spacing = 1;
  const offset = 1.5;

  MASKS.forEach((mask, layer) => {
    mask.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (!cell) return;
        const id = tiles.length;
        const angle = rand() * Math.PI * 2;
        const distance = 2.4 + rand() * 2.2;
        tiles.push({
          id,
          layer,
          target: { x: (c - offset) * spacing, y: LAYERS[layer]!.y, z: (r - offset) * spacing },
          scatter: {
            x: Math.cos(angle) * distance,
            y: (rand() - 0.5) * 3.2,
            z: Math.sin(angle) * distance,
          },
          spin: (rand() - 0.5) * Math.PI,
          delay: layer * 0.18 + rand() * 0.35,
          accent: cell === 2,
        });
        grid.set(`${layer}:${r}:${c}`, id);
      });
    });
  });

  // Conexões verticais entre módulos alinhados de camadas vizinhas.
  const links: Link[] = [];
  for (let layer = 0; layer < MASKS.length - 1; layer++) {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const from = grid.get(`${layer}:${r}:${c}`);
        const to = grid.get(`${layer + 1}:${r}:${c}`);
        if (from === undefined || to === undefined) continue;
        if (rand() < 0.62) links.push({ from, to, phase: rand() });
      }
    }
  }

  return { tiles, links, layers: LAYERS, tileHalf: 0.4 };
}

/* ───────────── Animação ───────────── */

export function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function clamp01(t: number) {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/** Progresso de encaixe de um módulo, dado o progresso global (0–1). */
export function tileProgress(tile: Tile, assembly: number) {
  const span = 0.55;
  return easeOutCubic(clamp01((assembly - tile.delay * (1 - span)) / span));
}

/** Posição e rotação do módulo em um instante. */
export function tilePose(tile: Tile, assembly: number, time: number) {
  const p = tileProgress(tile, assembly);
  const float = Math.sin(time * 0.7 + tile.layer * 1.3) * 0.035 * p;
  return {
    progress: p,
    spin: tile.spin * (1 - p),
    center: {
      x: tile.target.x + tile.scatter.x * (1 - p),
      y: tile.target.y + tile.scatter.y * (1 - p) + float,
      z: tile.target.z + tile.scatter.z * (1 - p),
    },
  };
}

/* ───────────── Projeção ───────────── */

export interface Camera {
  yaw: number;
  pitch: number;
  /** Distância da câmera à origem. */
  distance: number;
  /** Escala em pixels por unidade de mundo. */
  scale: number;
  cx: number;
  cy: number;
}

export interface Projected {
  x: number;
  y: number;
  /** Profundidade (maior = mais distante). */
  depth: number;
  /** Fator de perspectiva. */
  k: number;
}

export function project(p: Vec3, cam: Camera): Projected {
  const cy = Math.cos(cam.yaw);
  const sy = Math.sin(cam.yaw);
  const x1 = p.x * cy - p.z * sy;
  const z1 = p.x * sy + p.z * cy;

  const cp = Math.cos(cam.pitch);
  const sp = Math.sin(cam.pitch);
  const y2 = p.y * cp - z1 * sp;
  const z2 = p.y * sp + z1 * cp;

  const k = cam.distance / (cam.distance + z2);
  return { x: cam.cx + x1 * cam.scale * k, y: cam.cy - y2 * cam.scale * k, depth: z2, k };
}

/** Quatro cantos de um módulo (quadrado no plano XZ), já projetados. */
export function tileCorners(center: Vec3, half: number, spin: number, cam: Camera): Projected[] {
  const c = Math.cos(spin);
  const s = Math.sin(spin);
  const corners: [number, number][] = [
    [-half, -half],
    [half, -half],
    [half, half],
    [-half, half],
  ];
  return corners.map(([dx, dz]) =>
    project({ x: center.x + dx * c - dz * s, y: center.y, z: center.z + dx * s + dz * c }, cam),
  );
}

/** Câmera em repouso, usada no SVG estático e com movimento reduzido. */
export const REST_YAW = -0.62;
export const REST_PITCH = -0.4;

/** Espaço reservado à esquerda para os rótulos das camadas (px). */
export const LABEL_SPACE = 104;

/**
 * Enquadra a estrutura (≈ 4,8 × 4,8 unidades na câmera em repouso) no espaço
 * disponível, reservando a faixa esquerda para os rótulos.
 */
export function fitCamera(width: number, height: number, yaw = REST_YAW, pitch = REST_PITCH): Camera {
  const usable = Math.max(width - LABEL_SPACE, width * 0.6);
  const scale = Math.min(usable / 5, height / 5.1);
  return {
    yaw,
    pitch,
    distance: 9,
    scale,
    cx: width - usable + usable / 2,
    cy: height / 2,
  };
}
