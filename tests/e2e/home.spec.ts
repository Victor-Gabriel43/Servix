import { expect, test, type Page } from "@playwright/test";

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

test.describe("Página inicial", () => {
  test("carrega sem erros, com um único h1 e metadados", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/");
    await expect(page).toHaveTitle("Servix — Sistemas sob medida para pequenos negócios");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("A rotina do seu negócio");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /pequenos negócios/);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    // conteúdo provisório não deve ser indexado antes da publicação
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await page.waitForTimeout(1000);
    expect(errors).toEqual([]);
  });

  test("todas as seções existem e os links internos apontam para destinos reais", async ({ page }) => {
    await page.goto("/");
    for (const id of ["inicio", "solucoes", "processo", "sobre", "contato", "produtos"]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
    const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")!));
    expect(hrefs).not.toContain("#");
    for (const href of hrefs.filter((h) => h.startsWith("/#") || h.startsWith("#"))) {
      const id = href.split("#")[1]!;
      expect(await page.locator(`[id="${id}"]`).count(), `destino de ${href}`).toBe(1);
    }
  });

  test("hierarquia de títulos não pula níveis", async ({ page }) => {
    await page.goto("/");
    const levels = await page.$$eval("h1,h2,h3,h4", (hs) => hs.map((h) => Number(h.tagName[1])));
    for (let i = 1; i < levels.length; i++) expect(levels[i]! - levels[i - 1]!).toBeLessThanOrEqual(1);
  });

  test("não exibe avisos de pendência em produção", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-pending]")).toHaveCount(0);
  });

  test("sem rolagem horizontal em larguras de 320 a 1920 px", async ({ page }) => {
    for (const width of [320, 360, 375, 414, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `largura ${width}px`).toBeLessThanOrEqual(0);
    }
  });

  test("áreas de toque dos controles principais têm ao menos 44 px", async ({ page }) => {
    await page.goto("/");
    const small = await page.$$eval("main a.btn, main button, header button", (els) =>
      els
        .filter((el) => (el as HTMLElement).offsetParent !== null)
        .map((el) => ({ text: el.textContent?.trim(), h: el.getBoundingClientRect().height }))
        .filter((r) => r.h < 44),
    );
    expect(small).toEqual([]);
  });
});

test.describe("Navegação e teclado", () => {
  test("link de pular conteúdo é o primeiro foco", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Pular para o conteúdo" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#conteudo$/);
  });

  test("navegação do header leva às seções", async ({ page, isMobile }) => {
    test.skip(isMobile, "navegação desktop");
    await page.goto("/");
    await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Processo" }).click();
    await expect(page).toHaveURL(/#processo$/);
    await expect(page.locator("#processo-title")).toBeInViewport();
  });

  test("menu mobile funciona por teclado", async ({ page, isMobile }) => {
    test.skip(!isMobile, "menu mobile");
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Abrir menu" });
    await toggle.focus();
    await page.keyboard.press("Enter");
    const menu = page.getByRole("navigation", { name: "Menu mobile" });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(page.getByRole("button", { name: "Abrir menu" })).toBeFocused();

    await page.getByRole("button", { name: "Abrir menu" }).click();
    await menu.getByRole("link", { name: /Sobre/ }).click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/#sobre$/);
    await expect(page.locator("#sobre-title")).toBeInViewport();
  });
});

