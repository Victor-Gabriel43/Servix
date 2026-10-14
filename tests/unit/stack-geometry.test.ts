import { describe, expect, it } from "vitest";

import { buildScene, fitCamera, project, tilePose } from "@/components/visual/stack-geometry";

describe("stack-geometry", () => {
  it("gera a mesma cena no servidor e no cliente (determinística)", () => {
    expect(buildScene()).toEqual(buildScene());
  });

  it("tem três camadas e conexões apenas entre camadas vizinhas", () => {
    const scene = buildScene();
    expect(new Set(scene.tiles.map((t) => t.layer))).toEqual(new Set([0, 1, 2]));
    for (const link of scene.links) {
      expect(scene.tiles[link.to]!.layer - scene.tiles[link.from]!.layer).toBe(1);
    }
  });

  it("módulos terminam encaixados na posição final", () => {
    const scene = buildScene();
    for (const tile of scene.tiles) {
      expect(tilePose(tile, 1, 0).center.x).toBeCloseTo(tile.target.x);
      expect(tilePose(tile, 1, 0).center.z).toBeCloseTo(tile.target.z);
    }
  });

  it("a estrutura em repouso cabe no quadro", () => {
    const scene = buildScene();
    const cam = fitCamera(400, 400);
    for (const tile of scene.tiles) {
      const p = project(tile.target, cam);
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(400);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(400);
    }
  });
});
