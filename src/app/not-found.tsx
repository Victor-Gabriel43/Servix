import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main id="conteudo" className="relative isolate flex min-h-dvh items-center overflow-hidden">
      <div
        aria-hidden="true"
        className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent_75%)]"
      />
      <div className="container-page flex flex-col items-start py-24">
        <Link href="/" aria-label="Servix — início" className="inline-flex items-center gap-2.5">
          <Logo className="h-11 w-auto text-fg" />
        </Link>
        <p className="eyebrow mt-16">
          <span className="text-accent">404</span>
          Página não encontrada
        </p>
        <h1 className="mt-6 max-w-2xl text-title font-semibold">Este endereço não leva a nenhuma página.</h1>
        <p className="mt-5 max-w-lg text-lead text-muted">
          O link pode estar incorreto ou a página pode ter mudado de lugar.
        </p>
        <Link href="/" className="btn btn-primary mt-10">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para o início
        </Link>
      </div>
    </main>
  );
}
