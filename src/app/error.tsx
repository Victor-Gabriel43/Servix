"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="conteudo" className="flex min-h-dvh items-center">
      <div className="container-page py-24">
        <p className="eyebrow">
          <span className="text-accent">Erro</span>
          Algo não saiu como esperado
        </p>
        <h1 className="mt-6 max-w-2xl text-title font-semibold">Não foi possível carregar esta página.</h1>
        <p className="mt-5 max-w-lg text-lead text-muted">Tente novamente em alguns instantes.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="btn btn-primary">
            <RotateCcw className="size-4" aria-hidden="true" />
            Tentar novamente
          </button>
          <Link href="/" className="btn btn-ghost">
            Ir para o início
          </Link>
        </div>
      </div>
    </main>
  );
}
