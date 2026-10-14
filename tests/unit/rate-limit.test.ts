import { describe, expect, it } from "vitest";

import { createRateLimiter } from "@/lib/contact/rate-limit";

describe("createRateLimiter", () => {
  it("bloqueia após o limite e libera depois da janela", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(limiter.check("ip", 0)).toBe(true);
    expect(limiter.check("ip", 100)).toBe(true);
    expect(limiter.check("ip", 200)).toBe(false);
    expect(limiter.check("outro-ip", 200)).toBe(true);
    expect(limiter.check("ip", 1201)).toBe(true);
  });

  it("não cresce indefinidamente", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 2 });
    limiter.check("a", 0);
    limiter.check("b", 0);
    limiter.check("c", 0); // descarta "a"
    expect(limiter.check("a", 1)).toBe(true);
  });
});
