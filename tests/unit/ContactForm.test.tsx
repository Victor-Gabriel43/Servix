import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ContactForm } from "@/components/contact/ContactForm";
import { PREFILL_EVENT } from "@/lib/events";

const channels = [{ id: "email" as const, label: "E-mail", value: "a@b.com", href: "mailto:a@b.com", external: false }];

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Nome/), "Maria Souza");
  await user.type(screen.getByLabelText(/E-mail ou telefone/), "maria@exemplo.com");
  await user.type(screen.getByLabelText(/necessidade do seu negócio/), "Quero organizar os pedidos que hoje ficam no caderno.");
}

function mockFetch(status: number, body: unknown) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

describe("ContactForm", () => {
  it("mostra erros acessíveis e foca o primeiro campo inválido", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<ContactForm deliveryEnabled channels={[]} />);

    await user.click(screen.getByRole("button", { name: /enviar mensagem/i }));

    const name = screen.getByLabelText(/^Nome/);
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveFocus();
    expect(name).toHaveAccessibleDescription(/informe seu nome/i);
    expect(screen.getByRole("alert")).toHaveTextContent(/revise os campos/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("revalida enquanto o usuário corrige após a primeira tentativa", async () => {
    const user = userEvent.setup();
    render(<ContactForm deliveryEnabled channels={[]} />);
    await user.click(screen.getByRole("button", { name: /enviar mensagem/i }));
    await user.type(screen.getByLabelText(/^Nome/), "Ana");
    expect(screen.getByLabelText(/^Nome/)).not.toHaveAttribute("aria-invalid");
  });

  it("exibe sucesso somente quando o servidor confirma o envio", async () => {
    const user = userEvent.setup();
    const fetchSpy = mockFetch(200, { ok: true, code: "sent" });
    render(<ContactForm deliveryEnabled channels={[]} />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /enviar mensagem/i }));

    expect(await screen.findByRole("heading", { name: /mensagem enviada/i })).toHaveFocus();
    const [, init] = fetchSpy.mock.calls[0]!;
    expect(JSON.parse(String(init?.body))).toMatchObject({ name: "Maria Souza", website: "" });
  });

  it("não finge envio quando o serviço não está configurado", async () => {
    const user = userEvent.setup();
    mockFetch(503, { ok: false, code: "not_configured" });
    render(<ContactForm deliveryEnabled={false} channels={channels} />);

    expect(screen.getByRole("note")).toHaveTextContent(/ainda não está disponível/i);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /enviar mensagem/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/não foi enviada/i);
    expect(screen.getByRole("link", { name: "E-mail" })).toHaveAttribute("href", "mailto:a@b.com");
    expect(screen.queryByText(/mensagem enviada/i)).not.toBeInTheDocument();
    // os dados digitados são preservados
    expect(screen.getByLabelText(/^Nome/)).toHaveValue("Maria Souza");
  });

  it("trata falha de rede e limite de tentativas", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new TypeError("offline"));
    render(<ContactForm deliveryEnabled channels={[]} />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /enviar mensagem/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/verifique sua internet/i);

    spy.mockResolvedValueOnce(new Response(JSON.stringify({ ok: false, code: "rate_limited" }), { status: 429 }));
    await user.click(screen.getByRole("button", { name: /enviar mensagem/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/muitas tentativas/i));
  });

  it("indica carregamento e evita envio duplo", async () => {
    const user = userEvent.setup();
    let resolve!: (r: Response) => void;
    const spy = vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise((r) => (resolve = r)));
    render(<ContactForm deliveryEnabled channels={[]} />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /enviar mensagem/i }));

    const button = screen.getByRole("button", { name: /enviando/i });
    expect(button).toBeDisabled();
    expect(screen.getByTestId("contact-form")).toHaveAttribute("aria-busy", "true");
    expect(spy).toHaveBeenCalledTimes(1);
    await act(async () => resolve(new Response(JSON.stringify({ ok: true, code: "sent" }), { status: 200 })));
  });

  it("recebe as áreas escolhidas no esboço de soluções", async () => {
    render(<ContactForm deliveryEnabled channels={[]} />);
    act(() => {
      window.dispatchEvent(new CustomEvent(PREFILL_EVENT, { detail: { areas: ["Estoque", "Agendamentos"] } }));
    });
    expect(screen.getByLabelText(/necessidade do seu negócio/)).toHaveValue(
      "Gostaria de conversar sobre um sistema para organizar: Estoque e Agendamentos.\n\nHoje, no meu negócio, ",
    );
  });
});
