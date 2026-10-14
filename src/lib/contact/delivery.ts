import "server-only";

import type { ValidContact } from "./validation";

/**
 * Entrega das mensagens do formulário por e-mail, via API HTTP do Resend
 * (https://resend.com). Nenhum dado é armazenado pelo site: a mensagem é
 * repassada ao e-mail comercial configurado e descartada da memória.
 *
 * Variáveis necessárias (servidor apenas — nunca use o prefixo NEXT_PUBLIC_):
 *   RESEND_API_KEY      chave de API do Resend
 *   CONTACT_TO_EMAIL    caixa que recebe as mensagens
 *   CONTACT_FROM_EMAIL  remetente em um domínio verificado no Resend
 */

export interface DeliveryConfig {
  apiKey: string;
  to: string;
  from: string;
}

export function getDeliveryConfig(env: NodeJS.ProcessEnv = process.env): DeliveryConfig | null {
  const apiKey = env.RESEND_API_KEY?.trim();
  const to = env.CONTACT_TO_EMAIL?.trim();
  const from = env.CONTACT_FROM_EMAIL?.trim();
  if (!apiKey || !to || !from) return null;
  return { apiKey, to, from };
}

export function isContactDeliveryConfigured(): boolean {
  return getDeliveryConfig() !== null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildEmail(data: ValidContact) {
  const subject = `Novo contato pelo site — ${data.name}${data.company ? ` (${data.company})` : ""}`;
  const rows: [string, string][] = [
    ["Nome", data.name],
    ["Empresa", data.company || "—"],
    [data.contactKind === "email" ? "E-mail" : "Telefone", data.contact],
  ];

  const text = [
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Necessidade:",
    data.message,
  ].join("\n");

  const html = `
    <div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#111">
      <h2 style="margin:0 0 16px">Novo contato pelo site</h2>
      <table style="border-collapse:collapse;margin-bottom:16px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:4px 16px 4px 0;color:#555">${escapeHtml(k)}</td><td style="padding:4px 0"><strong>${escapeHtml(v)}</strong></td></tr>`,
          )
          .join("")}
      </table>
      <p style="margin:0 0 4px;color:#555">Necessidade:</p>
      <p style="margin:0;white-space:pre-wrap">${escapeHtml(data.message)}</p>
    </div>`;

  return { subject, text, html };
}

export type DeliveryResult = { ok: true } | { ok: false; reason: "not_configured" | "provider_error" };

export async function deliverContact(
  data: ValidContact,
  config: DeliveryConfig | null = getDeliveryConfig(),
  fetchImpl: typeof fetch = fetch,
): Promise<DeliveryResult> {
  if (!config) return { ok: false, reason: "not_configured" };

  const { subject, text, html } = buildEmail(data);

  try {
    const response = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: [config.to],
        subject,
        text,
        html,
        ...(data.contactKind === "email" ? { reply_to: data.contact } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error("[contact] Falha no provedor de e-mail:", response.status);
      return { ok: false, reason: "provider_error" };
    }
    return { ok: true };
  } catch (error) {
    console.error("[contact] Erro ao enviar e-mail:", error instanceof Error ? error.name : "unknown");
    return { ok: false, reason: "provider_error" };
  }
}
