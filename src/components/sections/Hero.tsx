import { ArrowDown, ArrowRight } from "lucide-react";

import { hero } from "@/content/home";
import { BrandMark3D } from "@/components/visual/BrandMark3D";
import { BrandMarkFallback } from "@/components/visual/BrandMarkFallback";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

/** Divide o texto em palavras para a revelação escalonada do título. */
function Words({ text, from, className }: { text: string; from: number; className?: string }) {
  return text.split(" ").map((word, i) => (
    <span key={`${word}-${i}`} className={`word inline-block ${className ?? ""}`} style={delay(from + i * 30)}>
      {word}
      {" "}
    </span>
  ));
}

export function Hero() {
  const startWords = hero.titleStart.split(" ").length;

  return (
    <section id="inicio" aria-labelledby="hero-title" className="relative isolate overflow-hidden pt-28 md:pt-36">
      {/* Fundo: facho de luz vindo do topo, grade de pontos e horizonte */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-beam absolute left-1/2 top-0 h-[44rem] w-[min(90rem,180vw)] -translate-x-1/2" />
        <div className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_70%_40%,black,transparent_75%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      <div className="container-page grid items-center gap-4 pb-20 md:pb-28 lg:min-h-[calc(100svh-9rem)] lg:grid-cols-[1.2fr_1fr] lg:gap-8">
        <div className="relative z-10 max-w-2xl">
          <a href="#solucoes" className="pill enter" style={delay(0)}>
            <span aria-hidden="true" className="pulse-ring size-1.5 rounded-full bg-accent" />
            {hero.eyebrow}
            <ArrowRight className="size-3.5 text-subtle transition-transform duration-300 group-hover/pill:translate-x-0.5" aria-hidden="true" />
          </a>

          <h1 id="hero-title" className="mt-8 text-display font-semibold">
            <Words text={hero.titleStart} from={80} className="text-gradient" />
            <Words text={hero.titleHighlight} from={80 + startWords * 30} className="text-gradient-accent" />
          </h1>

          <p className="enter-text mt-7 max-w-xl text-lead text-muted" style={delay(240)}>
            {hero.lead}
          </p>

          <div className="enter mt-10 flex flex-col gap-3 sm:flex-row sm:items-center" style={delay(340)}>
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
            className="enter mt-14 grid gap-3 font-mono text-xs text-subtle sm:grid-cols-3 sm:gap-6"
            style={delay(440)}
            aria-label="Como a Servix trabalha"
          >
            {hero.highlights.map((item, i) => (
              <li key={item} className="flex items-start gap-2.5 leading-relaxed">
                <span aria-hidden="true" className="text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <figure
          className="enter-mark relative -order-1 mx-auto -mt-6 mb-2 aspect-square w-full max-w-[17rem] sm:max-w-[26rem] lg:order-none lg:m-0 lg:mx-auto lg:max-w-[38rem]"
          style={delay(150)}
        >
          {/* Halo e anel orbital atrás da marca */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgb(66_217_255/0.22),rgb(255_255_255/0.06)_38%,transparent_68%)] blur-2xl" />
            <div className="orbit absolute inset-[4%] rounded-full" />
            <div className="orbit orbit-slow absolute inset-[16%] rounded-full" />
          </div>
          <BrandMark3D>
            <BrandMarkFallback />
          </BrandMark3D>
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 text-center font-mono text-[0.7rem] uppercase tracking-[0.2em] text-subtle">
            <span aria-hidden="true" className="hidden motion-reduce:hidden lg:inline">
              Arraste para girar
            </span>
            <span className="sr-only">Marca Servix em 3D, com um pulso de dados percorrendo o contorno do S.</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