test.describe("Formulário de contato", () => {
  test("valida campos obrigatórios", async ({ page }) => {
    await page.goto("/#contato");
    const form = page.getByTestId("contact-form");
    await form.getByRole("button", { name: /enviar mensagem/i }).click();
    await expect(form.getByLabel(/^Nome/)).toHaveAttribute("aria-invalid", "true");
    await expect(form.getByLabel(/^Nome/)).toBeFocused();
    await expect(form.getByRole("alert")).toContainText(/revise os campos/i);
  });

  test("sem serviço de envio configurado, informa a falha e não finge sucesso", async ({ page }) => {
    await page.goto("/#contato");
    const form = page.getByTestId("contact-form");
    await expect(form.getByRole("note")).toContainText(/ainda não está disponível/i);
    await form.getByLabel(/^Nome/).fill("Maria Souza");
    await form.getByLabel(/E-mail ou telefone/).fill("maria@exemplo.com");
    await form.getByLabel(/necessidade do seu negócio/).fill("Quero organizar os pedidos que hoje ficam em planilhas.");
    await form.getByRole("button", { name: /enviar mensagem/i }).click();
    await expect(form.getByRole("alert")).toContainText(/não foi enviada/i);
    await expect(page.getByText("Mensagem enviada.")).toHaveCount(0);
  });

  test("exibe sucesso quando o servidor confirma (resposta simulada)", async ({ page }) => {
    await page.route("**/api/contact", (route) => route.fulfill({ status: 200, json: { ok: true, code: "sent" } }));
    await page.goto("/#contato");
    const form = page.getByTestId("contact-form");
    await form.getByLabel(/^Nome/).fill("Maria Souza");
    await form.getByLabel(/E-mail ou telefone/).fill("(11) 91234-5678");
    await form.getByLabel(/necessidade do seu negócio/).fill("Quero organizar os agendamentos do meu salão.");
    await form.getByRole("button", { name: /enviar mensagem/i }).click();
    await expect(page.getByRole("heading", { name: "Mensagem enviada." })).toBeFocused();
  });

  test("áreas escolhidas no esboço preenchem a mensagem", async ({ page }) => {
    await page.goto("/#solucoes");
    const composer = page.getByTestId("module-composer");
    await composer.getByRole("button", { name: "Estoque" }).click();
    await composer.getByRole("button", { name: "Relatórios" }).click();
    await composer.getByRole("button", { name: /levar para a conversa/i }).click();
    const message = page.getByTestId("contact-form").getByLabel(/necessidade do seu negócio/);
    await expect(message).toHaveValue(/organizar: Estoque e Relatórios/);
    await expect(message).toBeFocused();
  });
});

test.describe("Elemento visual e movimento", () => {
  test("marca 3D e visual de camadas animam quando há canvas", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("brand-mark")).toHaveAttribute("data-state", "ready");
    await page.getByTestId("system-stack").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("system-stack")).toHaveAttribute("data-state", "ready");
  });

  test("a marca 3D pode ser arrastada sem quebrar a página", async ({ page, isMobile }) => {
    test.skip(isMobile, "arraste com mouse");
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    const box = (await page.getByTestId("brand-mark").boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    expect(errors).toEqual([]);
  });

  test("sem canvas, os SVGs estáticos permanecem visíveis", async ({ page }) => {
    await page.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = () => null;
    });
    await page.goto("/");
    for (const id of ["brand-mark", "system-stack"]) {
      const el = page.getByTestId(id);
      await expect(el).toHaveAttribute("data-state", "unsupported");
      await expect(el.locator(".stack-fallback")).toHaveCSS("opacity", "1");
    }
    await expect(page.getByTestId("brand-mark").locator(".stack-fallback svg")).toBeVisible();
  });

  test("com movimento reduzido, mostra quadro estático e todo o conteúdo", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByTestId("brand-mark")).toHaveAttribute("data-state", "ready");
    await expect(page.locator("#hero-title .word").first()).toHaveCSS("opacity", "1");
    await page.locator("#contato").scrollIntoViewIfNeeded();
    await expect(page.locator("#contato-title")).toHaveCSS("opacity", "1");
  });
});

test.describe("Sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("conteúdo e visual estático continuam acessíveis", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByTestId("brand-mark").locator(".stack-fallback")).toHaveCSS("opacity", "1", { timeout: 5000 });
    await expect(page.getByRole("link", { name: /Conversar sobre meu negócio/ })).toHaveAttribute("href", "#contato");
  });
});
