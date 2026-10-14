import "server-only";

import { deliverContact, getDeliveryConfig, type DeliveryConfig } from "./delivery";
import { createRateLimiter, type RateLimiter } from "./rate-limit";
import { validateContact, type ContactErrors } from "./validation";

export type ContactResponseCode =
  | "sent"
  | "invalid"
  | "rate_limited"
  | "forbidden"
  | "unsupported"
  | "too_large"
  | "not_configured"
  | "provider_error";

export interface ContactResponseBody {
  ok: boolean;
  code: ContactResponseCode;
  errors?: ContactErrors;
}

const MAX_BODY_BYTES = 10_000;

const defaultLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

function json(body: ContactResponseBody, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "anonymous";
}

/** Rejeita envios de outros sites (CSRF simples baseado no cabeçalho Origin). */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // clientes sem Origin (ex.: curl) seguem para as demais proteções
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export interface HandlerDeps {
  limiter?: RateLimiter;
  config?: DeliveryConfig | null;
  fetchImpl?: typeof fetch;
}

export async function handleContactRequest(
  request: Request,
  { limiter = defaultLimiter, config = getDeliveryConfig(), fetchImpl = fetch }: HandlerDeps = {},
): Promise<Response> {
  if (!isSameOrigin(request)) return json({ ok: false, code: "forbidden" }, 403);

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ ok: false, code: "unsupported" }, 415);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json({ ok: false, code: "too_large" }, 413);

  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    payload = parsed as Record<string, unknown>;
  } catch {
    return json({ ok: false, code: "invalid" }, 400);
  }

  if (!limiter.check(clientKey(request))) {
    return json({ ok: false, code: "rate_limited" }, 429);
  }

  // Campo-armadilha invisível para pessoas: se preenchido, é um robô.
  // Responde como sucesso para não ensinar o robô a contornar a proteção.
  if (typeof payload.website === "string" && payload.website.trim() !== "") {
    return json({ ok: true, code: "sent" }, 200);
  }

  const result = validateContact(payload);
  if (!result.ok) return json({ ok: false, code: "invalid", errors: result.errors }, 400);

  const delivery = await deliverContact(result.data, config, fetchImpl);
  if (!delivery.ok) {
    return delivery.reason === "not_configured"
      ? json({ ok: false, code: "not_configured" }, 503)
      : json({ ok: false, code: "provider_error" }, 502);
  }

  return json({ ok: true, code: "sent" }, 200);
}
