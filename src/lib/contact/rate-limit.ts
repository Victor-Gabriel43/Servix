/**
 * Limitador de requisições em memória (janela deslizante simples).
 *
 * Limitação conhecida: em ambientes serverless com várias instâncias, cada
 * instância mantém seu próprio contador. Para produção com tráfego relevante,
 * substitua por um armazenamento compartilhado (ex.: Redis/Upstash) ou pelo
 * firewall da plataforma de hospedagem. Veja o README (Integrações pendentes).
 */

export interface RateLimiter {
  /** Retorna `true` se a requisição pode prosseguir. */
  check(key: string, now?: number): boolean;
}

export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 5000,
}: {
  limit: number;
  windowMs: number;
  maxKeys?: number;
}): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    check(key, now = Date.now()) {
      const windowStart = now - windowMs;
      const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);

      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }

      recent.push(now);
      hits.delete(key);
      hits.set(key, recent);

      // Evita crescimento indefinido: descarta as chaves mais antigas.
      if (hits.size > maxKeys) {
        const oldest = hits.keys().next().value;
        if (oldest !== undefined) hits.delete(oldest);
      }
      return true;
    },
  };
}
