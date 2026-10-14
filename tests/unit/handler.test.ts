import { describe, expect, it, vi } from "vitest";

import { buildEmail } from "@/lib/contact/delivery";
import { handleContactRequest } from "@/lib/contact/handler";
import { createRateLimiter } from "@/lib/contact/rate-limit";

const body = {
  name: "João",
  company: "Oficina <Teste>",
  contact: "joao@exemplo.com",
  message: "Precisamos organizar as ordens de serviço da oficina.",
};
const config = { apiKey: "test-key", to: "comercial@exemplo.com", from: "site@exemplo.com" };

function request(payload: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", host: "localhost", ...headers },
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  });
}

const limiter = () => createRateLimiter({ limit: 100, windowMs: 1000 });

describe("handleContactRequest", () => {
  it("envia o e-mail quando configurado", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    const res = await handleContactRequest(request(body), { config, fetchImpl, limiter: limiter() });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, code: "sent" });

    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe("https://api.resend.com/emails");
    const sent = JSON.parse(init.body);
    expect(sent.to).toEqual(["comercial@exemplo.com"]);
    expect(sent.reply_to).toBe("joao@exemplo.com");
    expect(sent.html).toContain("Oficina &lt;Teste&gt;");
    expect(init.headers.Authorization).toBe("Bearer test-key");
  });

  it("informa quando o envio não está configurado (sem fingir sucesso)", async () => {
    const fetchImpl = vi.fn();
    const res = await handleContactRequest(request(body), { config: null, fetchImpl, limiter: limiter() });
    expect(res.status).toBe(503);
    expect((await res.json()).code).toBe("not_configured");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("retorna erros de validação do servidor", async () => {
    const res = await handleContactRequest(request({ ...body, contact: "x" }), { config, limiter: limiter() });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe("invalid");
    expect(json.errors.contact).toBeDefined();
  });

  it("rejeita JSON malformado, tipo de conteúdo e corpo grande", async () => {
    expect((await handleContactRequest(request("{oops"), { config, limiter: limiter() })).status).toBe(400);
    expect(
      (await handleContactRequest(request(body, { "content-type": "text/plain" }), { config, limiter: limiter() })).status,
    ).toBe(415);
    expect(
      (await handleContactRequest(request({ ...body, message: "a".repeat(20_000) }), { config, limiter: limiter() }))
        .status,
    ).toBe(413);
  });

  it("bloqueia requisições de outra origem", async () => {
    const res = await handleContactRequest(request(body, { origin: "https://malicioso.example" }), {
      config,
      limiter: limiter(),
    });
    expect(res.status).toBe(403);
  });

  it("aplica o limite de requisições", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    const strict = createRateLimiter({ limit: 1, windowMs: 60_000 });
    const headers = { "x-forwarded-for": "1.2.3.4" };
    expect((await handleContactRequest(request(body, headers), { config, fetchImpl, limiter: strict })).status).toBe(200);
    expect((await handleContactRequest(request(body, headers), { config, fetchImpl, limiter: strict })).status).toBe(429);
  });

  it("descarta silenciosamente envios de robôs (campo-armadilha)", async () => {
    const fetchImpl = vi.fn();
    const res = await handleContactRequest(request({ ...body, website: "spam" }), { config, fetchImpl, limiter: limiter() });
    expect(res.status).toBe(200);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("trata falha do provedor de e-mail", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchImpl = vi.fn().mockResolvedValue(new Response("{}", { status: 500 }));
    const res = await handleContactRequest(request(body), { config, fetchImpl, limiter: limiter() });
    expect(res.status).toBe(502);
    expect((await res.json()).code).toBe("provider_error");
  });
});

describe("buildEmail", () => {
  it("não usa reply_to para telefone e escapa HTML", () => {
    const email = buildEmail({ ...body, contact: "11912345678", contactKind: "phone", message: "<script>x</script>" });
    expect(email.html).not.toContain("<script>");
    expect(email.text).toContain("Telefone: 11912345678");
  });
});
