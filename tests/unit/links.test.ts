import { describe, expect, it } from "vitest";

import { siteConfig } from "@/config/site";
import { getContactChannels, whatsappUrl } from "@/lib/links";

describe("getContactChannels", () => {
  it("não cria links para canais não configurados", () => {
    expect(getContactChannels({ ...siteConfig, contact: { ...siteConfig.contact, email: null, whatsapp: null, phone: null } })).toEqual([]);
  });

  it("monta links reais para canais configurados", () => {
    const channels = getContactChannels({
      ...siteConfig,
      contact: { email: "a@b.com", whatsapp: "55 (11) 90000-0000", phone: "+55 11 3000-0000", whatsappMessage: "Olá" },
    });
    expect(channels.map((c) => c.href)).toEqual(["mailto:a@b.com", "https://wa.me/5511900000000?text=Ol%C3%A1", "tel:+551130000000"]);
    expect(channels.every((c) => c.href !== "#")).toBe(true);
  });

  it("whatsappUrl funciona sem mensagem", () => {
    expect(whatsappUrl("5511900000000")).toBe("https://wa.me/5511900000000");
  });
});
