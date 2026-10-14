import { ArrowRight, ArrowDown } from "lucide-react";

import { hero } from "@/content/home";
import { SystemStack } from "@/components/visual/SystemStack";
import { SystemStackFallback } from "@/components/visual/SystemStackFallback";

export function Hero() {
  return (
    <section id="inicio" aria-labelledby="hero-title" className="relative isolate overflow-hidden pt-24 md:pt-28">
      {/* Fundo: grade técnica com máscara radial e brilho seletivo atrás do visual */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_70%_40%,black,transparent_75%)]" />
        <div className="absolute right-[-10%] top-[8%] size-[42rem] max-w-[120vw] rounded-full bg-[radial-gradient(circle,rgb(66_217_255/0.13),transparent_62%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
      </div>

      <div className="container-page grid items-center gap-6 pb-16 md:pb-24 lg:min-h-[calc(100svh-7rem)] lg:grid-cols-[1.15fr_1fr] lg:gap-6">
        <div className="relative z-10 max-w-2xl">
          <p className="eyebrow enter" style={{ "--delay": "0ms" } as React.CSSProperties}>
            {hero.eyebrow}
          </p>

          <h1
            id="hero-title"
            className="enter-text mt-6 text-display font-semibold text-fg"
            style={{ "--delay": "60ms" } as React.CSSProperties}
          >
            {hero.titleStart}{" "}
            <span className="bg-gradient-to-r from-accent via-accent-strong to-fg bg-clip-text text-transparent">
              {hero.titleHighlight}
            </span>
          </h1>

          <p
            className="enter-text mt-7 max-w-xl text-lead text-muted"
            style={{ "--delay": "160ms" } as React.CSSProperties}
          >
            {hero.lead}
          </p>

          <div
            className="enter mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ "--delay": "260ms" } as React.CSSProperties}
          >
            <a href={hero.primaryCta.href} className="btn btn-primary">
              {hero.primaryCta.label}
              <ArrowRight className="btn-icon size-4" aria-hidden="true" />
            </a>
            <a href={hero.secondaryCta.href} className="btn btn-ghost">
              {hero.secondaryCta.label}
              <ArrowDown className="size-4 text-muted" aria-hidden="true" />
            </a>
          </div>

          <ul
            className="enter mt-12 grid gap-3 border-t border-line pt-6 font-mono text-xs text-subtle sm:grid-cols-3 sm:gap-4"
            style={{ "--delay": "380ms" } as React.CSSProperties}
            aria-label="Como a Servix trabalha"
          >
            {hero.highlights.map((item) => (
              <li key={item} className="flex items-start gap-2.5 leading-relaxed">
                <span aria-hidden="true" className="mt-[0.45em] size-1.5 shrink-0 rotate-45 bg-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <figure
          className="enter relative -mx-5 aspect-[6/5] max-h-[38rem] sm:aspect-square w-[calc(100%+2.5rem)] sm:mx-auto sm:w-full sm:max-w-[34rem] lg:max-w-none"
          style={{ "--delay": "120ms" } as React.CSSProperties}
        >
          <SystemStack>
            <SystemStackFallback />
          </SystemStack>
          <figcaption className="sr-only">
            Ilustração: módulos dispersos se encaixam em três camadas — dados, processos e interface —
            representando a organização dos processos de um negócio em um sistema.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
