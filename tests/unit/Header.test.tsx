import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Header } from "@/components/layout/Header";

describe("Header", () => {
  it("abre e fecha o menu mobile com foco gerenciado e Esc", async () => {
    const user = userEvent.setup();
    document.body.innerHTML = '<main id="conteudo"></main><footer id="rodape"></footer>';
    render(<Header />);

    const toggle = screen.getByRole("button", { name: "Abrir menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const mobileNav = screen.getByRole("navigation", { name: "Menu mobile" });
    expect(mobileNav.querySelector("a")).toHaveFocus();
    expect(document.getElementById("conteudo")).toHaveAttribute("inert");

    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Abrir menu" })).toHaveFocus();
    expect(screen.queryByRole("navigation", { name: "Menu mobile" })).not.toBeInTheDocument();
    expect(document.getElementById("conteudo")).not.toHaveAttribute("inert");
  });

  it("links de navegação apontam para seções reais", () => {
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: "Principal" });
    const hrefs = Array.from(nav.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/#inicio", "/#solucoes", "/#processo", "/#sobre"]);
    expect(screen.getByRole("link", { name: "Pular para o conteúdo" })).toHaveAttribute("href", "#conteudo");
  });
});
