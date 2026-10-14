import { describe, expect, it } from "vitest";

import { MARK_REST, OUTLINE, computeMarkFrame, fitMarkCamera } from "@/components/visual/brand-mark-geometry";

describe("brand-mark-geometry", () => {
  it("normaliza o contorno do S entre -1 e 1 na vertical", () => {
    const ys = OUTLINE.map((p) => p.y);
    expect(Math.min(...ys)).toBeCloseTo(-1);
    expect(Math.max(...ys)).toBeCloseTo(1);
  });

  it("na pose de repouso, mostra a face frontal e laterais visíveis dentro do quadro", () => {
    const frame = computeMarkFrame(fitMarkCamera(600, 600));
    expect(frame.cap.points).toHaveLength(OUTLINE.length);
    expect(frame.sides.length).toBeGreaterThan(2);
    expect(frame.sides.length).toBeLessThan(OUTLINE.length);
    for (const p of [...frame.cap.points, ...frame.sides.flatMap((s) => s.points)]) {
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(600);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(600);
    }
  });

  it("ordena as laterais da mais distante para a mais próxima", () => {
    const { sides } = computeMarkFrame(fitMarkCamera(600, 600, MARK_REST.yaw + 0.4, MARK_REST.pitch));
    for (let i = 1; i < sides.length; i++) expect(sides[i - 1]!.depth).toBeGreaterThanOrEqual(sides[i]!.depth);
  });

  it("é determinística (servidor e cliente geram o mesmo quadro)", () => {
    expect(computeMarkFrame(fitMarkCamera(400, 400))).toEqual(computeMarkFrame(fitMarkCamera(400, 400)));
  });
});
