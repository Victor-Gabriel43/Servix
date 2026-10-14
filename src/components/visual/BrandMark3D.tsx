"use client";

import { useEffect, useRef } from "react";

import { MARK_REST, computeMarkFrame, fitMarkCamera, shadeToGray, type Face } from "./brand-mark-geometry";
import { clamp01, type Projected } from "./stack-geometry";

type Ctx = CanvasRenderingContext2D;

const INTRO_MS = 1800;
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

function trace(ctx: Ctx, pts: Projected[]) {
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]!.x, pts[i]!.y);
  ctx.closePath();
}

function perimeter(pts: Projected[]) {
  let len = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]!;
    const b = pts[(i + 1) % pts.length]!;
    len += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return len;
}

function bounds(pts: Projected[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }
  return { minX, minY, maxX, maxY };
}

function drawSide(ctx: Ctx, face: Face) {
  trace(ctx, face.points);
  const color = shadeToGray(face.shade);
  ctx.fillStyle = color;
  ctx.strokeStyle = color; // fecha as frestas de antisserrilhado entre faces
  ctx.lineWidth = 0.75;
  ctx.fill();
  ctx.stroke();
}

function drawFrame(ctx: Ctx, width: number, height: number, yaw: number, pitch: number, lift: number, time: number, alpha: number, animated: boolean) {
  ctx.clearRect(0, 0, width, height);
  const cam = fitMarkCamera(width, height, yaw, pitch);
  cam.cy += lift;
  const frame = computeMarkFrame(cam);
  ctx.globalAlpha = alpha;

  // Reflexo difuso no "piso"
  const floorY = height / 2 + cam.scale * 1.18;
  const floor = ctx.createRadialGradient(width / 2, floorY, 0, width / 2, floorY, cam.scale * 1.2);
  floor.addColorStop(0, "rgb(255 255 255 / 0.07)");
  floor.addColorStop(1, "rgb(255 255 255 / 0)");
  ctx.fillStyle = floor;
  ctx.beginPath();
  ctx.ellipse(width / 2, floorY, cam.scale * 1.2, cam.scale * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  for (const side of frame.sides) drawSide(ctx, side);

  // Face frontal: cromo negro com um reflexo que acompanha a rotação
  const pts = frame.cap.points;
  const box = bounds(pts);
  const g = ctx.createLinearGradient(box.minX, box.minY, box.maxX, box.maxY);
  const s = frame.sheen;
  const base = 10 + frame.cap.shade * 26;
  g.addColorStop(0, `rgb(${base + 14} ${base + 14} ${base + 17})`);
  g.addColorStop(Math.max(0, s - 0.18), `rgb(${base} ${base} ${base + 2})`);
  g.addColorStop(s, `rgb(${base + 58} ${base + 58} ${base + 62})`);
  g.addColorStop(Math.min(1, s + 0.18), `rgb(${base} ${base} ${base + 2})`);
  g.addColorStop(1, `rgb(${Math.max(0, base - 6)} ${Math.max(0, base - 6)} ${Math.max(0, base - 4)})`);
  trace(ctx, pts);
  ctx.fillStyle = g;
  ctx.fill();

  const top = ctx.createLinearGradient(0, box.minY, 0, box.maxY);
  top.addColorStop(0, "rgb(255 255 255 / 0.10)");
  top.addColorStop(0.45, "rgb(255 255 255 / 0)");
  ctx.fillStyle = top;
  ctx.fill();

  ctx.lineJoin = "round";
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgb(255 255 255 / 0.5)";
  ctx.stroke();

  // Assinatura: um pulso de dados ciano percorrendo o contorno
  const len = perimeter(pts);
  const seg = len * 0.14;
  ctx.setLineDash([seg, len - seg]);
  ctx.lineDashOffset = animated ? -((time * len * 0.16) % len) : -len * 0.3;
  ctx.strokeStyle = "rgb(66 217 255 / 0.22)";
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.strokeStyle = "rgb(150 236 255 / 0.95)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}

/**
 * Marca Servix em 3D. Gira suavemente, inclina com o cursor e pode ser
 * arrastada (com inércia). Pausa fora da tela; com movimento reduzido,
 * desenha um único quadro. O SVG passado em `children` é o fallback.
 */
export function BrandMark3D({ children }: { children: React.ReactNode }) {
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

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    let reduced = motionQuery.matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = false; // definido pelo IntersectionObserver
    let start = 0;
    let last = 0;
    let ready = false;

    const pointer = { x: 0, y: 0 };
    const view = { yaw: MARK_REST.yaw - 1.4, pitch: MARK_REST.pitch };
    // giro manual por arraste
    const spin = { offset: 0, velocity: 0, dragging: false, lastX: 0 };

    const renderStatic = () => {
      if (!width || !height) return;
      drawFrame(ctx!, width, height, MARK_REST.yaw, MARK_REST.pitch, 0, 0, 1, false);
      wrapper.dataset.state = "ready";
    };

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

    const tick = (now: number) => {
      frame = 0;
      if (!visible || reduced) return;
      if (!start) start = now;
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      const time = (now - start) / 1000;
      const intro = easeOutExpo(clamp01((now - start) / INTRO_MS));

      if (!spin.dragging) {
        spin.offset += spin.velocity * dt;
        spin.velocity *= Math.pow(0.04, dt); // inércia
        spin.offset += (0 - spin.offset) * (1 - Math.pow(0.12, dt)); // retorno elástico
      }

      const scroll = Math.min(window.scrollY, 800) / 800;
      const targetYaw =
        MARK_REST.yaw + Math.sin(time * 0.45) * 0.3 + pointer.x * 0.4 + scroll * 0.9 + spin.offset + (1 - intro) * -1.4;
      const targetPitch = MARK_REST.pitch + Math.sin(time * 0.33) * 0.06 + pointer.y * 0.22 - scroll * 0.2;
      const ease = 1 - Math.pow(0.0025, dt);
      view.yaw += (targetYaw - view.yaw) * ease;
      view.pitch += (targetPitch - view.pitch) * ease;

      if (width && height) {
        const lift = Math.sin(time * 0.8) * height * 0.012 + (1 - intro) * height * 0.06;
        drawFrame(ctx!, width, height, view.yaw, view.pitch, lift, time, intro, true);
        if (wrapper.dataset.state !== "ready") wrapper.dataset.state = "ready";
      }
      frame = requestAnimationFrame(tick);
    };

    const play = () => {
      if (!ready) return;
      if (!frame && visible && !reduced && !document.hidden) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();
      pointer.x = clamp01((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = clamp01((event.clientY - rect.top) / rect.height) * 2 - 1;
    };

    const onDown = (event: PointerEvent) => {
      if (reduced) return;
      spin.dragging = true;
      spin.lastX = event.clientX;
      spin.velocity = 0;
      wrapper.setPointerCapture(event.pointerId);
    };
    const onDrag = (event: PointerEvent) => {
      if (!spin.dragging) return;
      const dx = (event.clientX - spin.lastX) / Math.max(width, 1);
      spin.lastX = event.clientX;
      spin.offset += dx * 4;
      spin.velocity = dx * 4 * 60;
    };
    const onUp = () => {
      spin.dragging = false;
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
    if (finePointer) window.addEventListener("pointermove", onPointerMove, { passive: true });
    wrapper.addEventListener("pointerdown", onDown);
    wrapper.addEventListener("pointermove", onDrag);
    wrapper.addEventListener("pointerup", onUp);
    wrapper.addEventListener("pointercancel", onUp);

    // Inicia depois que a página fica ociosa, para não competir com o
    // carregamento inicial (o halo e o SVG cobrem esse intervalo).
    const begin = () => {
      ready = true;
      resize();
      if (reduced) renderStatic();
      else play();
    };
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = hasIdle ? window.requestIdleCallback(begin, { timeout: 900 }) : window.setTimeout(begin, 300);

    return () => {
      if (!ready) {
        if (hasIdle) window.cancelIdleCallback(idle);
        else window.clearTimeout(idle);
      }
      stop();
      resizeObserver.disconnect();
      intersection.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      wrapper.removeEventListener("pointerdown", onDown);
      wrapper.removeEventListener("pointermove", onDrag);
      wrapper.removeEventListener("pointerup", onUp);
      wrapper.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      data-state="loading"
      data-testid="brand-mark"
      className="group/mark relative size-full cursor-grab touch-pan-y select-none active:cursor-grabbing motion-reduce:cursor-auto"
    >
      <div className="stack-fallback absolute inset-0">{children}</div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 size-full opacity-0 transition-opacity duration-700 group-data-[state=ready]/mark:opacity-100"
      />
    </div>
  );
}
