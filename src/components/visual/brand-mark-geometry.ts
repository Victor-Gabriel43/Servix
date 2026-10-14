/**
 * "S" da marca Servix extrudado em 3D, com acabamento de cromo negro.
 *
 * Puro (sem DOM): calcula, para uma câmera, as faces visíveis já projetadas,
 * na ordem de desenho e com a iluminação resolvida. Usado pelo canvas animado
 * e pelo SVG estático renderizado no servidor.
 */

import { S_POINTS } from "@/components/brand/geometry";
import { project, type Camera, type Projected, type Vec3 } from "./stack-geometry";

const DEPTH = 0.62;

/** Contorno do S normalizado: centro na origem, altura de -1 a 1, y para cima. */
export const OUTLINE: { x: number; y: number }[] = (() => {
  const raw = S_POINTS.split(" ").map((p) => p.split(",").map(Number) as [number, number]);
  const xs = raw.map((p) => p[0]);
  const ys = raw.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const k = (Math.max(...ys) - Math.min(...ys)) / 2;
  return raw.map(([x, y]) => ({ x: (x - cx) / k, y: -(y - cy) / k }));
})();

/** Sentido do contorno (+1 anti-horário em coordenadas y-para-cima). */
const WINDING = Math.sign(
  OUTLINE.reduce((acc, p, i) => {
    const q = OUTLINE[(i + 1) % OUTLINE.length]!;
    return acc + (p.x * q.y - q.x * p.y);
  }, 0),
);

function rotate(p: Vec3, yaw: number, pitch: number): Vec3 {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = p.x * cy - p.z * sy;
  const z1 = p.x * sy + p.z * cy;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return { x: x1, y: p.y * cp - z1 * sp, z: p.y * sp + z1 * cp };
}

function normalize(v: Vec3): Vec3 {
  const l = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / l, y: v.y / l, z: v.z / l };
}

const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;

/* Luz principal vinda do alto à esquerda, à frente do objeto. */
const LIGHT = normalize({ x: -0.45, y: 0.65, z: -0.6 });
const HALF = normalize({ x: LIGHT.x, y: LIGHT.y, z: LIGHT.z - 1 });

export interface Face {
  points: Projected[];
  /** Luminância 0–1 (difusa + especular). */
  shade: number;
  depth: number;
}

export interface MarkFrame {
  sides: Face[];
  cap: Face;
  /** Posição relativa (0–1) do reflexo que atravessa a face frontal. */
  sheen: number;
}

export function computeMarkFrame(cam: Camera): MarkFrame {
  const half = DEPTH / 2;
  const front = OUTLINE.map((p) => ({ x: p.x, y: p.y, z: -half }));
  const back = OUTLINE.map((p) => ({ x: p.x, y: p.y, z: half }));
  const pf = front.map((p) => project(p, cam));
  const pb = back.map((p) => project(p, cam));
  const eye: Vec3 = { x: 0, y: 0, z: -cam.distance };

  const visible = (normal: Vec3, center: Vec3) => {
    const c = rotate(center, cam.yaw, cam.pitch);
    return dot(normal, { x: c.x - eye.x, y: c.y - eye.y, z: c.z - eye.z }) < 0;
  };
  const light = (n: Vec3) => {
    const diffuse = Math.max(0, dot(n, LIGHT));
    const specular = Math.pow(Math.max(0, dot(n, HALF)), 28);
    return Math.min(1, 0.1 + diffuse * 0.42 + specular * 0.85);
  };

  const sides: Face[] = [];
  for (let i = 0; i < OUTLINE.length; i++) {
    const j = (i + 1) % OUTLINE.length;
    const a = OUTLINE[i]!;
    const b = OUTLINE[j]!;
    // normal externa da lateral, no espaço do objeto
    const local = normalize({ x: (b.y - a.y) * WINDING, y: (a.x - b.x) * WINDING, z: 0 });
    const n = rotate(local, cam.yaw, cam.pitch);
    const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: 0 };
    if (!visible(n, center)) continue;
    const pts = [pf[i]!, pf[j]!, pb[j]!, pb[i]!];
    sides.push({ points: pts, shade: light(n), depth: pts.reduce((s, p) => s + p.depth, 0) / 4 });
  }
  sides.sort((a, b) => b.depth - a.depth);

  const frontNormal = rotate({ x: 0, y: 0, z: -1 }, cam.yaw, cam.pitch);
  const showFront = visible(frontNormal, { x: 0, y: 0, z: -half });
  const capNormal = showFront ? frontNormal : { x: -frontNormal.x, y: -frontNormal.y, z: -frontNormal.z };
  const capPoints = showFront ? pf : pb;

  return {
    sides,
    cap: { points: capPoints, shade: light(capNormal), depth: 0 },
    sheen: Math.min(1, Math.max(0, 0.5 - cam.yaw * 0.7 + cam.pitch * 0.3)),
  };
}

/** Câmera em repouso (SVG estático e movimento reduzido). */
export const MARK_REST = { yaw: -0.52, pitch: 0.24 };

export function fitMarkCamera(width: number, height: number, yaw = MARK_REST.yaw, pitch = MARK_REST.pitch): Camera {
  return {
    yaw,
    pitch,
    distance: 7,
    scale: Math.min(width / 3.1, height / 2.9),
    cx: width / 2,
    cy: height / 2,
  };
}

export function shadeToGray(shade: number) {
  const v = Math.round(8 + shade * 210);
  return `rgb(${v} ${v} ${Math.min(255, v + 3)})`;
}
