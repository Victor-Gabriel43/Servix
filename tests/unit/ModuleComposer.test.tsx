import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ModuleComposer } from "@/components/solution/ModuleComposer";
import { PREFILL_EVENT } from "@/lib/events";

describe("ModuleComposer", () => {
  it("alterna áreas com aria-pressed e envia a seleção para o contato", async () => {
    const user = userEvent.setup();
    const listener = vi.fn();
    window.addEventListener(PREFILL_EVENT, listener);
    render(<ModuleComposer />);

    const cta = screen.getByRole("button", { name: /selecione ao menos uma área/i });
    expect(cta).toHaveAttribute("aria-disabled", "true");
    await user.click(cta);
    expect(listener).not.toHaveBeenCalled();

    const estoque = screen.getByRole("button", { name: "Estoque" });
    const agenda = screen.getByRole("button", { name: "Agendamentos" });
    await user.click(estoque);
    await user.click(agenda);
    expect(estoque).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("2 de 8 áreas")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /levar para a conversa/i }));
    // mantém a ordem da lista, não a ordem de clique
    expect((listener.mock.calls[0]![0] as CustomEvent).detail).toEqual({ areas: ["Agendamentos", "Estoque"] });

    await user.click(estoque);
    expect(estoque).toHaveAttribute("aria-pressed", "false");
    window.removeEventListener(PREFILL_EVENT, listener);
  });
});
