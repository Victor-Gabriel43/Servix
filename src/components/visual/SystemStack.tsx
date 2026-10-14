"use client";

import { useEffect, useRef } from "react";

import {
  REST_PITCH,
  REST_YAW,
  buildScene,
  clamp01,
  fitCamera,
  project,
  tileCorners,
  tilePose,
  type Camera,
  type Projected,
  type Scene,
} from "./stack-geometry";

const ASSEMBLY_MS = 2600;
const SLAB = 0.07;
const ACCENT = "66 217 255";

type Ctx = CanvasRenderingContext2D;

function path(ctx: Ctx, pts: Projected[]) {
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]!.x, pts[i]!.y);
  ctx.closePath();
}

/** Posição de um pulso (0–1) ao longo de cada conexão. */
function pulseT(phase: number, time: number) {
  return (time * 0.32 + phase) % 1;
}

function draw(ctx: Ctx, scene: Scene, cam: Camera, assembly: number, time: number, animated: boolean, monoFont: string) {
  ctx.clearRect(0, 0, cam.cx * 2, cam.cy * 2);

  const poses = scene.tiles.map((tile) => tilePose(tile, assembly, time));
  const centers = poses.map((p) => project(p.center, cam));
  const settled = clamp01((assembly - 0.75) / 0.25);

  // Brilho dos módulos que acabaram de receber um pulso.
  const glow = new Float32Array(scene.tiles.length);
  if (settled > 0) {
    for (const link of scene.links) {
      const t = animated ? pulseT(link.phase, time) : 0.5;
      const recency = t; // pulso chega em t=1 e recomeça em t=0
      const g = Math.max(0, 1 - recency / 0.35) * settled;
      glow[link.to] = Math.max(glow[link.to]!, g);
    }
  }

  for (let layer = 0; layer < scene.layers.length; layer++) {
    // Conexões que chegam nesta camada.
    if (settled > 0) {
      for (const link of scene.links) {
        if (scene.tiles[link.from]!.layer !== layer - 1) continue;
        const a = centers[link.from]!;
        const b = centers[link.to]!;
        ctx.strokeStyle = `rgb(${ACCENT} / ${0.28 * settled})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        const t = animated ? pulseT(link.phase, time) : 0.5;
        const px = a.x + (b.x - a.x) * t;
        const py = a.y + (b.y - a.y) * t;
        const fade = Math.sin(Math.PI * t) * settled;
        ctx.fillStyle = `rgb(${ACCENT} / ${0.16 * fade})`;
        ctx.beginPath();
        ctx.arc(px, py, 7 * a.k, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgb(220 248 255 / ${0.95 * fade})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.8 * a.k, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Módulos desta camada, do mais distante para o mais próximo.
    const order = scene.tiles
      .filter((t) => t.layer === layer)
      .map((t) => t.id)
      .sort((a, b) => centers[b]!.depth - centers[a]!.depth);

    for (const id of order) {
      const tile = scene.tiles[id]!;
      const pose = poses[id]!;
      if (pose.progress <= 0.001) continue;
      const alpha = clamp01(pose.progress * 1.4);
      const g = glow[id]!;

      const bottom = tileCorners({ ...pose.center, y: pose.center.y - SLAB }, scene.tileHalf, pose.spin, cam);
      path(ctx, bottom);
      ctx.fillStyle = `rgb(3 3 4 / ${0.9 * alpha})`;
      ctx.fill();

      const top = tileCorners(pose.center, scene.tileHalf, pose.spin, cam);
      path(ctx, top);
      const fillA = tile.accent ? 0.16 + 0.12 * g : 0.06 * g;
      ctx.fillStyle = `rgb(22 22 26 / ${0.82 * alpha})`;
      ctx.fill();
      if (fillA > 0) {
        ctx.fillStyle = `rgb(${ACCENT} / ${fillA * alpha})`;
        ctx.fill();
      }
      ctx.lineWidth = 1;
      ctx.strokeStyle = tile.accent
        ? `rgb(${ACCENT} / ${0.95 * alpha})`
        : `rgb(161 161 170 / ${(0.3 + 0.35 * g) * alpha})`;
      ctx.stroke();
    }

    // Rótulo técnico da camada, ancorado no módulo mais à esquerda.
    if (settled > 0 && order.length > 0) {
      let left: Projected | null = null;
      for (const id of order) {
        for (const p of tileCorners(poses[id]!.center, scene.tileHalf, 0, cam)) {
          if (!left || p.x < left.x) left = p;
        }
      }
      if (left) {
        const size = Math.max(10, Math.round(cam.scale * 0.105));
        ctx.strokeStyle = `rgb(161 161 170 / ${0.35 * settled})`;
        ctx.beginPath();
        ctx.moveTo(left.x - 10, left.y);
        ctx.lineTo(left.x - 34, left.y);
        ctx.stroke();
        ctx.fillStyle = `rgb(161 161 170 / ${0.85 * settled})`;
        ctx.font = `500 ${size}px ${monoFont}`;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(scene.layers[layer]!.label, left.x - 40, left.y);
      }
    }
  }
}

/**
 * Elemento visual animado do hero. Renderiza em canvas 2D com projeção 3D
 * própria (sem bibliotecas), pausa fora da tela e respeita
 * `prefers-reduced-motion`. O SVG estático passado como `children` fica
 * visível até o primeiro quadro — e permanece se o canvas não funcionar.
 */
export function SystemStack({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    let ctx: Ctx | null = null;
    try {
      ctx = canvas.getContext("2d");
    } catch {
      ctx = null;
    }
    if (!ctx) {
      wrapper.dataset.state = "unsupported";
      return;
    }

    const scene = buildScene();
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const monoFont = getComputedStyle(wrapper).getPropertyValue("--font-mono").trim() || "monospace";

    let reduced = motionQuery.matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = false; // definido pelo IntersectionObserver
    let start = 0;
    const pointer = { x: 0, y: 0 };
    const view = { yaw: REST_YAW, pitch: REST_PITCH };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) renderStatic();
    };

    const renderStatic = () => {
      if (!width || !height) return;
      draw(ctx!, scene, fitCamera(width, height), 1, 0, false, monoFont);
      wrapper.dataset.state = "ready";
    };

    const tick = (now: number) => {
      frame = 0;
      if (!visible || reduced) return;
      if (!start) start = now;
      const elapsed = now - start;
      const time = elapsed / 1000;
      const assembly = clamp01(elapsed / ASSEMBLY_MS);

      const scroll = Math.min(window.scrollY, 900) / 900;
      const targetYaw = REST_YAW + Math.sin(time * 0.16) * 0.28 + pointer.x * 0.32 + scroll * 0.5;
      const targetPitch = REST_PITCH + pointer.y * 0.1 - scroll * 0.18;
      view.yaw += (targetYaw - view.yaw) * 0.05;
      view.pitch += (targetPitch - view.pitch) * 0.05;

      if (width && height) {
        draw(ctx!, scene, fitCamera(width, height, view.yaw, view.pitch), assembly, time, true, monoFont);
        if (wrapper.dataset.state !== "ready") wrapper.dataset.state = "ready";
      }
      frame = requestAnimationFrame(tick);
    };

    const play = () => {
      if (!frame && visible && !reduced && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointer = (event: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();
      pointer.x = clamp01((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = clamp01((event.clientY - rect.top) / rect.height) * 2 - 1;
    };

    const onMotionChange = () => {
      reduced = motionQuery.matches;
      if (reduced) {
        stop();
        renderStatic();
      } else {
        play();
      }
    };

    const onVisibility = () => (document.hidden ? stop() : play());

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible) play();
      else stop();
    });
    intersection.observe(wrapper);

    motionQuery.addEventListener("change", onMotionChange);
    document.addEventListener("visibilitychange", onVisibility);
    if (finePointer) window.addEventListener("pointermove", onPointer, { passive: true });

    resize();
    if (reduced) renderStatic();
    else play();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersection.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div ref={wrapperRef} data-state="loading" className="group/stack relative size-full" data-testid="system-stack">
      <div className="stack-fallback absolute inset-0">
        {children}
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 size-full opacity-0 transition-opacity duration-700 group-data-[state=ready]/stack:opacity-100"
      />
    </div>
  );
}
