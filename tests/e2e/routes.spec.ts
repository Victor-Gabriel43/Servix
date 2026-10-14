import { expect, test } from "@playwright/test";

test.describe("Rotas e servidor", () => {
  test("rotas auxiliares respondem", async ({ request }) => {
    for (const path of ["/privacidade", "/icon.svg", "/opengraph-image", "/robots.txt", "/sitemap.xml"]) {
      expect((await request.get(path)).status(), path).toBe(200);
    }
    expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /");
  });

  test("página inexistente retorna 404 com navegação de volta", async ({ page }) => {
    const res = await page.goto("/pagina-que-nao-existe");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("não leva a nenhuma página");
    await page.getByRole("link", { name: "Voltar para o início" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("aviso de privacidade identifica a versão preliminar", async ({ page }) => {
    await page.goto("/privacidade");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Aviso de privacidade");
    await expect(page.getByRole("note")).toContainText("Versão preliminar");
  });

  test("cabeçalhos de segurança", async ({ request }) => {
    const headers = (await request.get("/")).headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("API de contato valida no servidor e bloqueia outra origem", async ({ request }) => {
    const invalid = await request.post("/api/contact", { data: { name: "" } });
    expect(invalid.status()).toBe(400);
    expect((await invalid.json()).errors.name).toBeDefined();

    const cross = await request.post("/api/contact", {
      data: { name: "x" },
      headers: { origin: "https://malicioso.example" },
    });
    expect(cross.status()).toBe(403);

    const notJson = await request.post("/api/contact", { data: "texto", headers: { "content-type": "text/plain" } });
    expect(notJson.status()).toBe(415);
  });
});
